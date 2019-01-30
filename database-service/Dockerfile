## Pull the mysql:5.7 image
FROM mysql:5.7

# database = test and password for root = password
ENV MYSQL_DATABASE=app \
    MYSQL_ROOT_PASSWORD=root

# when container will be started, we'll have `test` database created with this schema
COPY ./../database.sql /docker-entrypoint-initdb.d/

EXPOSE 3306