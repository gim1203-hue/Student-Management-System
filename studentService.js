const db = require("./db");

async function getStudents() {
    const [rows] = await db.execute(
        "SELECT * FROM students ORDER BY id"
    );
    return rows;
}

async function getStudentById(id) {
    const [rows] = await db.execute(
        "SELECT * FROM students WHERE id = ?",
        [id]
    );
    return rows[0];
}

async function createStudent(name, email, age, course) {
    const [result] = await db.execute(
        `INSERT INTO students
        (name, email, age, course)
        VALUES (?, ?, ?, ?)`,
        [name, email, age, course]
    );
    return getStudentById(result.insertId);
}

async function updateStudent(id, name, email, age, course) {
    const [existingRows] = await db.execute(
        "SELECT id FROM students WHERE id = ?",
        [id]
    );
    if (existingRows.length === 0) {
        return undefined;
    }

    await db.execute(
        `UPDATE students
        SET name = ?, email = ?, age = ?, course = ?
        WHERE id = ?`,
        [name, email, age, course, id]
    );
    return getStudentById(id);
}

async function deleteStudent(id) {
    const [result] = await db.execute(
        "DELETE FROM students WHERE id = ?",
        [id]
    );
    return result.affectedRows > 0;
}

async function searchStudents(name) {
    const [rows] = await db.execute(
        "SELECT * FROM students WHERE name LIKE ? ORDER BY id",
        [`%${name}%`]
    );
    return rows;
}

async function filterStudentsByCourse(course) {
    const [rows] = await db.execute(
        "SELECT * FROM students WHERE course = ? ORDER BY id",
        [course]
    );
    return rows;
}

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    filterStudentsByCourse
};