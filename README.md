# Student Management System

A beginner-friendly student records app using HTML, CSS, vanilla JavaScript, Express, and MySQL.

## Project layout

- `app.js`: Express API and static frontend server
- `db.js`: MySQL connection pool
- `studentService.js`: parameterized student database queries
- `.env`: local database settings; do not commit this file
- `schema.sql`: database, table, and first-run sample data
- `frontend/`: HTML, CSS, and browser JavaScript

## Requirements

- Node.js 18 or newer
- MySQL Server and MySQL Workbench

## Database setup

If this is a new database, open `schema.sql` in MySQL Workbench and run it once. It creates `school_db`, creates the `students` table, and inserts five sample rows. Do not run its sample `INSERT` section again if you already have student data.

The table columns are `id`, `name`, `email`, `age`, and `course`. Confirm your existing table with `DESCRIBE school_db.students;` before changing an existing database.

## Backend setup and run

Open a terminal in this folder and install the packages:

```powershell
npm install
```

Check that `.env` is in this folder, alongside `app.js`, not inside `node_modules`. It should contain your local MySQL settings:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_db
PORT=3000
```

Use your own local MySQL password. Start the server:

```powershell
npm start
```

Expected terminal message: `Server running on port 3000`. Open <http://localhost:3000> in a browser. The frontend and API share the same origin, so CORS configuration is not needed.

## Deploy to Render

The root `render.yaml` prepares a **new Free Node web service** named `student-management-system-api`. It does not create a database, add a custom domain, or change any existing Render service. Applying the Blueprint in Render creates the service, and the Free service can spin down while idle.

Render does not provide MySQL. Before applying the Blueprint, create an empty, remotely reachable MySQL database with a provider that permits connections from Render. Use the provider's TLS connection details. Managed MySQL may have a separate monthly cost; check the provider's current pricing. Run `schema.sql` once against the new empty database if you want its synthetic sample students. Do not upload the students from your local database; it contains personal data.

In Render, create the Blueprint from this GitHub repository and branch `main`. During setup, enter the database's `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` when prompted. The Blueprint sets `DB_PORT` to `3306` and enables verified TLS with `DB_SSL=true`. If your provider requires a custom CA certificate, add its PEM contents as the `DB_SSL_CA` environment variable in Render. Never commit credentials or the certificate to Git.

After the deployment succeeds, test `https://<your-service>.onrender.com/health` and `/api/students`. Only configure `aihelpall.com` after those endpoints and the frontend work; the domain currently belongs to the existing My-AI-2 service, so moving it will affect that app's domain.

## API endpoints

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/api/students` | List students |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/students/search?name=John` | Search names |
| GET | `/api/students/filter?course=React` | Filter by exact course |

For POST and PUT, send JSON with `Content-Type: application/json`:

```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "age": 23,
  "course": "Node.js"
}
```

Successful creation responds with HTTP 201. Invalid input responds with 400, missing students with 404, and server/database failures with 500. Database details are logged in the backend terminal and are not returned to the browser.

## Testing

Use the frontend or an API client such as Postman or Thunder Client. For example, send `GET http://localhost:3000/api/students`, then try POST with the JSON body above. For PUT and DELETE, replace `:id` in the URL with a real student ID. Search and filter with the GET URLs in the endpoint table.

The app flow is: browser form -> `fetch()` -> Express route -> student service -> mysql2 connection pool -> MySQL -> JSON response -> browser table. CRUD maps to POST/INSERT, GET/SELECT, PUT/UPDATE, and DELETE/DELETE.

## Common problems

| Problem | Why it happens, how to check, and what to do |
| --- | --- |
| `Cannot find module 'express'`, `'mysql2'`, or `'dotenv'` | Packages are missing from this folder's install. Run `npm install` in `node-database` and check `npm ls express mysql2 dotenv`. |
| Database connection failed | MySQL may be stopped or `DB_HOST` may be wrong. Check that the MySQL Workbench local instance is connected and confirm `DB_HOST` in `.env`. |
| `Access denied for user` | MySQL rejected the user/password. Verify `DB_USER` and `DB_PASSWORD` in `.env`; do not put the password in JavaScript. |
| `Unknown database 'school_db'` | The database was not created or selected. In Workbench run `CREATE DATABASE school_db;`, then run the setup in `schema.sql` only as appropriate. |
| `Table 'school_db.students' doesn't exist` | The table is missing. Check with `SHOW TABLES;` after `USE school_db;`, then create it from `schema.sql`. |
| SQL syntax error | A query may have a typo or SQL for another database product was run. Check the failing statement in Workbench and use MySQL syntax. |
| `db.execute is not a function` | `db.js` may export something other than the mysql2 promise pool. Confirm it uses `mysql2/promise`, calls `createPool()`, and ends with `module.exports = db`. |
| `Cannot GET /students` | This app's routes start with `/api`. Use `http://localhost:3000/api/students` for the API or `http://localhost:3000` for the page. |
| API returns 404 | The URL may be wrong, or the requested student ID may not exist. Check the route spelling and try an ID returned by `GET /api/students`. |
| CORS error | The browser and API have different origins. This app serves both from Express; open the page at `http://localhost:3000` rather than opening the HTML as a file. |
| Frontend cannot connect | The server may not be running or may use a different port. Check the terminal for the startup message and keep the page/API on the same port. |
| Invalid JSON | POST/PUT bodies must be valid JSON and include `Content-Type: application/json`. Check matching quotes, commas, and braces. |
| Port already in use | Another process is using `PORT`. Set an unused port in `.env`, restart, and open the matching localhost URL. |

`.env` is excluded by the root and backend `.gitignore` files. If the database password was ever committed or shared, change it in MySQL and update the local `.env` value.
