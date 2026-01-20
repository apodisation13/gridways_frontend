FROM node:16-alpine AS build-stage


# Принимаем аргументы сборки
ARG VUE_APP_CUSTOM_ENV
ARG VUE_APP_DOMAIN

# Превращаем их в переменные окружения для npm run build
ENV VUE_APP_CUSTOM_ENV=$VUE_APP_CUSTOM_ENV
ENV VUE_APP_DOMAIN=$VUE_APP_DOMAIN


# делаем каталог 'app' текущим рабочим каталогом
WORKDIR /app

# копируем оба 'package.json' и 'package-lock.json' (если есть)
COPY package*.json ./

# устанавливаем зависимости проекта
RUN npm install

# копируем файлы и каталоги проекта в текущий рабочий каталог (т.е. в каталог 'app')
COPY . .

# принимаем аргумент из экшена билда, из секретов и записываем его в этот файл
#ARG VUE_APP_API_URL
#RUN echo "VUE_APP_API_URL=$VUE_APP_API_URL" > .env.production

# собираем приложение для production с минификацией
RUN npm run build

EXPOSE 8080


# этап production (production-stage)
FROM nginx:stable-alpine AS production-stage
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /var/www
CMD ["nginx", "-g", "daemon off;"]
