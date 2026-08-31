const registrations = new Map();

// CREATE REGISTRATIO

function createRegistration(userId) {
  const registration = {
    telegram_user_id: userId,

    // Normal registration data
    full_name: null,
    student_id: null,
    photo_file_id: null,
    program: null,
    educational_level: null,
    department: null,
    temporary_departments: null,

    step: "full_name",

    database_id: null,

    // ID CARD RECEIPT FLOW

    receipt_step: null,
    receipt_student: null,
  };

  registrations.set(userId, registration);
  return registration;
}

// GET REGISTRATION

function getRegistration(userId) {
  return registrations.get(userId) || null;
}

// UPDATE REGISTRATION

function updateRegistration(userId, data) {
  const registration = registrations.get(userId);

  if (!registration) {
    return null;
  }

  Object.assign(registration, data);
  registrations.set(userId, registration);
  return registration;
}

// DELETE REGISTRATION

function deleteRegistration(userId) {
  registrations.delete(userId);
}


module.exports = {
  createRegistration,
  getRegistration,
  updateRegistration,
  deleteRegistration,
};