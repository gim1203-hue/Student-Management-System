CREATE DATABASE IF NOT EXISTS school_db;

USE school_db;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    course VARCHAR(100) NOT NULL
);

-- Run this sample INSERT only once on a new database.
INSERT INTO students (name, email, age, course)
VALUES
    ('John Smith', 'john.smith@example.com', 22, 'React'),
    ('Ali Khan', 'ali.khan@example.com', 23, 'Node.js'),
    ('Maria Garcia', 'maria.garcia@example.com', 21, 'Python'),
    ('James Wilson', 'james.wilson@example.com', 24, 'JavaScript'),
    ('Aisha Patel', 'aisha.patel@example.com', 20, 'Next.js');
