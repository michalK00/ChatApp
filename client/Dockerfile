FROM node:22-alpine as build

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --omit=dev

FROM nginx:latest

COPY ./.nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build app/dist/ztw-chat-frontend/browser /usr/share/nginx/html

EXPOSE 80

