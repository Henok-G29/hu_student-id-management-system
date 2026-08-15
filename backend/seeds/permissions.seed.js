const pool = require("../src/config/database");

const permissions = [
  {
    name: "students.view",
    description: "View registered students",
  },
  {
    name: "students.search",
    description: "Search students",
  },

  {
    name: "students.update",
    description: "Update student information",
  },
  {
    name: "students.approve",
    description: "Approve student registrations",
  },
  {
    name: "students.reject",
    description: "Reject student registrations",
  },
  {
    name: "students.delete",
    description: "Delete student records",
  },
  {
    name: "receipts.view",
    description: "View ID card receipt records",
  },
  {
    name: "receipts.export",
    description: "Export ID card receipt reports",
  },
  {
    name: "admins.view",
    description: "View administrators",
  },
  {
    name: "admins.create",
    description: "Create sub administrators",
  },
  {
    name: "admins.update",
    description: "Update administrator information",
  },
  {
    name: "admins.delete",
    description: "Deactivate or delete administrators",
  },
  {
    name: "admins.permissions",
    description: "Manage sub administrator permissions",
  },
];

async function seedPermissions() {
  try {
    for (const permission of permissions) {
      await pool.execute(
        `
          INSERT INTO permissions (name, description)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE
            description = VALUES(description)
        `,
        [permission.name, permission.description],
      );

      console.log(` ${permission.name}`);
    }
  } catch (error) {
    console.error("Permission seed failed:");
    console.error(error.message);
  } 
}

seedPermissions();
