FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps && npm install react@18.3.1 react-dom@18.3.1
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Set default value for BACKEND_HOST if not provided
ENV BACKEND_HOST=app-calculate-open-source-application-wc8qgt

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
