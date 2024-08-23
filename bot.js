require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongooseClient = require("./lib/mongoose/client");
const userModel = require("./lib/mongoose/user.model");
const { default: mongoose } = require("mongoose");

const bot_token = process.env.BOT_TOKEN;
const admin_username = process.env.ADMIN_USERNAME;
const admin_id = process.env.ADMIN_ID;

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
        if (
          mes.from.id === Number(admin_id) &&
          mes.from.username === admin_username
        ) {
          admin_startBot(mes);
        } else {
          user_startBot(mes);
        }
      } else {
        messageBot(mes);
      }
    }
  });
}

function messageBot(mes) {
  const chatId = mes.from.id;
  const name = mes.from.first_name;
  const user = mes.from.username;

  const newUser = new userModel({
    chatId: chatId,
    name: name,
    username: user,
  });

  newUser.save();

  bot.sendMessage(chatId, `Salom @${user} biznig bo'timizga xush kelibsiz ✅`);
}

function user_startBot(u) {
  console.log(u);
  bot.sendMessage(
    u.from.id,
    `<b>Assalomu Alaykum ${u.from.first_name}</b>` +
      `

` +
      "<i>Kinoni ko'rishni istasangiz kino kodini botga yuboring...</i>",

    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Kino kodlari kanali...",
              url: "https://t.me/web_kino",
            },
          ],
        ],
      },
    }
  );
}

function admin_startBot(u) {
  bot.sendMessage(
    u.from.id,
    `Salom admin ${u.from.first_name} ishni boshlashingiz mumkun ✅`,
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          ["kino kodlari", "kino kanal"],
          ["adminlar", "userlar"],
          ["kino qoshish", "kino o'chirish"],
        ],
      },
    }
  );
  kino_qoshish();
}

function kino_qoshish() {
  bot.on("message", (msc) => {
    console.log(msc.text);
    if (msc.text === "kino kodlari") {
      bot.sendMessage(msc.from.id, "salom admin kino qoshing");
    } else if (msc.text === "kino kanal") {
      bot.sendMessage(msc.from.id, "salom admin kino kanal qoshing");
    } else if (msc.text === "adminlar") {
      bot.sendMessage(msc.from.id, "adminlar");
    } else if (msc.text === "userlar") {
      bot.sendMessage(msc.from.id, "userlar ro'yxati");
    } else if (msc.text === "kino qoshish") {
      bot.sendMessage(msc.from.id, "kino qoshing admin");
    } else if (msc.text === "kino o'chirish") {
      bot.sendMessage(msc.from.id, "kino ochirish");
    } else {
      bot.sendMessage(
        msc.from.id,
        "bunday tugma mavjud emas yoki siz admin emassiz!"
      );
    }
  });
}

main();
