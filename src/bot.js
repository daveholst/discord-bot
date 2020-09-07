require('dotenv').config();

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

// client.on('message',(message) => {
//   if (message.author.bot) return;
//   console.log(`[${message.author.tag}]:${message.content}`);
//   if (message.content === 'hello') {
//     // message.reply('hello there!');
//     message.channel.send('I\'m here')
//   }
// })

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
      hass.templates.render('Current unRAID CPU usage **{{ states("sensor.glances_cpu_used") }}%** @ **{{ states("sensor.glances_tdie_temp") }}°C**. Case Temp **{{ states("sensor.server_temp")}}°C**. RAM Usage **{{ states("sensor.glances_ram_used_percent") }}%**. ')
        .then(res => message.channel.send(res))
        .catch(err => console.error(err));

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