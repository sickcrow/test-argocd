#Build ENV
FROM registry-devops.agea.com.ar/services/node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm update
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
#RUN CI=true npm test
RUN npm run build

#Prod ENV
FROM registry-devops.agea.com.ar/services/nginx:stable-alpine
MAINTAINER "K8S Agea" "k8s@agea.com.ar"
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx
COPY kioscos.conf /etc/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]