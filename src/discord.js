'use strict';

const Discord = require('discord.js');
const format = require('string-format');
const ping = require('ping');

const { Intrupt } = require('./intrupt');
const io = require('./io');

/** @type {import('../typings/db')} */
const db = require('../db/db.json');

/** @type {import('../typings/messages')} */
const msg = require('../db/messages.json');

/** @type {import('../typings/constants')} */
const constants = require('../db/constants.json');

const client = new Discord.Client();
const operations = new Set();

const commands = {
  /** @param {Discord.Message} message */
  async ping (message) {
    const response = await ping.promise.probe(constants.discordUrl);
    await message.reply(format(msg.app.ping, response.avg));
  },
  /** @param {Discord.Message} message */
  async say (message, ...said) {
    await message.channel.send(said.join(constants.delmiter));
  },
  /** @param {Discord.Message} message */
  async create (message) {
    if (!message.guild) return notGuild(message);
    await create(message);
  },
  /** @param {Discord.Message} message */
  async nuke (message) {
    await message.reply(msg.errors.nuke);
    await message.channel.startTyping();
    const arr = message.guild.channels.array();
    const LEN = arr.length;
    for (let i = 0; i < LEN; i++) {
      io.log(format(msg.app.nuke, i + 1, LEN));

      await arr[i].delete();
    }
    await message.channel.stopTyping();
  },
  /** @param {Discord.Message} message */
  async u (message) {
    await message.reply(msg.errors.noU);
  }
};

client.on('error', io.error);
client.on('warn', io.warn);

client.on('ready', () => {
  io.info(format(msg.discord.ready, client.user.tag));
  io.logNull();
});

client.on('reconnecting', () => {
  io.log(msg.discord.reconnect);
});

client.on('guildCreate', guild => {
  if (!guild.available) return;
  io.info(format(msg.discord.join, guild.name, guild.id));
});

client.on('message', message => {
  if (!message.content.startsWith(constants.trigger)) return;
  const cmd = message.content.slice(constants.trigger.length).toLowerCase().split(constants.delmiter);

  if (cmd[0] in commands) {
    commands[cmd[0]](message, ...cmd.slice(1)).catch(io.error);
  } else {
    notCommand(message).catch(io.error);
  }
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
  return message.reply(msg.errors.notGuild);
}

/** @param {Discord.Message} message */
function notCommand (message) {
  const cmd = message.content.slice(constants.trigger.length).toLowerCase();
  return message.reply(format(msg.errors.notCommand, cmd));
}

function handleIntrupt (err) {
  const HANDLED_INTRUPTS = ["pending"];
  if (!(err instanceof Intrupt)) io.error(err);
  if (HANDLED_INTRUPTS.indexOf(err.code) === -1) io.warning(err);
}

/** @param {Discord.Message} message */
async function create (message) {
  await startOperation(message.channel);
  await message.channel.send(msg.app.run);

  /** @type {{ [x: string]: { length: number, last: Discord.CategoryChannel } }} */
  const continents = {};

  for (const item in db.continents) {
    continents[item] = {
      length: 0,
      last: null
    };
  }

  for (const name in db.countries) {
    const item = db.countries[name];
    const continent = continents[item.continent];

    if (continent.length % constants.discordCategoryLimit === 0) {
      continent.last = await message.guild.createChannel(db.continents[item.continent].name, {
        type: 'category'
      });
    }

    await message.guild.createChannel(item.name, {
      type: 'text',
      parent: continent.last
    });

    continent.length++;
  }

  await endOperation(message.channel);
}

/**
 * @param {Discord.TextChannel} channel
 * @throws {Error} Pending operation
 */
async function startOperation (channel) {
  if (operations.has(channel.guild.id)) {
    channel.send(msg.errors.pending);
    throw new Intrupt('PENDING');
  }

  operations.add(channel.guild.id);
  await channel.startTyping();
}

/**
 * @param {Discord.TextChannel} channel
 */
async function endOperation (channel) {
  operations.delete(channel.guild.id);
  await channel.stopTyping();
}
