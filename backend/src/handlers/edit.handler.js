const { Markup } = require("telegraf");

const {
  getRegistration,
  updateRegistration,
} = require("../state/registration.state");

const {
  programOptions,
  educationalLevelOptions,
  degreeDepartments,
  tvetDepartments,
  mastersPrograms,
  distanceDegreeDepartments,
} = require("../data/registration.options");

const { showRegistrationReview } = require("./review.handler");

// REGISTER EDIT HANDLERS
function editHandler(bot) {

  // EDIT MENU
  bot.action("edit_registration", async (ctx) => {
    await showEditRegistration(ctx);
  });

  // EDIT FULL NAME
  bot.action("edit_full_name", async (ctx) => {
    await editFullName(ctx);
  });

  // EDIT STUDENT ID

  bot.action("edit_student_id", async (ctx) => {
    await editStudentId(ctx);
  });

  // EDIT PHOTO

  bot.action("edit_photo", async (ctx) => {
    await editPhoto(ctx);
  });

  // EDIT PROGRAM

  bot.action("edit_program", async (ctx) => {
    await editProgram(ctx);
  });

  // EDIT EDUCATIONAL LEVEL

  bot.action("edit_educational_level", async (ctx) => {
    await editEducationalLevel(ctx);
  });

  // EDIT DEPARTMENT

  bot.action("edit_department", async (ctx) => {
    await editDepartment(ctx);
  });

  // EDIT PROGRAM CALLBACK

  bot.action(
    /^edit_program_(regular|weekend|extension|distance)$/,
    async (ctx) => {
      await handleEditProgram(ctx);
    },
  );

  // EDIT LEVEL CALLBACK

  bot.action(
    /^edit_level_(degree|tvet|masters|distance_degree)$/,
    async (ctx) => {
      await handleEditEducationalLevel(ctx);
    },
  );

  // EDIT DEPARTMENT CALLBACK

  bot.action(/^edit_department_(.+)$/, async (ctx) => {
    await handleEditDepartment(ctx);
  });

  // BACK TO REVIEW
  bot.action("back_to_review", async (ctx) => {
    await backToReview(ctx);
  });
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
// EDIT FULL NAME

async function editFullName(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_full_name",
  });

  await ctx.answerCbQuery();

  await ctx.reply(
    "👤 *Edit Full Name*\n\n" +
      `Current name: *${registration.full_name}*\n\n` +
      "Please enter your new full name.",
    {
      parse_mode: "Markdown",
    },
  );
}

// EDIT STUDENT ID

async function editStudentId(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_student_id",
  });

  await ctx.answerCbQuery();

  await ctx.reply(
    "🪪 *Edit Student ID*\n\n" +
      `Current ID: *${registration.student_id}*\n\n` +
      "Please enter your new *6-digit Student ID*.",
    {
      parse_mode: "Markdown",
    },
  );
}

// EDIT PHOTO

async function editPhoto(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_photo",
  });

  await ctx.answerCbQuery();

  await ctx.reply(
    "📸 *Edit Student Photo*\n\n" +
      "Please send your new professional student photo.\n\n" +
      "👤 Face clearly visible\n" +
      "🧍 Front-facing\n" +
      "💡 Good lighting\n" +
      "🧱 Clean background\n" +
      "📷 Recent photo\n" +
      "📷 3x4 picture Portrait (3:4 ratio)\n" +
      "👔 Professional appearance\n\n" +
      "🚫 No sunglasses\n" +
      "🚫 No filters\n" +
      "🚫 No group photos",
    {
      parse_mode: "Markdown",
    },
  );
}

// EDIT PROGRAM
async function editProgram(ctx) {
  const userId = ctx.from.id;

  if (!getRegistration(userId)) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_program",
  });

  await ctx.answerCbQuery();

  await ctx.reply("📚 *Edit Program*\n\n" + "Select your program:", {
    parse_mode: "Markdown",

    ...Markup.inlineKeyboard([
      [Markup.button.callback("📚 Regular", "edit_program_regular")],
      [Markup.button.callback("🔄 Weekend", "edit_program_weekend")],
      [Markup.button.callback("🌙 Extension", "edit_program_extension")],
      [Markup.button.callback("🌐 Distance", "edit_program_distance")],
    ]),
  });
}

// EDIT EDUCATIONAL LEVEL
async function editEducationalLevel(ctx) {
  const userId = ctx.from.id;

  if (!getRegistration(userId)) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_educational_level",
  });

  await ctx.answerCbQuery();

  await ctx.reply(
    "🎓 *Edit Educational Level*\n\n" + "Select your educational level:",
    {
      parse_mode: "Markdown",

      ...Markup.inlineKeyboard([
        [Markup.button.callback("🎓 Degree", "edit_level_degree")],
        [Markup.button.callback("🛠 TVET", "edit_level_tvet")],
        [
          Markup.button.callback(
            "🎓 Masters Program Regular",
            "edit_level_masters",
          ),
        ],
        [
          Markup.button.callback(
            "🌐 Distance Degree",
            "edit_level_distance_degree",
          ),
        ],
      ]),
    },
  );
}

// EDIT DEPARTMENT

async function editDepartment(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "edit_department",
  });

  await ctx.answerCbQuery();

  await sendEditDepartmentSelection(ctx, registration.educational_level);
}

// SEND EDIT DEPARTMENT OPTIONS

async function sendEditDepartmentSelection(ctx, level) {
  let options = [];
  let title = "";

  if (level === "Degree") {
    options = degreeDepartments;
    title = "🎓 *Degree Departments*";
  } else if (level === "TVET") {
    options = tvetDepartments;
    title = "🛠 *TVET Departments*";
  } else if (level === "Masters Program Regular") {
    options = mastersPrograms;
    title = "🎓 *Masters Programs*";
  } else if (level === "Distance Degree") {
    options = distanceDegreeDepartments;
    title = "🌐 *Distance Degree Departments*";
  } else {
    await ctx.reply("❌ Unable to determine department options.");

    return;
  }

  const buttons = options.map((option) => [
    Markup.button.callback(
      `📚 ${option.name}`,
      `edit_department_${option.value}`,
    ),
  ]);

  await ctx.reply(title + "\n\nSelect your department:", {
    parse_mode: "Markdown",

    ...Markup.inlineKeyboard(buttons),
  });
}

// HANDLE TEXT EDITS

async function handleEditText(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    return false;
  }

  const text = ctx.message.text.trim();

  // FULL NAME

  if (registration.step === "edit_full_name") {
    if (text.length < 2) {
      await ctx.reply("❌ Please enter a valid full name.");

      return true;
    }

    updateRegistration(userId, {
      full_name: text,
      step: "review",
    });

    await ctx.reply("✅ Full name updated successfully.");

    await showRegistrationReview(ctx);

    return true;
  }

  // STUDENT ID

  if (registration.step === "edit_student_id") {
    if (!/^\d{6}$/.test(text)) {
      await ctx.reply(
        "❌ *Invalid Student ID*\n\n" +
          "Student ID must contain exactly 6 digits.",
        {
          parse_mode: "Markdown",
        },
      );

      return true;
    }

    updateRegistration(userId, {
      student_id: text,
      step: "review",
    });

    await ctx.reply("✅ Student ID updated successfully.");

    await showRegistrationReview(ctx);

    return true;
  }

  return false;
}

// HANDLE PHOTO EDIT\
async function handleEditPhoto(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration || registration.step !== "edit_photo") {
    return false;
  }

  const photos = ctx.message.photo;

  if (!photos || photos.length === 0) {
    await ctx.reply("❌ Please send a valid photo.");

    return true;
  }

  const largestPhoto = photos[photos.length - 1];

  updateRegistration(userId, {
    photo_file_id: largestPhoto.file_id,
    step: "review",
  });

  await ctx.reply(
    "✅ *Photo updated successfully!*\n\n" +
      "Here is your updated registration review.",
    {
      parse_mode: "Markdown",
    },
  );

  await showRegistrationReview(ctx);

  return true;
}

// HANDLE EDIT PROGRAM

async function handleEditProgram(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  const option = programOptions.find((item) => item.value === ctx.match[1]);

  if (!option) {
    await ctx.answerCbQuery("Invalid program.");

    return;
  }

  updateRegistration(userId, {
    program: option.name,
    step: "review",
  });

  await ctx.answerCbQuery(`${option.name} selected`);

  await showRegistrationReview(ctx);
}

// HANDLE EDIT LEVEL

async function handleEditEducationalLevel(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  const option = educationalLevelOptions.find(
    (item) => item.value === ctx.match[1],
  );

  if (!option) {
    await ctx.answerCbQuery("Invalid educational level.");

    return;
  }

  updateRegistration(userId, {
    educational_level: option.name,

    department: null,

    step: "edit_department",
  });

  await ctx.answerCbQuery(`${option.name} selected`);

  await sendEditDepartmentSelection(ctx, option.name);
}

// HANDLE EDIT DEPARTMENT

async function handleEditDepartment(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  if (!registration) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  const allOptions = [
    ...degreeDepartments,
    ...tvetDepartments,
    ...mastersPrograms,
    ...distanceDegreeDepartments,
  ];

  const option = allOptions.find((item) => item.value === ctx.match[1]);

  if (!option) {
    await ctx.answerCbQuery("Invalid department.");

    return;
  }

  updateRegistration(userId, {
    department: option.name,
    step: "review",
  });

  await ctx.answerCbQuery("Department updated");

  await showRegistrationReview(ctx);
}

// BACK TO REVIEW

async function backToReview(ctx) {
  const userId = ctx.from.id;

  if (!getRegistration(userId)) {
    await ctx.answerCbQuery("Registration session expired.");

    return;
  }

  updateRegistration(userId, {
    step: "review",
  });

  await ctx.answerCbQuery();

  await showRegistrationReview(ctx);
}

module.exports = {
  editHandler,
  showEditRegistration,
  handleEditText,
  handleEditPhoto,
};
