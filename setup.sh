#!/bin/bash

# move to discord bot
cd ~/discord-bot/

# git pull
git pull

# stop old containers
docker rm $(docker stop $(docker ps -a -q -f ancestor=daveholst/discord-bot))

# build new container

docker build -t daveholst/discord-bot .

# strat new container

sudo docker run -d --restart unless-stopped daveholst/discord-bot

