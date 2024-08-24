require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongooseClient = require("./lib/mongoose/client");
const userModel = require("./lib/mongoose/user.model");
const { default: mongoose } = require("mongoose");
const kinoModel = require("./lib/mongoose/kino.model");

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
  kino_find(u);
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
  admin_tugmalari();
}

function admin_tugmalari() {
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
      kino_yuklash(msc);
    } else if (msc.text === "kino o'chirish") {
      bot.sendMessage(msc.from.id, "kino ochirish");
    }

    // else {
    //   bot.sendMessage(
    //     msc.from.id,
    //     "bunday tugma mavjud emas yoki siz admin emassiz!"
    //   );
    // }
  });
}

async function kino_yuklash(kino) {
  bot.sendMessage(kino.chat.id, "kino yuklang", {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [["kino nomi", "kino idisi", "kino silkasi"]],
    },
  });

  bot.on("message", (movie) => {
    let adminId = movie.chat.id;
    let movieName;
    let movieId;
    let movie_url;

    if (movie.text === "kino nomi") {
      bot.on("message", (msc) => {
        movieName = msc.text;
      });
    } else if (movie.text === "kino idisi") {
      bot.on("message", (msc) => {
        movieId = movie.text;
      });
    } else if (movie.text === "kino silkasi") {
      bot.on("message", (msc) => {
        movie_url === movie.text;
      });
    } else {
      bot.sendMessage(movie.from.id, "kino silkasini kiriting ! ❌");
    }

    const kino = new kinoModel({
      movie_name: movieName,
      movie_id: movieId,
      movie_url: movie_url,
      adminId: adminId,
    });

    movieId.length > 1 &&
      kino
        .save()
        .then((data) => {
          data && bot.sendMessage(movie.chat.id, "kino yuklandi ✅");
        })
        .catch((err) => console.log(err));
  });
}

async function kino_find(kf) {
  const movies = await kinoModel.find();

  bot.on("message", async (msc) => {
    let kino;

    await movies.forEach((ki) => {
      if (Number(ki.movie_bot_id) === Number(msc.text)) {
        kino = ki;
      } else {
        console.log("xatolik");
      }
    });
  });
}

main();
