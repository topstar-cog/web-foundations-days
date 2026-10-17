PRAGMA foreign_keys = ON;

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL,
    description TEXT NOT NULL
);
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (student_id, course_id)
);
INSERT INTO students (student_id, name, email) VALUES
    (1, 'Edwin Sifuna', 'sifuna@gmail.com'),
    (2, 'Nobert Wanyama', 'nobert@yahoo.com'),
    (3, 'Royal Mugabe', 'royal@gmail.com'),
    (4, 'Ezekiel Ogolla', 'ezekiel@hotmail.com');
    INSERT INTO courses (course_id, course_name, description) VALUES
    (1, 'Introduction to Computing', 'Computer fundamentals and problem solving'),
    (2, 'Web Development', 'HTML, CSS, and JavaScript basics'),
    (3, 'Database Systems', 'Relational data modeling and SQL');
    INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 2, 'A'),
    (4, 2, 3, 'B'),
    (5, 3, 1, 'C'),
    (6, 3, 3, 'A');
SELECT c.course_name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Edwin Sifuna'
ORDER BY c.course_name;

SELECT s.name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_name = 'Web Development'
ORDER BY s.name;

SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

SELECT s.name
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.name;

UPDATE enrolments
SET grade = 'A'
WHERE enrolment_id = 2;
SELECT s.name
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.name;

INSERT INTO courses (course_id, course_name, description) VALUES
    (1, 'Introduction to Computing', 'Computer fundamentals and problem solving'),
    (2, 'Web Development', 'HTML, CSS, and JavaScript basics'),
    (3, 'Database Systems', 'Relational data modeling and SQL');

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 2, 'A'),
    (4, 2, 3, 'B'),
    (5, 3, 1, 'C'),
    (6, 3, 3, 'A');

-- 1. All courses for one student, selected by name.
SELECT c.course_name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Edwin Sifuna'
ORDER BY c.course_name;

-- 2. All students on one course.
SELECT s.name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_name = 'Web Development'
ORDER BY s.name;

-- 3. Number of students per course.
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- 4. Students with no enrolments.
SELECT s.name
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.name;

-- 5. Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A'
WHERE enrolment_id = 2;