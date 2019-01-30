# ExpressJS + EJS + MySQL + Passport + GitHub App

Simple GitHub authentication ExpressJS application using passport-github.

## Installation
```
clone the repo
npm install
edit config.json
npm start
```
## Run it using docker
```
cd database-service/
edit the login/database info in the Dockerfile
sudo docker build -t my-app-db .
sudo docker run -d --publish 3306:3306 --name=my-app-db my-app-db
cd ..
sudo docker build -t my-app .
sudo docker run -d my-app
```


I'll probably edit this later to look fancier.