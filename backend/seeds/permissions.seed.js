const pool = require("../src/config/database");

// PERMISSIONS
const permissions = [

    // STUDENT PERMISSIONS
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

    // ID CARD RECEIPTS PERMISSIONS
    {
        name: "receipts.view",
        description: "View ID card receipt records",
    },

    {
        name: "receipts.create",
        description: "Create ID card receipt records",
    },

    {
        name: "receipts.export",
        description: "Export ID card receipt reports",
    },

    {
        name: "receipts.delete",
        description: "Delete ID card receipt records",
    },

    // ADMIN MANAGEMENT PERMISSIONS
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

// SEED PERMISSIONS
async function seedPermissions() {
    for (const permission of permissions) {

        await pool.execute(
            `
                INSERT INTO permissions (
                    name,
                    description
                )
                VALUES (?, ?)

                ON DUPLICATE KEY UPDATE
                    description = VALUES(description)
            `,
            [
                permission.name,
                permission.description,
            ],
        );

    }

}

module.exports = seedPermissions;