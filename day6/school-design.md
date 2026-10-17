# School Database Design

## Tables

- **students** stores each student's name and email. `student_id` is the primary key, and email is required and unique.
- **courses** stores each course's name and description. `course_id` is the primary key.
- **enrolments** links a student to a course and stores the grade. Its foreign keys connect to `students` and `courses`; a unique constraint on `(student_id, course_id)` prevents duplicate enrolments.

## Relationships

One student can have many enrolments, and one course can have many enrolments. Students and courses have a many-to-many relationship: each student can take several courses, and each course can have several students. The `enrolments` table links each student-course pair and stores information about that pairing, such as the grade.

## Index

I would add an index on `enrolments(course_id)` to help find and count students enrolled in a particular course. The unique constraint on `(student_id, course_id)` helps searches by student; this index helps searches by course.

## SQL or NoSQL?

I would choose SQL because students, courses, and enrolments have clear relationships. Foreign keys and unique constraints help keep the data consistent, and joins make it easy to answer questions about courses and students.