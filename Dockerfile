FROM node:12

#create the dir
WORKDIR /usr/src/app

#copy and install out bot
COPY package*.json ./
RUN npm install

#copy bot files
COPY . .

#start bot
CMD ["node", "src/bot.js"]