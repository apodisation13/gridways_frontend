export interface StackFrame {
  function?: string
  file?: string
  line?: number
  column?: number
  text?: string
}

// Best-effort parsing of browser stacks, not source-map resolution.
export function parseStack(stack: string): StackFrame[] {
  return stack
    .split(/\r?\n/)
    .slice(0, 21)
    .flatMap<StackFrame>((text, index) => {
      const trimmed = text.trim()
      if (!trimmed) return []
      let location = trimmed
      let functionName: string | undefined
      if (trimmed.startsWith("at ")) {
        location = trimmed.slice(3)
        const named = location.match(/^(.*?) \((.*)\)$/)
        if (named) {
          functionName = named[1]
          location = named[2]
        }
      } else if (trimmed.includes("@")) {
        const separator = trimmed.indexOf("@")
        functionName = trimmed.slice(0, separator) || undefined
        location = trimmed.slice(separator + 1)
      } else if (index === 0 && !/:\d+(?::\d+)?$/.test(trimmed)) {
        return [] // Error name/message is already stored separately.
      }
      const match = location.match(/^(.*?):(\d+)(?::(\d+))?$/)
      if (!match) return [{ text: trimmed.slice(0, 500) }]
      // Loader prefixes and Vue query parameters obscure the actual source path.
      let file = match[1]
      if (file.startsWith("webpack-internal:///")) {
        file = file.slice("webpack-internal:///".length).split("!").pop()!
      }
      file = file.split(/[?#]/)[0].replace(/^\.\//, "")
      return [
        {
          function: functionName,
          file,
          line: Number(match[2]),
          column: match[3] ? Number(match[3]) : undefined,
        },
      ]
    })
}
