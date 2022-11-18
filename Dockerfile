FROM node:16

#create the dir
WORKDIR /usr/src/app

#set Timezone
ENV TZ=Australia/Perth
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

#copy and install our bot
COPY package*.json ./
RUN npm install

#copy bot files
COPY . .

#start bot
CMD ["node", "src/bot.js"]
