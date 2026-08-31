const { Markup } = require("telegraf");

const {
  getRegistration,
  updateRegistration,
} = require("../state/registration.state");

const studentService = require("../services/student.service");

// REGISTER REVIEW HANDLERS

function registerReviewHandlers(bot) {
  // SUBMIT REGISTRATION

  bot.action("submit_registration", async (ctx) => {
    await submitRegistration(ctx);
  });

  // EDIT REGISTRATION

  bot.action("edit_registration", async (ctx) => {
    await showEditRegistration(ctx);
  });

  // BACK TO REVIEW

  bot.action("back_to_review", async (ctx) => {
    await ctx.answerCbQuery();

    await showRegistrationReview(ctx);
  });
}

// SHOW REGISTRATION REVIEW

async function showRegistrationReview(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.reply(
      "❌ Your registration session has expired.\n\n" +
        "Please use /start to begin again.",
    );

    return;
  }

  updateRegistration(userId, {
    step: "review",
  });

  const reviewText =
    "━━━━━━━━━━━━━━━━━━\n" +
    "📋 *REGISTRATION REVIEW*\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    `👤 *Full Name*\n${registration.full_name || "Not provided"}\n\n` +
    `🪪 *Student ID*\n${registration.student_id || "Not provided"}\n\n` +
    `📚 *Program*\n${registration.program || "Not provided"}\n\n` +
    `🎓 *Educational Level*\n${registration.educational_level || "Not provided"}\n\n` +
    `🏢 *Department*\n${registration.department || "Not provided"}\n\n` +
    "━━━━━━━━━━━━━━━━━━\n" +
    "📸 *Student Photo*\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "Please carefully check all your information before submitting.";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("✏️ Edit Information", "edit_registration")],
    [Markup.button.callback("✅ Submit Registration", "submit_registration")],
  ]);

  // SHOW PHOTO + INFORMATION

  if (registration.photo_file_id) {
    await ctx.replyWithPhoto(registration.photo_file_id, {
      caption: reviewText,
      parse_mode: "Markdown",
      ...keyboard,
    });
  } else {
    await ctx.reply(reviewText, {
      parse_mode: "Markdown",
      ...keyboard,
    });
  }
}

// SHOW EDIT MENU

async function showEditRegistration(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  await ctx.answerCbQuery();

  await ctx.reply(
    "✏️ *Edit Registration*\n\n" + "Select the information you want to change:",
    {
      parse_mode: "Markdown",

      ...Markup.inlineKeyboard([
        [Markup.button.callback("👤 Full Name", "edit_full_name")],

        [Markup.button.callback("🪪 Student ID", "edit_student_id")],

        [Markup.button.callback("📸 Student Photo", "edit_photo")],

        [Markup.button.callback("📚 Program", "edit_program")],

        [
          Markup.button.callback(
            "🎓 Educational Level",
            "edit_educational_level",
          ),
        ],

        [Markup.button.callback("🏢 Department", "edit_department")],

        [Markup.button.callback("⬅️ Back to Review", "back_to_review")],
      ]),
    },
  );
}

// SUBMIT REGISTRATION

async function submitRegistration(ctx) {
  const userId = ctx.from.id;

  try {
    const registration = getRegistration(userId);

    // CHECK SESSION

    if (!registration) {
      await ctx.answerCbQuery("Registration session expired.");

      await ctx.reply(
        "❌ Your registration session has expired.\n\n" +
          "Please use /start to begin again.",
      );

      return;
    }

    // VALIDATE REQUIRED INFORMATION

    if (
      !registration.full_name ||
      !registration.student_id ||
      !registration.photo_file_id ||
      !registration.program ||
      !registration.educational_level ||
      !registration.department
    ) {
      await ctx.answerCbQuery("Registration incomplete.");

      await ctx.reply(
        "❌ *Registration Incomplete*\n\n" +
          "Please make sure all required information has been provided.",
        {
          parse_mode: "Markdown",
        },
      );

      return;
    }

    // VALIDATE STUDENT ID

    if (!/^\d{6}$/.test(registration.student_id)) {
      await ctx.answerCbQuery("Invalid Student ID.");

      await ctx.reply(
        "❌ *Invalid Student ID*\n\n" +
          "Student ID must contain exactly 6 digits.",
        {
          parse_mode: "Markdown",
        },
      );

      return;
    }

    // ANSWER TELEGRAM CALLBACK

    await ctx.answerCbQuery("Submitting registration...");

    // SHOW SUBMITTING MESSAGE

    await ctx.reply(
      "⏳ *Submitting Registration...*\n\n" +
        "Please wait while we save your information.",
      {
        parse_mode: "Markdown",
      },
    );

    // SAVE TO DATABASE

    const student = await studentService.createStudent({
      telegram_user_id: userId,
      full_name: registration.full_name,
      student_id: registration.student_id,
      photo_file_id: registration.photo_file_id,
      program: registration.program,
      educational_level: registration.educational_level,
      department: registration.department,
    });

    // UPDATE REGISTRATION SESSION

    updateRegistration(userId, {
      step: "completed",
      database_id: student.id,
    });

    // SUCCESS MESSAGE

    await ctx.reply(
      "🎉 *Registration Successful!*\n\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "✅ Your registration has been submitted successfully.\n" +
        "━━━━━━━━━━━━━━━━━━\n\n" +
        `👤 *Full Name:* ${registration.full_name}\n` +
        `🪪 *Student ID:* ${registration.student_id}\n` +
        `📚 *Program:* ${registration.program}\n` +
        `🎓 *Educational Level:* ${registration.educational_level}\n` +
        `🏢 *Department:* ${registration.department}\n\n` +
        "📌 *Status:* Pending\n\n" +
        "Your registration has been registered successfully \n\n Thank you 🙏",
      {
        parse_mode: "Markdown",
      },
    );

    console.log(
      "Student registration saved successfully.",
      `Database ID: ${student.id}`,
    );
  } catch (error) {

    // DATABASE ERROR

    console.error("Submit registration database error:", error);

    // DUPLICATE ENTRY

    if (error.code === "ER_DUP_ENTRY") {
      await ctx.reply(
        "⚠️ *Registration Already Exists*\n\n" +
          "This Student ID or Telegram account is already registered.\n\n" +
          "Please contact the administrator if you believe this is an error.",
        {
          parse_mode: "Markdown",
        },
      );

      return;
    }

    // GENERAL ERROR

    await ctx.reply(
      "❌ *Registration Failed*\n\n" +
        "We were unable to save your registration right now.\n\n" +
        "Please try again later.",
      {
        parse_mode: "Markdown",
      },
    );
  }
}

module.exports = {
  registerReviewHandlers,
  showRegistrationReview,
};
