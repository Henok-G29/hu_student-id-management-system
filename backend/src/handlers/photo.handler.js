const { Markup } = require("telegraf");

const {
  getRegistration,
  updateRegistration,
} = require("../state/registration.state");

const { handleEditPhoto } = require("./edit.handler");

// REGISTER PHOTO HANDLER

function photoHandler(bot) {
  bot.on("photo", async (ctx) => {
    try {
      const userId = ctx.from.id;

      const registration = getRegistration(userId);

      if (!registration) {
        await ctx.reply(
          "ℹ️ You don't have an active registration.\n\n" +
            "Please use /start to begin.",
        );

        return;
      }

      // EDIT PHOTO

      if (registration.step === "edit_photo") {
        const handled = await handleEditPhoto(ctx);

        if (handled) {
          return;
        }
      }

      // NORMAL PHOTO

      if (registration.step !== "photo") {
        await ctx.reply("⚠️ A photo is not required at this stage.");

        return;
      }

      const photos = ctx.message.photo;

      if (!photos || photos.length === 0) {
        await ctx.reply(
          "❌ Unable to receive the photo.\n\n" + "Please try again.",
        );

        return;
      }

      const largestPhoto = photos[photos.length - 1];

      updateRegistration(userId, {
        photo_file_id: largestPhoto.file_id,
        step: "program",
      });

      await ctx.reply(
        "✅ *Photo received successfully!*\n\n" +
          "📸 Your professional student photo has been saved temporarily.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "📚 *Step 4 of 6*\n" +
          "━━━━━━━━━━━━━━━━━━\n\n" +
          "Now let's continue with your program.",
        {
          parse_mode: "Markdown",

          ...Markup.inlineKeyboard([
            [Markup.button.callback("📚 Continue", "continue_program")],
          ]),
        },
      );
    } catch (error) {
      console.error("Telegram photo handler error:", error);

      await ctx.reply("❌ Unable to process your photo.");
    }
  });
}

module.exports = photoHandler;
