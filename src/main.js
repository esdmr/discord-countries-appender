'use strict';

const format = require('string-format');

const discord = require('./discord');
const io = require('./io');

/** @type {import('../typings/messages')} */
const msg = require('../db/messages.json');

/** @type {import('../typings/token')} */
const token = require('../db/token.json');

io.info(msg.service.init);
io.info(format(msg.service.oauth, token.clientId));
io.logNull();

discord.init(token.token);
io.init();
