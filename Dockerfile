FROM node:20-alpine AS build-stage


# Принимаем аргументы сборки
ARG VUE_APP_CUSTOM_ENV
ARG VUE_APP_DOMAIN
ARG VUE_APP_TG
ARG VUE_APP_EMAIL
ARG VUE_APP_ADDRESS
ARG VUE_APP_INN
ARG VUE_APP_PHONE

# Превращаем их в переменные окружения для npm run build
ENV VUE_APP_CUSTOM_ENV=$VUE_APP_CUSTOM_ENV
ENV VUE_APP_DOMAIN=$VUE_APP_DOMAIN
ENV VUE_APP_TG=$VUE_APP_TG
ENV VUE_APP_EMAIL=$VUE_APP_EMAIL
ENV VUE_APP_ADDRESS=$VUE_APP_ADDRESS
ENV VUE_APP_INN=$VUE_APP_INN
ENV VUE_APP_PHONE=$VUE_APP_PHONE


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
