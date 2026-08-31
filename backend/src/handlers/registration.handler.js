const { Markup } = require("telegraf");

const {
  getRegistration,
  updateRegistration,
} = require("../state/registration.state");

const { showRegistrationReview } = require("./review.handler");

const {
  programOptions,
  educationalLevelOptions,
  degreeDepartments,
  tvetDepartments,
  mastersPrograms,
  distanceDegreeDepartments,
} = require("../data/registration.options");

// REGISTER REGISTRATION HANDLERS

function registrationHandler(bot) {

  // CONTINUE PROGRAM

  bot.action("continue_program", async (ctx) => {
    const userId = ctx.from.id;

    const registration = getRegistration(userId);

    if (!registration) {
      await ctx.answerCbQuery("Registration session expired.");

      return;
    }

    updateRegistration(userId, {
      step: "program",
    });

    await ctx.answerCbQuery();

    await ctx.reply("📚 *Step 4 of 6*\n\n" + "Select your program type:", {
      parse_mode: "Markdown",

      ...Markup.inlineKeyboard([
        [Markup.button.callback("📚 Regular", "program_regular")],
        [Markup.button.callback("🔄  Weekend", "program_weekend")],
        [Markup.button.callback("🌙 Extension", "program_extension")],
        [Markup.button.callback("🌐 Distance", "program_distance")],
      ]),
    });
  });

  // PROGRAM SELECTION

  bot.action(/^program_(regular|weekend|extension|distance)$/, async (ctx) => {
    const userId = ctx.from.id;

    const registration = getRegistration(userId);

    if (!registration) {
      await ctx.answerCbQuery("Registration session expired.");

      return;
    }

    const selectedValue = ctx.match[1];

    const option = programOptions.find((item) => item.value === selectedValue);

    if (!option) {
      await ctx.answerCbQuery("Invalid program.");

      return;
    }

    updateRegistration(userId, {
      program: option.name,
      educational_level: null,
      department: null,
      temporary_departments: null,
      step: "educational_level",
    });

    await ctx.answerCbQuery(`${option.name} selected`);

    await ctx.reply("🎓 *Step 5 of 6*\n\n" + "Select your educational level:", {
      parse_mode: "Markdown",

      ...Markup.inlineKeyboard([
        [Markup.button.callback("🎓 Degree", "level_degree")],
        [Markup.button.callback("🛠 TVET", "level_tvet")],
        [Markup.button.callback("🎓 Masters Program Regular", "level_masters")],
        [Markup.button.callback("🌐 Distance Degree", "level_distance_degree")],
      ]),
    });
  });

  // EDUCATIONAL LEVEL

  bot.action(/^level_(degree|tvet|masters|distance_degree)$/, async (ctx) => {
    const userId = ctx.from.id;

    const registration = getRegistration(userId);

    if (!registration) {
      await ctx.answerCbQuery("Registration session expired.");

      return;
    }

    const selectedValue = ctx.match[1];

    const option = educationalLevelOptions.find(
      (item) => item.value === selectedValue,
    );

    if (!option) {
      await ctx.answerCbQuery("Invalid educational level.");

      return;
    }

    updateRegistration(userId, {
      educational_level: option.name,
      department: null,
      temporary_departments: null,
      step: "department",
    });

    await ctx.answerCbQuery(`${option.name} selected`);

    await sendDepartmentSelection(ctx, option.name);
  });

  // DEPARTMENT

  bot.action(/^normal_department_(\d+)$/, async (ctx) => {
    const userId = ctx.from.id;

    const registration = getRegistration(userId);

    if (!registration) {
      await ctx.answerCbQuery("Registration session expired.");

      return;
    }

    const index = Number(ctx.match[1]);

    const departments = registration.temporary_departments;

    if (!Array.isArray(departments)) {
      await ctx.answerCbQuery("Department options expired.");

      return;
    }

    const department = departments[index];

    if (!department) {
      await ctx.answerCbQuery("Invalid department.");

      return;
    }

    updateRegistration(userId, {
      department,
      temporary_departments: null,
      step: "review",
    });

    await ctx.answerCbQuery("Department selected");

    await showRegistrationReview(ctx);
  });
}

// SEND DEPARTMENT SELECTION

async function sendDepartmentSelection(ctx, level) {
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

  const buttons = options.map((option, index) => [
    Markup.button.callback(`📚 ${option.name}`, `normal_department_${index}`),
  ]);

  await ctx.reply(title + "\n\nSelect your department:", {
    parse_mode: "Markdown",

    ...Markup.inlineKeyboard(buttons),
  });

  // Store only names for safe lookup
  updateRegistration(ctx.from.id, {
    temporary_departments: options.map((option) => option.name),
  });
}

module.exports = registrationHandler;
