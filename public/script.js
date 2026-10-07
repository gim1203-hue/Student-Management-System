const apiOrigin = window.STUDENT_API_BASE_URL || "";
const apiUrl = apiOrigin + "/api/students";
const studentForm = document.getElementById("student-form");
const studentIdInput = document.getElementById("student-id");
const studentTableBody = document.getElementById("student-table-body");
const studentCount = document.getElementById("student-count");
const statusMessage = document.getElementById("status-message");
const searchInput = document.getElementById("search-input");
const courseFilter = document.getElementById("course-filter");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");
let studentsCache = [];
let searchTimer;

function showStatus(message, kind = "success") {
    statusMessage.textContent = message;
    statusMessage.dataset.kind = kind;
}

async function requestStudents(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "The request failed.");
    }
    return result;
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
}

function renderStudents(students) {
    studentsCache = students;
    studentCount.textContent = String(students.length);
    studentTableBody.replaceChildren();

    if (students.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.className = "empty-cell";
        cell.colSpan = 6;
        cell.textContent = "No students found.";
        row.append(cell);
        studentTableBody.append(row);
        return;
    }

    students.forEach((student) => {
        const row = document.createElement("tr");
        addCell(row, student.id);
        addCell(row, student.name);
        addCell(row, student.email);
        addCell(row, student.age);
        addCell(row, student.course);

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "row-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = student.id;
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", "Edit " + student.name);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-button delete-button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = student.id;
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + student.name);

        actions.append(editButton, deleteButton);
        actionCell.append(actions);
        row.append(actionCell);
        studentTableBody.append(row);
    });
}

async function loadStudents(url = apiUrl) {
    try {
        const students = await requestStudents(url);
        renderStudents(students);
        return true;
    } catch (error) {
        showStatus(error.message, "error");
        return false;
    }
}

async function searchStudents() {
    const name = searchInput.value.trim();
    courseFilter.value = "";
    if (!name) {
        await loadStudents();
        return;
    }
    await loadStudents(apiUrl + "/search?name=" + encodeURIComponent(name));
}

async function filterStudents() {
    const course = courseFilter.value;
    searchInput.value = "";
    if (!course) {
        await loadStudents();
        return;
    }
    await loadStudents(apiUrl + "/filter?course=" + encodeURIComponent(course));
}

function resetStudentForm() {
    studentForm.reset();
    studentIdInput.value = "";
    document.getElementById("form-title").textContent = "Add a student";
    submitButton.textContent = "Add student";
    cancelEditButton.hidden = true;
}

function editStudent(id) {
    const student = studentsCache.find((item) => String(item.id) === id);
    if (!student) {
        showStatus("That student is no longer in the current list.", "error");
        return;
    }

    studentIdInput.value = student.id;
    studentForm.elements.name.value = student.name;
    studentForm.elements.email.value = student.email;
    studentForm.elements.age.value = student.age;
    studentForm.elements.course.value = student.course;
    document.getElementById("form-title").textContent = "Edit student";
    submitButton.textContent = "Save changes";
    cancelEditButton.hidden = false;
    document.getElementById("name").focus();
}

async function deleteStudent(id) {
    const student = studentsCache.find((item) => String(item.id) === id);
    if (!student || !confirm("Delete " + student.name + "?")) {
        return;
    }

    try {
        const result = await requestStudents(apiUrl + "/" + id, {
            method: "DELETE"
        });
        resetStudentForm();
        searchInput.value = "";
        courseFilter.value = "";
        await loadStudents();
        showStatus(result.message);
    } catch (error) {
        showStatus(error.message, "error");
    }
}

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const student = {
        name: studentForm.elements.name.value.trim(),
        email: studentForm.elements.email.value.trim(),
        age: Number(studentForm.elements.age.value),
        course: studentForm.elements.course.value.trim()
    };
    const studentId = studentIdInput.value;
    const isEditing = Boolean(studentId);

    try {
        await requestStudents(
            isEditing ? apiUrl + "/" + studentId : apiUrl,
            {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            }
        );
        resetStudentForm();
        searchInput.value = "";
        courseFilter.value = "";
        const refreshed = await loadStudents();
        let message = isEditing ? "Student updated." : "Student added.";
        if (!refreshed) {
            message = "Saved, but the list could not be refreshed.";
        }
        showStatus(message, refreshed ? "success" : "error");
    } catch (error) {
        showStatus(error.message, "error");
    }
});

studentTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }
    if (button.dataset.action === "edit") {
        editStudent(button.dataset.id);
    } else if (button.dataset.action === "delete") {
        void deleteStudent(button.dataset.id);
    }
});

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(searchStudents, 250);
});
courseFilter.addEventListener("change", filterStudents);
cancelEditButton.addEventListener("click", resetStudentForm);

void loadStudents();
