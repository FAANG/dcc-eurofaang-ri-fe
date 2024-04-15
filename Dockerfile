## ORIGINAL Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20.12.1 as build-stage
WORKDIR /app
COPY eurofaang-ri/package*.json /app/
RUN npm install
#
COPY ./eurofaang-ri /app
CMD ["sleep", "9999999999"]
RUN npm run build
#
## Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
##Copy ci-dashboard-dist
COPY --from=build-stage /app/dist/eurofaang-ri/  /usr/share/nginx/html/
##Copy default nginx configuration
COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
