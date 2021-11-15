FROM httpd:2.4

RUN mkdir -p /usr/local/apache2/conf/sites/
COPY llamadoresdev /usr/local/apache2/htdocs/llamadoresdev/

EXPOSE 80