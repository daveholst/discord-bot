# S|{raWn Discod Bot

My first attempt at a discord bot for the lovely folks over at S|{rawn Gaming.

**Required Parameters**

Requires dotenv to be installed and a .env file containing the following:

DISCORDJS_BOT_TOKEN=9847wwe8989fs98sgf
HASS_TOKEN=095ty09409tdghdg-0
WW_TOKEN=#234ewrewrfef@#\$$##$4

## Currently Working

- !server - displays unRAID server stats
- !status <new bot status> - sets the status of the bot
- !light <command> - sets the state of the office light (turn_on,turn_off,toggle)
- !weather - displays weather from weewx via homeassistant
- ~~!bom <postcode> - displays weather from bom. is a bit buggy matching postcode to station id.~~
- ~~!bomid <stationid> <STATE> eg. !bomid 066214 NSW - bom weather with station id used.~~
- !ww <postcode> or <place_name> eg !bom 6255 or !bom albany - return willy weather + todays forecast.
- !wwf <postcode> or <place_name> to get 4 day forcast

## TODO

- [x] Custom welcome message on server join
- [x] weather command - off my station !weather
- [x] weather command - !ww for other users that pulls data from BOM / WW API.
- [] :bug:BUG - incorrect town name crashes server ie. bailingup not Balingup..
- [x] !wwf <postcode> forcast command
      ~~ - [x] :bug:BUG - undefined weather reading now returns 'N/A' ~~
      ~~ - [x] :bug:BUG - doesnt work with NSW postcodes - result of aupostcode.js file not matching bom site id#. ~~
      ~~ - [x] :bug:BUG - can't get the TS file to update above. write own updater or indexer? ~~
- [ ] Only certain roles can control home assistant
- [x] :fire:Change weather to be faster and use willyWeather
- [ ] Individual welcome messages for users
- [ ] Spotify now playing command
- [ ] Announcements via webooks
- [ ] !3d print with a image from 3dprinter + status.
- [ ] dockerize and deploy on server
- [ ] add a !wwf <postcode/location> <day>
- [ ] magic !8ball fortune teller style thingo
- [ ] .env docker path link.
