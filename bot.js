require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongooseClient = require("./lib/mongoose/client");
const userModel = require("./lib/mongoose/user.model");
const { default: mongoose } = require("mongoose");

const bot_token = process.env.BOT_TOKEN;

const bot = new TelegramBot(bot_token, {
  polling: true,
});

async function main() {
  await mongooseClient();

  const users = await userModel.find();

  bot.on("message", async (mes) => {
    if (mes.text === "/start") {
      const use_user = users.filter((u) => u.chatId === mes.from.id);
      if (mes.from.id === use_user[0].chatId) {
        console.log("1", use_user);
        bot.sendMessage(mes.from.id, "SIz avval botdan foydalangansiz!");
      } else {
        console.log("2", use_user);
        messageBot(mes);
      }
    }
  });
}

async function messageBot(mes) {
  const chatId = mes.from.id;
  const name = mes.from.first_name;
  const user = mes.from.username;

  const newUser = new userModel({
    chatId: chatId,
    name: name,
    username: user,
  });

  newUser.save();

  bot.sendMessage(chatId, `Salom @${user} yoki ${name}`);
}

main();
