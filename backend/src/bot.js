const { Telegraf } = require("telegraf");

const startHandler = require("./handlers/start.handler");
const textHandler = require("./handlers/text.handler");
const photoHandler = require("./handlers/photo.handler");

const registrationHandler = require("./handlers/registration.handler");

const { registerReviewHandlers } = require("./handlers/review.handler");

const {editHandler} = require("./handlers/edit.handler");

// CREATE TELEGRAM BOT
const bot = new Telegraf(process.env.BOT_TOKEN);

// REGISTER HANDLERS

// Start
startHandler(bot);

// Text messages
textHandler(bot);

// Photos
photoHandler(bot);

// Program / Educational Level / Department
registrationHandler(bot);

// Review / Submit
registerReviewHandlers(bot);

// Edit
editHandler(bot);

// GLOBAL ERROR HANDLER
bot.catch((error, ctx) => {
  console.error("Telegram bot error:", error);

  console.error("Update:", ctx?.update);
});

module.exports = bot;
