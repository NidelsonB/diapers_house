FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out/ /usr/share/nginx/html/diapers_house/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
