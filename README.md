# S|{raWn Discod Bot

My first attempt at a discord bot for the lovely folks over at S|{rawn Gaming.

**Required Parameters**

Requires dotenv to be installed and a .env file containing the following:

DISCORDJS_BOT_TOKEN=9847wwe8989fs98sgf
HASS_TOKEN=095ty09409tdghdg-0

## Currently Working

* !status <new bot status> - sets the status of the bot
* !light <command> - sets the state of the office light (turn_on,turn_off,toggle)

## TODO 

- [x] Custom welcome message on server join
- [x] weather command - off my station !weather
- [ ] weather command - for other users that pulls data from BOM / WW API.

- [ ] Only certain roles can control home assistant 
- [ ] Individual welcome messages for users
- [ ] Spotify now playing command
- [ ] Announcements via webooks  
- [ ] !3d print with a image from 3dprinter + status. 
- [ ] dockerize and deploy on server