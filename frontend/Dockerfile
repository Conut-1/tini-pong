FROM nginx

RUN apt-get update && \
    apt-get install -y openssl npm

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf
COPY tools/entrypoint.sh /entrypoint.sh
COPY ./index.html /var/www/html/index.html
COPY ./package-lock.json /var/www/html/package-lock.json
COPY ./package.json /var/www/html/package.json

RUN cd /var/www/html && npm install

COPY ./src /var/www/html/src

RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
