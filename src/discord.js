'use strict';

const Discord = require('discord.js');
const format = require('string-format');
const ping = require('ping');

const io = require('./io');

/** @type {import('../typings/db')} */
const db = require('../db/db.json');

/** @type {import('../typings/messages')} */
const msg = require('../db/messages.json');

const TRIGGER = '%';
const DISCORD_CATEGORY_LIMIT = 50;
const client = new Discord.Client();

const commands = {
  /** @param {Discord.Message} message */
  async ping (message) {
    const response = await ping.promise.probe('discordapp.com');
    await message.reply(format(msg.app.ping, response.avg));
  },
  /** @param {Discord.Message} message */
  async create (message) {
    if (!msg.guild) return notGuild(message);
    await createChannels(message);
  },
  /** @param {Discord.Message} message */
  nuke (message) {
    // TODO
  }
};

client.on('error', io.error);
client.on('warn', io.warn);

client.on('ready', () => {
  io.info(format(msg.discord.init, client.user.tag));
});

client.on('reconnecting', () => {
  io.log(msg.discord.reconnect);
});

client.on('guildCreate', guild => {
  if (!guild.available) return;
  io.log(format(msg.discord.join, guild.name, guild.id));
});

client.on('message', msg => {
  if (!msg.startsWith(TRIGGER)) return;
  commands[msg.slice(TRIGGER.length)](msg).catch(io.error);
});

exports.init = token => {
  io.log(msg.discord.init);
  return client.login(token).catch(io.fatal);
};

exports.destroy = async () => {
  io.log(msg.discord.final);
  return client.destroy().catch(io.error);
};

/** @param {Discord.Message} message */
function notGuild (message) {
  return message.reply(msg.error.notGuild);
}

/** @param {Discord.Message} message */
async function createChannels (message) {
  await message.channel.send(msg.app.run);

  /** @type {{ [x: string]: { length: number, last: Discord.CategoryChannel } }} */
  const continents = {};

  for (const item in db.continets) {
    continents[item] = {
      length: 0,
      last: null
    };
  }

  for (const item in db.countries) {
    const continent = continents[db.countries[item].continent];

    if (continent.length % DISCORD_CATEGORY_LIMIT === 0) {
      continent.last = await message.guild.createChannel(db.continents[db.countries[item].continent].name, 'category');
    }

    const channel = await message.guild.createChannel(db.countries[item].name, 'text');

    channel.setParent(continent.last);
  }
}
