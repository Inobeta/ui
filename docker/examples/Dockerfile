FROM nginx:1.28-alpine

COPY dist/ui/browser/ /usr/share/nginx/html/

COPY docker/examples/assets/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
