const { Markup } = require("telegraf");

const {
  getRegistration,
  createRegistration,
  updateRegistration,
} = require("../state/registration.state");

const idCardReceiptService = require("../services/idCardReceipt.service");

// START ID CARD RECEIPT

async function startIdCardReceipt(ctx) {
  const userId = ctx.from.id;

  await ctx.answerCbQuery();

  let registration = getRegistration(userId);

  // CREATE LIGHTWEIGHT SESSION IF NEEDED

  if (!registration) {
    registration = createRegistration(userId);
  }

  // START RECEIPT FLOW

  updateRegistration(userId, {
    receipt_step: "student_id",
    receipt_student: null,
  });

  await ctx.reply(
    "🪪 *ID Card Receipt*\n\n" +
      "If you have received your physical student ID card, " +
      "we can record it in the system.\n\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "🪪 *Enter Student ID*\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      "Please enter your *6-digit Student ID*.\n\n" +
      "Example: `222311`",
    {
      parse_mode: "Markdown",
    },
  );
}

// FIND STUDENT

async function handleIdCardStudentId(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  const registration = getRegistration(userId);

  // MAKE SURE RECEIPT FLOW IS ACTIVE

  if (!registration || registration.receipt_step !== "student_id") {
    return false;
  }

  // VALIDATE STUDENT ID

  if (!/^\d{6}$/.test(text)) {
    await ctx.reply(
      "❌ *Invalid Student ID*\n\n" +
        "Student ID must contain exactly *6 digits*.\n\n" +
        "Example: `222311`",
      {
        parse_mode: "Markdown",
      },
    );

    return true;
  }

  try {
    // FIND STUDENT

    const student = await idCardReceiptService.getStudentForReceipt(text);

    // STUDENT NOT FOUND
    if (!student) {
      await ctx.reply(
        "❌ *Student Not Found*\n\n" +
          `We could not find a registered student with Student ID *${text}*.\n\n` +
          "Please check your Student ID and try again.",
        {
          parse_mode: "Markdown",
        },
      );

      return true;
    }

    // CHECK IF ID CARD WAS ALREADY RECEIVED

    const existingReceipt =
      await idCardReceiptService.checkStudentReceiptStatus(text);

    if (existingReceipt) {
      await ctx.reply(
        "ℹ️ *ID Card Already Received*\n\n" +
          `🪪 *Student ID:* ${text}\n\n` +
          "This student has already received their physical ID card.\n\n" +
          `📅 *Received At:* ${formatDate(existingReceipt.received_at)}\n` +
          `📍 *Received Via:* ${formatReceivedVia(existingReceipt.received_via)}\n\n` +
          "You cannot record the same ID card receipt again.",
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            [Markup.button.callback("⬅️ Back", "cancel_id_card_receipt")],
          ]),
        },
      );

      updateRegistration(userId, {
        receipt_step: null,
        receipt_student: null,
      });

      return true;
    }

    // SAVE TEMPORARY STUDENT DATA

    updateRegistration(userId, {
      receipt_step: "confirm",
      receipt_student: {
        id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        program: student.program,
        educational_level: student.educational_level,
        department: student.department,
        status: student.status,
      },
    });

    // DISPLAY STUDENT INFORMATION

    await ctx.reply(
      "🔎 *Student Information Found*\n\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        `🪪 *Student ID:* ${student.student_id}\n` +
        `👤 *Full Name:* ${student.full_name}\n` +
        `📚 *Program:* ${student.program}\n` +
        `🎓 *Educational Level:* ${student.educational_level}\n` +
        `🏢 *Department:* ${student.department}\n` +
        "━━━━━━━━━━━━━━━━━━\n\n" +
        "⚠️ *Please verify this information.*\n\n" +
        "Have you received your physical student ID card " +
        "and is this information correct?",
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✅ YES, I RECEIVED MY ID CARD",
              "confirm_id_card_receipt",
            ),
          ],
          [Markup.button.callback("❌ Cancel", "cancel_id_card_receipt")],
        ]),
      },
    );

    return true;
  } catch (error) {
    console.error("Find student for ID card receipt error:", error);

    await ctx.reply(
      "❌ Unable to verify your Student ID right now.\n\n" +
        "Please try again later.",
    );

    return true;
  }
}

// CONFIRM RECEIPT

async function confirmIdCardReceipt(ctx) {
  const userId = ctx.from.id;

  const registration = getRegistration(userId);

  // CHECK SESSION

  if (
    !registration ||
    registration.receipt_step !== "confirm" ||
    !registration.receipt_student
  ) {
    await ctx.answerCbQuery("Receipt session expired.");

    return;
  }

  const student = registration.receipt_student;

  try {

    // CHECK DUPLICATE AGAIN

    const existingReceipt =
      await idCardReceiptService.checkStudentReceiptStatus(student.student_id);

    if (existingReceipt) {
      await ctx.answerCbQuery();

      await ctx.reply(
        "ℹ️ *ID Card Already Received*\n\n" +
          `🪪 *Student ID:* ${student.student_id}\n\n` +
          "This ID card receipt has already been recorded.\n\n" +
          `📅 *Received At:* ${formatDate(existingReceipt.received_at)}\n` +
          `📍 *Received Via:* ${formatReceivedVia(existingReceipt.received_via)}`,
        {
          parse_mode: "Markdown",
        },
      );

      clearReceiptSession(userId);

      return;
    }

    // CREATE RECEIPT

    const receipt = await idCardReceiptService.createIdCardReceipt({
      student_id: student.student_id,
      full_name: student.full_name,
      program: student.program,
      educational_level: student.educational_level,
      department: student.department,
      received_via: "telegram",
    });

    // CLEAR SESSION

    clearReceiptSession(userId);

    await ctx.answerCbQuery("Receipt recorded successfully.");

    // SUCCESS MESSAGE

    await ctx.reply(
      "🎉 *ID Card Receipt Recorded!*\n\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "✅ *Verification successful*\n\n" +
        `🪪 *Student ID:* ${student.student_id}\n` +
        `👤 *Full Name:* ${student.full_name}\n\n` +
        "🪪 Your ID card receipt has been recorded successfully.\n" +
        "📍 *Received Via:* Telegram\n" +
        "━━━━━━━━━━━━━━━━━━\n\n" +
        "Thank you.",
      {
        parse_mode: "Markdown",
      },
    );

    console.log(`ID card receipt recorded via Telegram: ${student.student_id}`);
  } catch (error) {
    console.error("Confirm ID card receipt error:", error);

    // DATABASE UNIQUE CONSTRAINT

    if (error.code === "ER_DUP_ENTRY") {
      await ctx.answerCbQuery();

      await ctx.reply(
        "ℹ️ *ID Card Already Received*\n\n" +
          `Student ID *${student.student_id}* ` +
          "already has an ID card receipt in the system.",
        {
          parse_mode: "Markdown",
        },
      );

      clearReceiptSession(userId);

      return;
    }

    await ctx.answerCbQuery("Unable to record receipt.");

    await ctx.reply(
      "❌ *Unable to record your ID card receipt.*\n\n" +
        "Please try again later.",
      {
        parse_mode: "Markdown",
      },
    );
  }
}

// CANCEL RECEIPT
async function cancelIdCardReceipt(ctx) {
  const userId = ctx.from.id;

  clearReceiptSession(userId);

  await ctx.answerCbQuery();

  await ctx.reply(
    "❌ *ID Card Receipt Cancelled*\n\n" + "No information was recorded.",
    {
      parse_mode: "Markdown",
    },
  );
}

// CLEAR RECEIPT SESSION

function clearReceiptSession(userId) {
  const registration = getRegistration(userId);

  if (!registration) {
    return;
  }

  updateRegistration(userId, {
    receipt_step: null,
    receipt_student: null,
  });
}

// FORMAT DATE

function formatDate(date) {
  if (!date) {
    return "Unknown";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleString();
}

// FORMAT RECEIVED VIA

function formatReceivedVia(receivedVia) {
  if (receivedVia === "telegram") {
    return "Telegram";
  }

  if (receivedVia === "web") {
    return "Web";
  }

  return receivedVia || "Unknown";
}

// REGISTER RECEIPT HANDLERS

function registerIdCardReceiptHandlers(bot) {
  // START RECEIPT

  bot.action("start_id_card_receipt", startIdCardReceipt);

  // CONFIRM RECEIPT

  bot.action("confirm_id_card_receipt", confirmIdCardReceipt);

  // CANCEL RECEIPT

  bot.action("cancel_id_card_receipt", cancelIdCardReceipt);
}

module.exports = {
  startIdCardReceipt,
  handleIdCardStudentId,
  confirmIdCardReceipt,
  cancelIdCardReceipt,
  registerIdCardReceiptHandlers,
};