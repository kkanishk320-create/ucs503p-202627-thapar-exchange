# Week 1–2 - Project Initialization and Database Design

## Objective
The objective was to understand the ThaparRent project and prepare its frontend, backend, and database structure for a student-to-student rental marketplace for TIET students.

## Work Completed
- Reviewed the React and Vite frontend and the Node.js and Express backend.
- Configured the backend to use PostgreSQL through Prisma.
- Defined the `User` model for student accounts and the `Listing` model for rental items.
- Set up the database connection and created the initial database migration.

## Challenges / Observations
The backend required a valid local PostgreSQL connection before Prisma could validate the schema and apply migrations. The `Listing` model also needed to relate each listing to its owner.

## Learning
I learned how Prisma models represented database tables and relationships, and how environment variables kept database connection settings separate from application code.

## Week Outcome
The project structure and database foundation were ready for listing API development.
