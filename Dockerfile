FROM nginx
RUN apt-get install -y sed
COPY dist/ui /usr/share/nginx/html
COPY nginx ./nginx
COPY env-start ./env-start
RUN chmod +x env-start
