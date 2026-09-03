const {
  getRegistration,
  updateRegistration,
} = require("../state/registration.state");

const { handleEditText } = require("./edit.handler");

const {
  handleIdCardStudentId,
} = require("./idCardReceipt.handler");

// REGISTER TEXT HANDLER

function textHandler(bot) {
  bot.on("text", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const text = ctx.message.text.trim();

      // IGNORE COMMANDS

      if (text.startsWith("/")) {
        return;
      }

      const registration = getRegistration(userId);

      // ID CARD RECEIPT FLOW

      if (
        registration &&
        registration.receipt_step === "student_id"
      ) {
        const receiptHandled =
          await handleIdCardStudentId(ctx);

        if (receiptHandled) {
          return;
        }
      }

      // NO ACTIVE REGISTRATION
      if (!registration) {
        await ctx.reply(
          "ℹ️ You don't have an active registration.\n\n" +
            "Please use /start to begin.",
        );

        return;
      }

      // LET EDIT HANDLER PROCESS EDIT 
      const editHandled =
        await handleEditText(ctx);

      if (editHandled) {
        return;
      }

      // FULL NAME

      if (registration.step === "full_name") {
        if (text.length < 2) {
          await ctx.reply(
            "⚠️ Please enter a valid full name.",
          );

          return;
        }

        updateRegistration(userId, {
          full_name: text,
          step: "student_id",
        });

        await ctx.reply(
          "✅ *Full name saved!*\n\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🪪 *Step 2 of 6*\n" +
            "━━━━━━━━━━━━━━━━━━\n\n" +
            "Please enter your *6-digit Student ID*.\n\n" +
            "Example: `123456`",
          {
            parse_mode: "Markdown",
          },
        );

        return;
      }

      // NORMAL REGISTRATION STUDENT ID

      if (registration.step === "student_id") {
        if (!/^\d{6}$/.test(text)) {
          await ctx.reply(
            "❌ *Invalid Student ID*\n\n" +
              "Your Student ID must contain *exactly 6 digits*.\n\n" +
              "Example: `123456`",
            {
              parse_mode: "Markdown",
            },
          );

          return;
        }

        updateRegistration(userId, {
          student_id: text,
          step: "photo",
        });

        await ctx.reply(
          "✅ *Student ID saved!*\n\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "📸 *Step 3 of 6*\n" +
            "━━━━━━━━━━━━━━━━━━\n\n" +
            "🪪 Now please send your *professional student photo*.\n\n" +
            "📋 *Photo requirements:*\n\n" +
            "👤 Face clearly visible\n" +
            "🧍 Front-facing\n" +
            "💡 Good lighting\n" +
            "🧱 Clean/plain background\n" +
            "📷 Recent photo\n" +
            "📷 3x4 picture Portrait (3:4 ratio)\n" +
            "👔 Professional appearance\n\n" +
            "🚫 No sunglasses\n" +
            "🚫 No filters\n" +
            "🚫 No group photos\n" +
            "🚫 No screenshots\n\n" +
            "📤 *Please send the photo now.*",
          {
            parse_mode: "Markdown",
          },
        );

        return;
      }

      // PROGRAM

      if (registration.step === "program") {
        await ctx.reply(
          "👇 Please select your program using the buttons.",
        );

        return;
      }

      // EDUCATIONAL LEVEL
      if (
        registration.step === "educational_level"
      ) {
        await ctx.reply(
          "👇 Please select your educational level.",
        );

        return;
      }

      // DEPARTMENT

      if (registration.step === "department") {
        await ctx.reply(
          "👇 Please select your department.",
        );

        return;
      }

      // COMPLETED

      if (registration.step === "completed") {
        await ctx.reply(
          "✅ Your registration has already been submitted.",
        );

        return;
      }
    } catch (error) {
      console.error(
        "Telegram text handler error:",
        error,
      );

      await ctx.reply(
        "❌ Something went wrong.\n\n" +
          "Please try again.",
      );
    }
  });
}

module.exports = textHandler;
