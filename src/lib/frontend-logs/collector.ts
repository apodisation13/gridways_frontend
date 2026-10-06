/* eslint-disable no-console -- Intercept console methods and preserve their original output. */
import { v4 as uuidv4 } from "uuid"
import type { App } from "vue"

import { parseStack, type StackFrame } from "./stack"

type Level = "error" | "warning"
interface Auth {
  token?: string
  user_id?: string | number
  password?: string
  refreshToken?: string
  email?: string
}
interface Options {
  endpoint: string
  environment?: string
  refreshToken: () => Promise<string>
  getAuth: () => Auth
  getContext: () => Record<string, unknown>
}
interface LogEvent {
  event_id: string
  timestamp: string
  level: Level
  source: string
  message: string
  error_name?: string
  truncated?: boolean
  stack_frames?: StackFrame[]
  error_function?: string
  error_file?: string
  error_line?: number
  error_column?: number
  fingerprint: string
  environment?: string
  context: Record<string, unknown>
}

// Keep the diagnostic core, shedding the largest context fields first.
function fitEvent(event: LogEvent) {
  const bytes = (value: unknown) =>
    new TextEncoder().encode(JSON.stringify(value)).length
  if (bytes(event) <= 16_384) return
  event.truncated = true
  const fields = Object.keys(event.context).sort(
    (a, b) => bytes(event.context[b]) - bytes(event.context[a])
  )
  for (const field of fields) {
    delete event.context[field]
    if (bytes(event) <= 16_384) return
  }
  while ((event.stack_frames?.length ?? 0) > 1) {
    event.stack_frames!.pop()
    if (bytes(event) <= 16_384) return
  }
  // Even an unusually long first frame/message must fit (UTF-8 byte limit).
  while (bytes(event) > 16_384) {
    for (const key of [
      "message",
      "error_name",
      "error_function",
      "error_file",
      "environment",
    ] as const) {
      const value = event[key]
      if (value) event[key] = value.slice(0, Math.floor(value.length / 2))
    }
    const first = event.stack_frames?.[0]
    if (first) {
      for (const key of ["function", "file", "text"] as const) {
        const value = first[key]
        if (value) first[key] = value.slice(0, Math.floor(value.length / 2))
      }
    }
  }
}

export function installCollector(app: App, options: Options) {
  if (!options.endpoint) return { reset: () => {} }
  const originalError = console.error.bind(console)
  const originalWarn = console.warn.bind(console)
  let queue: LogEvent[] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  let request: AbortController | undefined
  let generation = 0
  let pausedUntil = 0
  let owner: Auth["user_id"]
  let windowStart = 0
  let count = 0
  let warnings = 0
  let capturing = false
  let seen = new WeakMap<object, number>()
  const duplicates = new Map<string, number>()

  function reset() {
    generation++
    request?.abort()
    request = undefined
    clearTimeout(timer)
    timer = undefined
    queue = []
    duplicates.clear()
    seen = new WeakMap()
    count = warnings = windowStart = pausedUntil = 0
    owner = undefined
  }

  function clean(value: string, auth: Auth, limit: number) {
    let result = value
    for (const secret of [
      auth.token,
      auth.refreshToken,
      auth.password,
      auth.email,
    ]) {
      if (secret) result = result.split(secret).join("[redacted]")
    }
    return result
      .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [redacted]")
      .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[redacted]")
      .replace(
        /((?:password|token|authorization|secret|email)["']?\s*[:=]\s*)[^\s,;}]+/gi,
        "$1[redacted]"
      )
      .replace(/(https?:\/\/[^\s?#]+)[?#][^\s)]+/g, "$1")
      .slice(0, limit)
  }

  async function flush() {
    timer = undefined
    const batch = queue.splice(0, 5)
    if (!batch.length) return
    const currentGeneration = generation
    const controller = new AbortController()
    request = controller
    let timeout = setTimeout(() => controller.abort(), 4000)
    try {
      const auth = { ...options.getAuth() }
      if (!auth.token || auth.user_id !== owner) return
      const body = JSON.stringify({ events: batch })
      const send = (token: string) =>
        fetch(options.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
          body,
        })
      let response = await send(auth.token)
      if (response.status === 401) {
        clearTimeout(timeout)
        if (generation !== currentGeneration || controller.signal.aborted)
          return
        const currentAuth = options.getAuth()
        if (!currentAuth.token || currentAuth.user_id !== auth.user_id) return
        // Another request may have already refreshed the expired token.
        const token =
          currentAuth.token !== auth.token
            ? currentAuth.token
            : await options.refreshToken()
        if (generation !== currentGeneration || controller.signal.aborted)
          return
        const latestAuth = options.getAuth()
        if (!latestAuth.token || latestAuth.user_id !== auth.user_id) return
        timeout = setTimeout(() => controller.abort(), 4000)
        response = await send(token)
      }
      if (!response.ok) throw new Error("Log delivery failed")
    } catch {
      if (generation === currentGeneration) {
        queue = []
        pausedUntil = Date.now() + 60_000
      }
    } finally {
      clearTimeout(timeout)
      if (generation === currentGeneration) {
        request = undefined
        if (queue.length) schedule()
      }
    }
  }

  function schedule() {
    if (!timer && !request)
      timer = setTimeout(() => {
        void flush()
      }, 1000)
  }

  function capture(
    level: Level,
    source: string,
    values: unknown[],
    extra = ""
  ) {
    if (capturing) return
    capturing = true
    try {
      const auth = options.getAuth()
      if (!auth.token) return
      if (owner !== auth.user_id) reset()
      owner = auth.user_id
      const now = Date.now()
      if (now < pausedUntil) return
      const error = values.find(value => value instanceof Error) as
        | Error
        | undefined
      if (error && (seen.get(error) ?? 0) > now) return
      // Never serialize arbitrary console objects (Axios config, store, credentials).
      const message = clean(
        values
          .slice(0, 8)
          .map(value => {
            if (value instanceof Error) return value.message
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            )
              return String(value)
            return "[object omitted]"
          })
          .join(" "),
        auth,
        2000
      )
      const stack = error?.stack ? clean(error.stack, auth, 5000) : undefined
      const frames = stack ? parseStack(stack) : undefined
      const origin = frames?.[0]
      const signature = `${level}|${error?.name ?? ""}|${message}|${stack ?? extra}`
      let hash = 2166136261
      for (let i = 0; i < signature.length; i++)
        hash = Math.imul(hash ^ signature.charCodeAt(i), 16777619)
      const fingerprint = (hash >>> 0).toString(16)
      if ((duplicates.get(fingerprint) ?? 0) > now) return
      if (now - windowStart >= 60_000) {
        windowStart = now
        count = warnings = 0
      }
      if (count >= 10 || (level === "warning" && warnings >= 3)) return
      let context: Record<string, unknown> = {}
      try {
        context = options.getContext()
      } catch {
        /* Partial context is fine. */
      }
      const event: LogEvent = {
        event_id: uuidv4(),
        timestamp: new Date(now).toISOString(),
        level,
        source,
        message,
        error_name: error ? clean(error.name, auth, 100) : undefined,
        stack_frames: frames,
        error_function: origin?.function,
        error_file: origin?.file,
        error_line: origin?.line,
        error_column: origin?.column,
        fingerprint,
        environment: options.environment,
        context: {
          ...context,
          user_id: auth.user_id,
          ...(extra ? { location: clean(extra, auth, 500) } : {}),
        },
      }
      fitEvent(event)
      if (queue.length >= 20) {
        const warningIndex = queue.findIndex(item => item.level === "warning")
        if (level === "warning" || warningIndex < 0) return
        queue.splice(warningIndex, 1)
      }
      if (duplicates.size >= 200)
        duplicates.delete(duplicates.keys().next().value!)
      duplicates.set(fingerprint, now + (level === "error" ? 300_000 : 900_000))
      if (error) seen.set(error, now + 1000)
      count++
      if (level === "warning") warnings++
      queue.push(event)
      schedule()
    } catch {
      /* Diagnostics must never interrupt the game. */
    } finally {
      capturing = false
    }
  }

  console.error = (...values: unknown[]) => {
    originalError(...values)
    capture("error", "console", values)
  }
  console.warn = (...values: unknown[]) => {
    originalWarn(...values)
    capture("warning", "console", values)
  }
  window.addEventListener("error", event => {
    if (event instanceof ErrorEvent)
      capture(
        "error",
        "window",
        [event.error ?? event.message],
        `${event.filename}:${event.lineno}:${event.colno}`
      )
  })
  window.addEventListener("unhandledrejection", event =>
    capture("error", "promise", [event.reason])
  )
  app.config.errorHandler = (error, instance, info) => {
    originalError(error)
    capture(
      "error",
      "vue",
      [error],
      `${instance?.$options.name ?? "component"}: ${info}`
    )
  }
  app.config.warnHandler = (message, instance, trace) => {
    originalWarn(message, trace)
    capture("warning", "vue", [message], instance?.$options.name)
  }
  return { reset }
}
