FROM nginx:1.28-alpine

COPY docker/docs/assets/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/docs/assets/generate-index.sh /docker-entrypoint.d/10-generate-index.sh
COPY docker/docs/assets/index.css /usr/share/nginx/html/assets/index.css

RUN chmod 0755 /docker-entrypoint.d/10-generate-index.sh
