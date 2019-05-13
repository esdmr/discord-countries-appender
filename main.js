"use strict";

const Discord = require("discord.js");
const chalk = require("chalk");
const ping = require("ping");
const readline = require("readline");
const error = chalk.red;
const log = chalk.gray;
const info = chalk.blue;
const warn = chalk.yellow;

console.info(info("[info] Staring service..."));
console.info("\n" + info("[info] ") + info.underline("https://discordapp.com/api/oauth2/authorize?client_id=465060526905491457&permissions=1040&scope=bot") + "\n");

const CO = Object.freeze(require("./co.json")); // iso2 COntinents -> Continents
const CU = Object.freeze(require("./cu.json")); // iso2 CoUntries -> iso2 Continents
const CN = Object.freeze(require("./cn.json")); // iso2 CoUntries -> Countries
const c = {}; // Countries -> Continents

for (let i in CU) {
  c[CN[i]] = CO[CU[i]];
}

console.info(info("[info] Language list is generated."));
console.info(info("[info] Starting Discord..."));

try {
  const client = new Discord.Client();
  let confirm = () => { };

  client.on("ready", () => {
    console.log(log(`[log] Logged in as ${client.user.tag}.`));
    console.info(info("[info] Waiting for input..."));
  });

  client.on("error", err => console.error(error(err.stack)));

  client.on("guildCreate", guild => {
    if (guild.available) {
      console.log(log(`[log] Joined to guild ${guild.name}#${guild.id}.`));
    }
  });

  client.on("reconnecting", () => {
    console.log(log("[log] Reconnecting..."));
  });

  client.on("warn", info => console.warn(warn(info)));


  client.on("message", msg => {
    if (msg.content.slice(0, 5) === "%ping") {
      ping.promise.probe("discordapp.com").then(res => {
        msg.reply("Pong! `" + res.avg + "`.").catch(err => {
          console.error(error(err.stack));
          console.error(error("[err] Failure while replying."));
        });
      }).catch(err => {
        console.error(error(err.stack));
        console.error(error("[err] Failure while pinging."));
      });
    } else if (msg.content.slice(0, 5) === "%dcac") {
      if (msg.guild) {
        msg.channel.send("Running... :white_circle:  " + ":white_medium_small_square:".repeat(10)).then(msgp => {
          console.log(log("[log] Running 1/2..."));
          dcac1(msg.guild, msgp, msg.content.slice(6));
        }, err => {
          console.error(error(err.stack));
          console.error(error("[err] Failure while replying."));
        });
      } else {
        msg.reply("Oops! This bot can only operate in a guild.").catch(err => {
          console.error(error(err.stack));
          console.error(error("[info] Failure while replying."));
        });
      }
    } else if (msg.content.slice(0, 4) === "%del") {
      if (msg.guild) {
        msg.reply("Warning! All channels will be deleted. Please confirm on console.").catch(err => {
          console.error(error(err.stack));
          console.error(error("[info] Failure while replying."));
        });
        console.warn(warn(`[warn] User requested channel deletion for ${msg.guild.name}#${msg.guild.id}. Use 'confirm' to confirm.`));
        confirm = async () => {
          const arr = msg.guild.channels.array();
          const LEN = arr.length;

          for (let i = 0; i < LEN; i++) {
            console.log(log(`[log] Deleting channel ${i + 1}/${LEN}...`));

            await arr[i].delete().catch(err => {
              console.error(error(err.stack));
              console.error(error("[err] Failure while deleting channel."));
            });
          }


          console.info(info(`[info] Deleted all channels.`));

          confirm = () => { };
        };
      } else {
        msg.reply("Oops! This bot can only operate in a guild.").catch(err => {
          console.error(error(err.stack));
          console.error(error("[err] Failure while replying."));
        });
      }
    }
  });

  client.login(require("./token.json")).catch(err => {
    console.error(error(err.stack));
    console.error(error("[err] Failure while logging in."));
  });

  async function dcac1 (guild, msg, skip) {
    if (!guild.available)
      return;


    const TIME = + Date.now();
    skip = !isNaN(Number(skip)) ? Number(skip) : 0;
    let cs = {};

    for (let i in CO) {
      await guild.createChannel(CO[i], "category").catch(err => console.error(error(err))).then(c => cs[i] = [c, 0, 1]);
    }

    msg.edit("Running... :black_circle:  " + ":black_medium_small_square:".repeat(skip / 25) + ":white_medium_small_square:".repeat(10 - skip / 25));

    await dcac2(guild, cs, msg, skip, + Date.now() - TIME);
  }

  async function dcac2 (guild, dca, msg, skip, time1) {
    const TIME2 = + Date.now();
    console.log(log("[log] Running 2/2..."));
    if (!guild.available)
      return;

    let n = 0;

    for (let i in CU) {
      n++;

      if (n <= skip) {
        continue;
      }

      if (n % 25 === 0) {
        await msg.edit("Running... :black_circle:  " + ":black_medium_small_square:".repeat(n / 25) + ":white_medium_small_square:".repeat(10 - n / 25)).catch(err => console.error(error(err)));
      }

      dca[CU[i]][1]++;

      if (dca[CU[i]][1] > 50) {
        await guild.createChannel(CO[CU[i]] + " " + ++dca[CU[i]][2], "category").catch(err => console.error(error(err))).then(c => dca[CU[i]] = [c, 1, dca[CU[i]][2]]);
      }

      await guild.createChannel(CN[i], "text").catch(err => console.error(err)).then(c => c.setParent(dca[CU[i]][0]));
    }
    console.log(log("[log] Done. dcac1 = " + time1 + " dcac2 = " + (+ Date.now() - TIME2)));
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on("line", line => {
    switch (line) {
      case "exit":
        client.destroy().then(() => {
          console.info(info("[info] Successfully exitted."));
          process.exit();
        }, err => {
          console.error(error(err.stack));
          console.error(error("[err] Failure while exitting."));
        });
        break;

      case "confirm":
        confirm();
        break;
    }
  });

  process.on("exit", () => client.destroy().then(() => {
    console.info(info("\n[info] Successfully exitted."));
    process.exit();
  }, err => {
    console.error(error(err.stack));
    console.error(error("[err] Failure while exitting."));
  }));

  process.on("SIGINT", () => client.destroy().then(() => {
    console.info(info("\n[info] Successfully exitted."));
    process.exit();
  }, err => {
    console.error(error(err.stack));
    console.error(error("[err] Failure while exitting."));
  }));

  process.on("SIGUSR1", () => client.destroy().then(() => {
    console.info(info("\n[info] Successfully exitted."));
    process.exit();
  }, err => {
    console.error(error(err.stack));
    console.error(error("[err] Failure while exitting."));
  }));

  process.on("SIGUSR2", () => client.destroy().then(() => {
    console.info(info("\n[info] Successfully exitted."));
    process.exit();
  }, err => {
    console.error(error(err.stack));
    console.error(error("[err] Failure while exitting."));
  }));

  process.on("uncaughtException", err => client.destroy().then(() => {
    console.error(error(err.stack));
    console.info(info("\n[info] Successfully exitted."));
    process.exit();
  }, errr => {
    console.error(error(err.stack));
    console.error(error(errr.stack));
    console.error(error("[err] Failure while exitting."));
  }));
} catch (err) {
  console.error(error(err.stack));
  console.error(error("[err] An internal error happend."));
}
