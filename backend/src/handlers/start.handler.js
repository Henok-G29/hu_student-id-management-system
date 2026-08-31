const { Markup } = require("telegraf");
const { createRegistration } = require("../state/registration.state");

// REGISTER START HANDLER
function startHandler(bot) {
  bot.start(async (ctx) => {
    try {
      await ctx.reply(
        "🎓 *HARAMBEE UNIVERSITY*\n\n" +
          "🪪 *Student ID Card Registration*\n\n" +
          "Welcome! \n\n This bot will guide you through " +
          "the student ID card registration process.\n\n" +
          "Let's get started 👇",
        {
          parse_mode: "Markdown",

          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "📝 Start Registration",
                "start_registration",
              ),
            ],
            [
              Markup.button.callback(
                "🪪 I RECEIVED MY ID CARD",
                "start_id_card_receipt",
              ),
            ],
          ]),
        },
      );
    } catch (error) {
      console.error("Telegram /start error:", error);
    }
  });
  // START REGISTRATION BUTTON

  bot.action("start_registration", async (ctx) => {
    try {
      const userId = ctx.from.id;
      createRegistration(userId);
      await ctx.answerCbQuery();

      await ctx.reply(
        "📝 *Registration Started*\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "👤 *Step 1 of 6*\n" +
          "━━━━━━━━━━━━━━━━━━\n\n" +
          "Please enter your *full name*.",
        {
          parse_mode: "Markdown",
        },
      );
    } catch (error) {
      console.error("Start registration error:", error);
      await ctx.answerCbQuery("Unable to start registration.");
    }
  });
}

module.exports = startHandler;
