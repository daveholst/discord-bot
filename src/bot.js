require("dotenv").config();
// bring in the users 'database' <- aka. jank text files
const fs = require("fs");
const userFilePath = "./src/users.json";

// check if users.json exists
// if (!fs.existsSync(userFilePath)) {
//   fs.writeFile(
//     userFilePath,
//     JSON.stringify([{ test: "test" }]),
//     "utf8",
//     (err) => {
//       if (err) {
//         console.error("Error Writing new users.json :: " + err);
//       }
//       // file written successfully
//     }
//   );
// }

// const rawUsers = ;
const users = fs.existsSync(userFilePath)
  ? JSON.parse(fs.readFileSync(userFilePath))
  : [];

// bring in new weather module
const { weatherToday, weatherForecast } = require("./ww.js");

//discord connect
const { Client } = require("discord.js");
const client = new Client();
const PREFIX = "!";

//home-assistant connect
const HomeAssistant = require("homeassistant");
const hass = new HomeAssistant({
  // Your Home Assistant host
  // Optional, defaults to http://locahost
  host: "https://hass.holst.solutions",

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
  ignoreCert: false,
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on("ready", () => {
  console.log(`${client.user.username}` + " is ready!");
});
//Required for http/https API request
const http = require("http");
const https = require("https");
const { resolve } = require("path");
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
  return isNaN(dayOfWeek)
    ? null
    : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dayOfWeek];
}

client.on("message", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === "moto") {
      message.channel.send("Dicks = Ca$h Baby!");
    } else if (CMD_NAME === "light") {
      hass.services
        .call(args[0], "light", "office_light")
        .then((res) => console.log("Toggled lights", res))
        .catch((err) => console.error(err));
      message.channel.send("Office Lights Toggled with " + args + " 🙉");
      // .then(res => message.channel.send('Office lights have been toggled!', res));
      // .catch(err => console.error(err));
    } else if (CMD_NAME === "status") {
      const newStatus = args.join(" ");
      client.user.setActivity(newStatus);
    } else if (CMD_NAME === "weather") {
      hass.templates
        .render(
          'Current Dawesville temperature is **{{ states("sensor.outside_temperature")}}°C**. The wind is gusting **{{ states("sensor.wind_speed_gust")}} km/h** from the **{{ states("sensor.mandurah_wind_direction")}}**. Today we have had **{{ states("sensor.rain_today")}} mm** of rain.'
        )
        .then((res) => message.channel.send(res))
        .catch((err) => console.error(err));
      // hass.states.get('sensor', 'outside_temperature')
      //   .then(res => console.log('Got Temp', res))
      //   .catch(err => console.error(err))
      // message.channel.send(outsideTemp);
      // console.log(outsideTemp);
    } else if (CMD_NAME === "server") {
      hass.templates
        .render(
          'Current unRAID CPU usage **{{ states("sensor.glances_cpu_used") }}%** @ **{{ states("sensor.glances_tdie_temperature") }}°C**. Case Temp **{{ states("sensor.server_temp")}}°C**. RAM Usage **{{ states("sensor.glances_ram_used_percent") }}%**. '
        )
        .then((res) => message.channel.send(res))
        .catch((err) => console.error(err));
    } else if (CMD_NAME === "ww") {
      let postCode = args[0];
      const userId = message.author.id;
      // check database for default if no args passed
      if (!postCode) {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          if (userId === user.userId) {
            postCode = user.postcode;
            break;
          } else {
            postCode = "6000";
          }
        }
      }
      // get data and build message + sender
      const weatherMessage = async () => {
        const w = await weatherToday(postCode, wwToken);
        let weatherMsg = `**${w.stationName}** current conditions - **${w.currentTemp}°C** @  **${w.currentHumidity}%** humidity. Wind is **${w.windSpeed}km/h** from the **${w.windDir}**. Rainfall today **${w.rainTotal}mm**. Forecast for today, **${w.forecastWords}** | **${w.forecastMax}°C** / **${w.forecastMin}°C** |. **${w.rainChance}%** chance of **${w.rainRangeStart} ${w.rainRangeDivide} ${w.rainRangeEnd}mm** of rain. `;
        message.channel.send(weatherMsg);

        console.log(w);
      };
      weatherMessage();
    } else if (CMD_NAME === "wwf") {
      let postCode = args[0];
      const userId = message.author.id;
      // if no args passed, check if a default lives on the database
      if (!postCode) {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          if (userId === user.userId) {
            postCode = user.postcode;
            break;
          } else {
            postCode = "6000";
          }
        }
      }
      const forecastMessage = async () => {
        const f = await weatherForecast(postCode, wwToken);
        let forecastMsg = `Forecast for **${f[0]}**::\n**Today**: ${f[1].description} | Min: ${f[1].minTemp}°C | Max: ${f[1].maxTemp}°C | Rainfall: ${f[1].rain}mm @ ${f[1].rainChance}%\n**Tomorrow:** ${f[2].description} | Min: ${f[2].minTemp}°C | Max: ${f[2].maxTemp}°C | Rainfall: ${f[2].rain}mm @ ${f[2].rainChance}%\n**${f[3].day}:** ${f[3].description} | Min: ${f[3].minTemp}°C | Max: ${f[3].maxTemp}°C | Rainfall: ${f[3].rain}mm @ ${f[3].rainChance}%\n**${f[4].day}:** ${f[4].description} | Min: ${f[4].minTemp}°C | Max: ${f[4].maxTemp}°C | Rainfall: ${f[4].rain}mm @ ${f[4].rainChance}%\n**${f[5].day}:** ${f[5].description} | Min: ${f[5].minTemp}°C | Max: ${f[5].maxTemp}° | Rainfall: ${f[5].rain}mm @ ${f[5].rainChance}% `;
        message.channel.send(forecastMsg);
        console.log(f);
      };
      forecastMessage();
    } else if (CMD_NAME === "beer") {
      let beerFridgeRes = "";
      let happyMessage = "";
      const happyHour = 16.0;
      const date = new Date();
      // curent minutes as fraction of an hour
      const currentMin = parseInt(date.getMinutes()) / 60;
      const currentHour = parseInt(date.getHours()) + currentMin;
      const fetchBeerFridge = async () => {
        beerFridgeRes = await hass.templates.render(
          'The beer fridge is **{{ states("sensor.shed_fridge") }}°C** and'
        );
        // console.log(beer1);
        if (currentHour >= happyHour) {
          happyMessage = " it's Happy Hour! 🍻";
        } else {
          //calc time left til happy hour
          let timeLeftRaw = happyHour - currentHour;
          console.log(timeLeftRaw);
          // get hours
          const hoursLeft = Math.floor(timeLeftRaw);
          // get Minutes
          const minsLeft = Math.floor((timeLeftRaw - hoursLeft * 60) * 60);
          console.log(minsLeft);
          happyMessage = `it's ${hoursLeft} hours and ${minsLeft} minutes til happy hour. 😭 `;
        }

        const beerMessage = `${beerFridgeRes} ${happyMessage}`;
        message.channel.send(beerMessage);
      };
      fetchBeerFridge();
      // console.log(happyHour);
      // console.log(currentHour);

      // (isItHappyHour());
    } else if (CMD_NAME === "swl") {
      const userName = message.author.username;
      const userId = message.author.id;
      const postcode = args[0];
      // console.log(message);
      // Nothing in array ?
      if (users.length === 0) {
        const userDetails = {
          username: userName,
          userId: userId,
          postcode: postcode,
        };
        users.push(userDetails);
        fs.writeFile(
          "./src/users.json",
          JSON.stringify(users, null, 2),
          (err) =>
            err
              ? console.log(err)
              : console.log("Blank DB - Added New User - DB Write Success")
        );
        return;
      }

      // find user and see if it exists & add
      let userUpdated = false;
      users.forEach((user) => {
        if (userId === user.userId) {
          user.postcode = postcode;
          fs.writeFile(
            "./src/users.json",
            JSON.stringify(users, null, 2),
            (err) =>
              err
                ? console.log(err)
                : console.log("Updated User - DB Write Success")
          );
          userUpdated = true;
          // if no user, make one
        }
      });
      // array has length but user is not in the DB
      if (userUpdated === false) {
        const userDetails = {
          username: userName,
          userId: userId,
          postcode: postcode,
        };
        users.push(userDetails);
        fs.writeFile(
          "./src/users.json",
          JSON.stringify(users, null, 2),
          (err) =>
            err
              ? console.log(err)
              : console.log("Added New User - DB Write Success")
        );
      }

      // if user doesnt exist, create

      console.log(
        `User: ${userName} ID: ${userId} wants to set postcode to ${postcode} `
      );
      console.log(users);
    }
  }
});

client.on("guildMemberAdd", (member) => {
  let guild = member.guild; // Reading property `guild` of guildmember object.
  let memberTag = member.user.tag; // GuildMembers don't have a tag property, read property user of guildmember to get the user object from it
  if (guild.systemChannel) {
    // Checking if it's not null
    guild.systemChannel.send(
      "Hi" + memberTag + ", welcome to the S|{raWn server!"
    );
  }
});
