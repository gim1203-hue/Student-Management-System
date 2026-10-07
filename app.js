const express = require("express");
const path = require("node:path");
const studentService = require("./studentService");
const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

function validateStudent(body) {
    if (!body || typeof body !== "object") {
        return "A student object is required.";
    }

    const { name, email, age, course } = body;
    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        age === undefined || age === null || age === "" ||
        typeof course !== "string" || !course.trim()
    ) {
        return "Name, email, age, and course are required.";
    }
    const emailParts = email.trim().split("@");
    const domainParts = emailParts[1] ? emailParts[1].split(".") : [];
    if (
        emailParts.length !== 2 ||
        !emailParts[0] ||
        domainParts.length < 2 ||
        domainParts.some((part) => !part) ||
        /\s/.test(email.trim())
    ) {
        return "Enter a valid email address.";
    }
    if (!Number.isInteger(Number(age)) || Number(age) < 1) {
        return "Age must be a positive whole number.";
    }
    return null;
}

function parseStudentId(id) {
    const studentId = Number(id);
    return Number.isInteger(studentId) && studentId > 0
        ? studentId
        : null;
}

app.get("/api/students", async (req, res) => {
    try {
        const students =
            await studentService.getStudents();
        res.json(students);
    } catch (error) {
        console.error("Failed to get students:", error);
        res.status(500).json({
            message: "Failed to get students"
        });
    }
});

app.get("/api/students/search", async (req, res) => {
    const name = typeof req.query.name === "string"
        ? req.query.name.trim()
        : "";
    if (!name) {
        return res.status(400).json({
            message: "A name query is required."
        });
    }

    try {
        const students = await studentService.searchStudents(name);
        res.json(students);
    } catch (error) {
        console.error("Failed to search students:", error);
        res.status(500).json({ message: "Failed to search students" });
    }
});

app.get("/api/students/filter", async (req, res) => {
    const course = typeof req.query.course === "string"
        ? req.query.course.trim()
        : "";
    if (!course) {
        return res.status(400).json({
            message: "A course query is required."
        });
    }

    try {
        const students =
            await studentService.filterStudentsByCourse(course);
        res.json(students);
    } catch (error) {
        console.error("Failed to filter students:", error);
        res.status(500).json({ message: "Failed to filter students" });
    }
});

app.get("/api/students/:id", async (req, res) => {
    const studentId = parseStudentId(req.params.id);
    if (!studentId) {
        return res.status(400).json({ message: "Invalid student ID." });
    }

    try {
        const student =
            await studentService.getStudentById(
                studentId
            );
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }
        res.json(student);
    } catch (error) {
        console.error("Failed to get student:", error);
        res.status(500).json({
            message: "Failed to get student"
        });
    }
});

app.post("/api/students", async (req, res) => {
    const validationError = validateStudent(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const { name, email, age, course } = req.body;
    try {
        const student = await studentService.createStudent(
            name.trim(), email.trim(), Number(age), course.trim()
        );
        res.status(201).json(student);
    } catch (error) {
        console.error("Failed to create student:", error);
        res.status(500).json({ message: "Failed to create student" });
    }
});

app.put("/api/students/:id", async (req, res) => {
    const studentId = parseStudentId(req.params.id);
    if (!studentId) {
        return res.status(400).json({ message: "Invalid student ID." });
    }
    const validationError = validateStudent(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const { name, email, age, course } = req.body;
    try {
        const student = await studentService.updateStudent(
            studentId, name.trim(), email.trim(), Number(age), course.trim()
        );
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }
        res.json(student);
    } catch (error) {
        console.error("Failed to update student:", error);
        res.status(500).json({ message: "Failed to update student" });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    const studentId = parseStudentId(req.params.id);
    if (!studentId) {
        return res.status(400).json({ message: "Invalid student ID." });
    }

    try {
        const deleted = await studentService.deleteStudent(studentId);
        if (!deleted) {
            return res.status(404).json({
                message: "Student not found"
            });
        }
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Failed to delete student:", error);
        res.status(500).json({ message: "Failed to delete student" });
    }
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
