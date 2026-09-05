# TaskFlow

A full-stack team project management application built with **Next.js, TypeScript, Node.js, Express.js, PostgreSQL, Prisma, Redis, and Socket.IO**.

TaskFlow allows users to authenticate, create and manage projects, create and manage tasks, assign tasks to users, manage task status and priority, and communicate with the backend through a documented REST API.

## 🚀 Live Demo

- **Frontend:** https://taskflow-alpha-amber.vercel.app/login
- **Backend Health:** https://taskflow-4047.onrender.com/api/health
- **API Documentation (local):** http://localhost:5000/api-docs

## ✨ Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected API routes
- Current authenticated user endpoint
- Password hashing with bcrypt

### Project Management

- Create projects
- View all projects
- View individual projects
- Update projects
- Delete projects
- Project ownership

### Task Management

- Create tasks
- View tasks
- View individual tasks
- Update tasks
- Delete tasks
- Assign tasks to users
- Task status management
- Task priority management
- Due dates
- Project-based task organization

### Real-Time Communication

- Socket.IO integration
- Real-time server events
- Client-side Socket.IO connection
- Environment-aware production Socket.IO configuration

### Backend

- RESTful API
- Express.js
- PostgreSQL
- Prisma ORM
- Redis integration
- Zod request validation
- Centralized error handling
- Helmet security middleware
- CORS
- Swagger/OpenAPI documentation

### Testing

- Jest
- Supertest
- API/integration testing
- Coverage reporting
- 61 automated backend tests

### DevOps

- Docker
- Docker Compose
- GitHub Actions CI
- Automated Prisma migrations
- Vercel frontend deployment
- Render backend deployment
- Render PostgreSQL
- Render Redis-compatible Key Value

## 🛠️ Tech Stack

| Category               | Technologies                             |
| ---------------------- | ---------------------------------------- |
| Frontend               | Next.js, React, TypeScript, Tailwind CSS |
| State Management       | Redux Toolkit, RTK Query                 |
| Backend                | Node.js, Express.js                      |
| Database               | PostgreSQL                               |
| ORM                    | Prisma                                   |
| Authentication         | JWT, bcrypt                              |
| Validation             | Zod                                      |
| Cache / Infrastructure | Redis                                    |
| Real-Time              | Socket.IO                                |
| API Documentation      | Swagger / OpenAPI                        |
| Testing                | Jest, Supertest                          |
| Containers             | Docker, Docker Compose                   |
| CI/CD                  | GitHub Actions                           |
| Frontend Deployment    | Vercel                                   |
| Backend Deployment     | Render                                   |

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │   Next.js Frontend   │
                         └──────────┬───────────┘
                                    │
                       REST API     │     Socket.IO
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express Server    │
                         │       Node.js        │
                         └──────┬────────┬──────┘
                                │        │
                         Prisma │        │ Redis
                                │        │
                                ▼        ▼
                     ┌──────────────┐  ┌──────────────┐
                     │  PostgreSQL  │  │    Redis     │
                     │   Database   │  │   Service    │
                     └──────────────┘  └──────────────┘
```

### Production Architecture

```text
                         Internet
                            │
                            ▼
                  ┌──────────────────┐
                  │      Vercel      │
                  │ Next.js Frontend │
                  └────────┬─────────┘
                           │
                      HTTPS / API
                           │
                           ▼
                  ┌──────────────────┐
                  │      Render      │
                  │ Express Backend  │
                  └───────┬─────┬────┘
                          │     │
                     Prisma     │ Redis
                          │     │
                          ▼     ▼
                    PostgreSQL Redis
```

## 📁 Project Structure

```text
taskflow/
│
├── client/
│   ├── app/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── lib/
│   │   └── store/
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── auth/
│   │   ├── project/
│   │   ├── task/
│   │   ├── user/
│   │   ├── middleware/
│   │   ├── prisma.js
│   │   ├── redis.js
│   │   ├── socket.js
│   │   ├── swagger.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔐 Authentication Flow

TaskFlow uses JWT-based authentication.

```text
User
 │
 │ Register / Login
 ▼
Express API
 │
 ├── Validate request
 ├── Hash / verify password
 └── Generate JWT
 │
 ▼
Client
 │
 └── Authentication token
        │
        ▼
   Protected API Request
        │
        └── Authorization: Bearer <token>
```

Protected routes verify the JWT before allowing access to authenticated resources.

## 🗄️ Database Schema

TaskFlow currently uses three main models.

### User

```text
User
 ├── id
 ├── name
 ├── email
 ├── password
 ├── createdAt
 └── updatedAt
```

A user can own projects and can be assigned tasks.

### Project

```text
Project
 ├── id
 ├── name
 ├── description
 ├── ownerId
 ├── createdAt
 └── updatedAt
```

A project belongs to a user and can contain multiple tasks.

### Task

```text
Task
 ├── id
 ├── title
 ├── description
 ├── status
 ├── priority
 ├── dueDate
 ├── projectId
 ├── assignedTo
 ├── createdAt
 └── updatedAt
```

Tasks belong to projects and can optionally be assigned to users.

## 📡 API Overview

### Health

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "TaskFlow API is running"
}
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Projects

```http
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```http
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Users

```http
GET /api/users
```

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 📖 Swagger / OpenAPI

TaskFlow includes interactive Swagger/OpenAPI documentation.

Run the backend locally and open:

```text
http://localhost:5000/api-docs
```

Swagger can be used to explore the available REST endpoints and understand the API contract.

## ⚡ Socket.IO

TaskFlow uses Socket.IO for real-time communication.

The backend creates a Socket.IO server alongside the Express HTTP server.

The client uses an environment-aware Socket.IO URL:

```text
Local:
http://localhost:5000

Production:
https://taskflow-4047.onrender.com
```

This allows the same frontend codebase to operate in both development and production environments.

## 🧪 Testing

The backend uses **Jest** and **Supertest**.

### Run tests

```bash
cd server
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

Current test results:

```text
Test Suites: 5 passed
Tests:       61 passed
```

The test suite covers important backend functionality including authentication, projects, tasks, validation, and API behavior.

## 🐳 Docker

TaskFlow includes Docker configuration for the complete application stack.

### Services

```text
Frontend   → Next.js
Backend    → Node.js + Express
Database   → PostgreSQL
Cache      → Redis
```

### Start the complete stack

From the project root:

```bash
docker compose up --build
```

### Stop containers

```bash
docker compose down
```

### Stop containers and remove volumes

```bash
docker compose down -v
```

### Local service URLs

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:5000

Swagger:
http://localhost:5000/api-docs

PostgreSQL:
localhost:5433

Redis:
localhost:6380
```

## ⚙️ Environment Variables

### Backend

Create:

```text
server/.env
```

Example:

```env
DATABASE_URL="postgresql://taskflow:taskflow123@localhost:5432/taskflow"
JWT_SECRET="your_secure_jwt_secret"
REDIS_URL="redis://localhost:6379"
PORT=5000
```

### Frontend

Create a frontend environment file when required:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production:

```env
NEXT_PUBLIC_API_URL=https://taskflow-4047.onrender.com/api
```

> Never commit real production secrets or `.env` files to Git.

## 🧬 Prisma

Generate Prisma Client:

```bash
cd server
npx prisma generate
```

Create and apply a development migration:

```bash
npx prisma migrate dev
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

## 🔄 Database Migrations

TaskFlow uses Prisma migrations to manage database schema changes.

Current migrations include:

```text
init
add-project
add-task
```

The production Docker container runs:

```bash
npx prisma migrate deploy
```

before starting the backend server, ensuring pending migrations are applied to the production database.

## 🔁 CI/CD

GitHub Actions is used for automated backend testing.

The CI workflow:

```text
Checkout Repository
        │
        ▼
Setup Node.js
        │
        ▼
Install Dependencies
        │
        ▼
Generate Prisma Client
        │
        ▼
Start PostgreSQL + Redis
        │
        ▼
Run Prisma Migrations
        │
        ▼
Run Jest Tests
        │
        ▼
Generate Coverage
```

The workflow runs on pushes and pull requests targeting the configured main development branches.

## 🚀 Deployment

TaskFlow is deployed using the following infrastructure:

```text
Frontend  → Vercel
Backend   → Render
Database  → Render PostgreSQL
Redis     → Render Key Value
CI/CD     → GitHub Actions
```

### Production URLs

**Frontend**

```text
https://taskflow-alpha-amber.vercel.app
```

**Backend**

```text
https://taskflow-4047.onrender.com
```

**Health Check**

```text
https://taskflow-4047.onrender.com/api/health
```

## 🔒 Security Practices

TaskFlow currently implements:

- Password hashing with bcrypt
- JWT authentication
- Protected backend routes
- Zod request validation
- Helmet security middleware
- CORS support
- Environment variables for secrets
- `.env` files excluded from Git
- Centralized error handling
- Prisma-based database access

## 📊 Production Verification

The production application has been tested for the main application flow:

- User registration
- User login
- Frontend-to-backend API communication
- Project creation
- Task creation
- Task updates
- Data persistence
- PostgreSQL production connection
- Redis production connection
- Prisma production migrations
- Production frontend deployment
- Production backend deployment

## 🔮 Future Improvements

Potential improvements for future versions:

- Role-based access control
- Team/workspace management
- Project member invitations
- Advanced task filtering
- Search
- Pagination
- Redis caching for frequently accessed data
- Redis-based rate limiting
- Notifications
- Activity timeline
- Drag-and-drop Kanban board
- File attachments
- Email notifications
- Refresh-token rotation
- End-to-end testing with Playwright
- Production monitoring and structured logging

## 🎯 Project Goals

TaskFlow was built as a practical full-stack project to demonstrate:

- Modern Next.js development
- TypeScript
- REST API design
- JWT authentication
- PostgreSQL database design
- Prisma ORM
- Redis integration
- Real-time communication with Socket.IO
- API validation with Zod
- Automated testing
- Swagger/OpenAPI documentation
- Docker containerization
- CI/CD with GitHub Actions
- Cloud deployment
- Production environment configuration

## 👨‍💻 Author

**Chandan Kumar**

Full Stack Web Developer

Focused on building modern, scalable, and production-oriented web applications.

## ⭐ Project Highlights

```text
Frontend        Next.js + TypeScript
UI              Tailwind CSS
State           Redux Toolkit + RTK Query
Backend         Node.js + Express.js
Database        PostgreSQL + Prisma
Cache           Redis
Realtime        Socket.IO
Authentication  JWT + bcrypt
Validation      Zod
Testing         Jest + Supertest
API Docs        Swagger / OpenAPI
Containers      Docker + Docker Compose
CI/CD           GitHub Actions
Frontend Host   Vercel
Backend Host    Render
```

## 📌 Status

**Production deployed and operational.**
