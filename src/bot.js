require('dotenv').config();
//axios
const axios = require('axios');

//discord connect
const {
  Client
} = require('discord.js');
const client = new Client();
const PREFIX = '!';

//home-assistant connect
const HomeAssistant = require ('homeassistant');
const hass = new HomeAssistant({
  // Your Home Assistant host
  // Optional, defaults to http://locahost
  host: 'https://hass.holst.solutions',

  // Your Home Assistant port number
  // Optional, defaults to 8123
  port: 443,

  // Your long lived access token generated on your profile page.
  // Optional
  token: process.env.HASS_TOKEN,

  // Your Home Assistant Legacy API password
  // Optional
  // password: 'api_password',

  // Ignores SSL certificate errors, use with caution
  // Optional, defaults to false
  ignoreCert: false
});


client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', () => {
  console.log(`${client.user.username}` + ' is ready!');
});
//Required for http/https API request
const http = require('http');
const https = require('https');
const { resolve } = require('path');
const wwToken = process.env.WW_TOKEN;
// let currentWeather = '';




// client.on('message',(message) => {
//   if (message.author.bot) return;
//   console.log(`[${message.author.tag}]:${message.content}`);
//   if (message.content === 'hello') {
//     // message.reply('hello there!');
//     message.channel.send('I\'m here')
//   }
// })

// function to get day of week
function getDayOfWeek(date) {
  const dayOfWeek = new Date(date).getDay();
  return isNaN(dayOfWeek) ? null :
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
}

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === 'moto') {
      message.channel.send('Dicks = Ca$h Baby!');
    }
    else if (CMD_NAME === 'light') {
      hass.services.call(args[0], 'light', 'office_light')
        .then(res => console.log('Toggled lights', res))
        .catch(err => console.error(err));
      message.channel.send('Office Lights Toggled with ' + args + ' 🙉');
      // .then(res => message.channel.send('Office lights have been toggled!', res));
      // .catch(err => console.error(err));
    }
    else if (CMD_NAME === 'status') {
      const newStatus = args.join(' ');
      client.user.setActivity(newStatus);
    }

    else if (CMD_NAME === 'weather') {
      hass.templates.render('Current Dawesville temperature is **{{ states("sensor.outside_temperature")}}°C**. The wind is gusting **{{ states("sensor.wind_speed_gust")}} km/h** from the **{{ states("sensor.ww_wind_direction")}}**. Today we have had **{{ states("sensor.rain_today")}} mm** of rain.')
        .then(res => message.channel.send(res))
        .catch(err => console.error(err));
      // hass.states.get('sensor', 'outside_temperature')
      //   .then(res => console.log('Got Temp', res))
      //   .catch(err => console.error(err))
      // message.channel.send(outsideTemp);
      // console.log(outsideTemp);
    }

    else if (CMD_NAME === 'server') {
      hass.templates.render('Current unRAID CPU usage **{{ states("sensor.glances_cpu_used") }}%** @ **{{ states("sensor.glances_tdie_temperature") }}°C**. Case Temp **{{ states("sensor.server_temp")}}°C**. RAM Usage **{{ states("sensor.glances_ram_used_percent") }}%**. ')
        .then(res => message.channel.send(res))
        .catch(err => console.error(err));
    }


    else if (CMD_NAME === 'ww') {
      const postCode = args[0];
      axios.get(`https://api.willyweather.com.au/v2/${wwToken}/search.json?query=${postCode}`)
        .then(res => {
          console.log(res.data);
          console.log(res.data[0].id);
          const stationID = res.data[0].id;

          axios.all([
            axios.get(`https://api.willyweather.com.au/v2/${wwToken}/locations/${stationID}/weather.json?observational=true`),
            axios.get(`https://api.willyweather.com.au/v2/${wwToken}/weather/summaries.json?ids=${stationID}`),
            axios.get(`https://api.willyweather.com.au/v2/${wwToken}/locations/${stationID}/weather.json?forecasts=rainfall&days=1`)
          ]).then(axios.spread((res1, res2, res3) => {
            let name = res1.data.location.name;
            let temp = res1.data.observational.observations.temperature.temperature;
            let humidity = res1.data.observational.observations.humidity.percentage;
            let wind = res1.data.observational.observations.wind.speed;
            let windDir = res1.data.observational.observations.wind.directionText;
            let rain = res1.data.observational.observations.rainfall.todayAmount;
            let predict = res2.data[0].forecasts.weather.days[0].entries[0].precis;
            let min = res2.data[0].forecasts.weather.days[0].entries[0].min;
            let max = res2.data[0].forecasts.weather.days[0].entries[0].max;
            let preRainProb = res3.data.forecasts.rainfall.days[0].entries[0].probability;
            let preRainStart = res3.data.forecasts.rainfall.days[0].entries[0].startRange;
            if (preRainStart === null) { preRainStart = '';}
            let preRainDivide = res3.data.forecasts.rainfall.days[0].entries[0].rangeDivide;
            let preRainEnd = res3.data.forecasts.rainfall.days[0].entries[0].endRange;


            let currentWeather = `**${name}** current conditions - **${temp}°C** @  **${humidity}%** humidity. Wind is **${wind}km/h** from the **${windDir}**. Rainfall today **${rain}mm**. Forecast for today, **${predict}** | **${max}°C** / **${min}°C** |. **${preRainProb}%** chance of **${preRainStart} ${preRainDivide} ${preRainEnd}mm** of rain. `  ;
            message.channel.send(currentWeather);
          })).catch(err => {
            console.log(err);
          });
        });
    }
    else if (CMD_NAME === 'wwf') {
      const postCode = args[0];
      axios.get(`https://api.willyweather.com.au/v2/${wwToken}/search.json?query=${postCode}`)
        .then(res => {
          // console.log(res.data);
          // console.log(res.data[0].id);
          const stationID = res.data[0].id;

          axios.all([
            axios.get(`https://api.willyweather.com.au/v2/${wwToken}/locations/${stationID}/weather.json?forecasts=weather&days=5`),
            // TODO change one of the below to receive percip forcast ?
            axios.get(`https://api.willyweather.com.au/v2/${wwToken}/locations/${stationID}/weather.json?forecasts=rainfall&days=5`),
            // axios.get(`https://api.willyweather.com.au/v2/${wwToken}/locations/${stationID}/weather.json?forecasts=rainfall&days=1`)
          ]).then(axios.spread((res1, res2) => {
            let name = res1.data.location.name;
            let day1Date = res1.data.forecasts.weather.days[0].entries[0].dateTime;
            let day1Precis = res1.data.forecasts.weather.days[0].entries[0].precis;
            let day1Min = res1.data.forecasts.weather.days[0].entries[0].min;
            let day1Max = res1.data.forecasts.weather.days[0].entries[0].max;
            let day1Rain = res2.data.forecasts.rainfall.days[0].entries[0].rangeCode;
            let day1Chance = res2.data.forecasts.rainfall.days[0].entries[0].probability;
            let day2Date = res1.data.forecasts.weather.days[1].entries[0].dateTime;
            let day2Day = getDayOfWeek(day2Date);
            let day2Precis = res1.data.forecasts.weather.days[1].entries[0].precis;
            let day2Min = res1.data.forecasts.weather.days[1].entries[0].min;
            let day2Max = res1.data.forecasts.weather.days[2].entries[0].max;
            let day2Rain = res2.data.forecasts.rainfall.days[1].entries[0].rangeCode;
            let day2Chance = res2.data.forecasts.rainfall.days[1].entries[0].probability;
            let day3Date = res1.data.forecasts.weather.days[2].entries[0].dateTime;
            let day3Day = getDayOfWeek(day3Date);
            let day3Precis = res1.data.forecasts.weather.days[2].entries[0].precis;
            let day3Min = res1.data.forecasts.weather.days[2].entries[0].min;
            let day3Max = res1.data.forecasts.weather.days[2].entries[0].max;
            let day3Rain = res2.data.forecasts.rainfall.days[2].entries[0].rangeCode;
            let day3Chance = res2.data.forecasts.rainfall.days[2].entries[0].probability;

            let day4Date = res1.data.forecasts.weather.days[3].entries[0].dateTime;
            let day4Day = getDayOfWeek(day4Date);
            let day4Precis = res1.data.forecasts.weather.days[3].entries[0].precis;
            let day4Min = res1.data.forecasts.weather.days[3].entries[0].min;
            let day4Max = res1.data.forecasts.weather.days[3].entries[0].max;
            let day4Rain = res2.data.forecasts.rainfall.days[3].entries[0].rangeCode;
            let day4Chance = res2.data.forecasts.rainfall.days[3].entries[0].probability;

            let day5Date = res1.data.forecasts.weather.days[4].entries[0].dateTime;
            let day5Day = getDayOfWeek(day5Date);
            let day5Precis = res1.data.forecasts.weather.days[4].entries[0].precis;
            let day5Min = res1.data.forecasts.weather.days[4].entries[0].min;
            let day5Max = res1.data.forecasts.weather.days[4].entries[0].max;
            let day5Rain = res2.data.forecasts.rainfall.days[4].entries[0].rangeCode;
            let day5Chance = res2.data.forecasts.rainfall.days[4].entries[0].probability;

            let forecast = `Forecast for **${name}**\n**Today**: ${day1Precis} | Min: ${day1Min}°C | Max: ${day1Max}°C | Rainfall: ${day1Rain}mm @ ${day1Chance}%\n**Tomorrow:** ${day2Precis} | Min: ${day2Min}°C | Max: ${day2Max}°C | Rainfall: ${day2Rain}mm @ ${day2Chance}%\n**${day3Day}:** ${day3Precis} | Min: ${day3Min}°C | Max: ${day3Max}°C | Rainfall: ${day3Rain}mm @ ${day3Chance}%\n**${day4Day}:** ${day4Precis} | Min: ${day4Min}°C | Max: ${day4Max}°C | Rainfall: ${day4Rain}mm @ ${day4Chance}%\n**${day5Day}:** ${day5Precis} | Min: ${day5Min}°C | Max: ${day5Max}° | Rainfall: ${day5Rain}mm @ ${day5Chance}% `  ;
            message.channel.send(forecast);
          })).catch(err => {
            console.log(err);
          });
        });

    }
  }
});

client.on('guildMemberAdd', (member) => {
  let guild = member.guild; // Reading property `guild` of guildmember object.
  let memberTag = member.user.tag; // GuildMembers don't have a tag property, read property user of guildmember to get the user object from it
  if(guild.systemChannel){ // Checking if it's not null
    guild.systemChannel.send('Hi' + memberTag + ', welcome to the S|{raWn server!');
  }
});