# TaskFlow

A full-stack team project management application built with **Next.js, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, and Socket.IO**.

TaskFlow helps teams manage projects and tasks with authentication, task assignment, priorities, statuses, real-time updates, API documentation, automated testing, Docker support, and CI/CD.

---

## 🚀 Features

### Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Protected API routes
- Authenticated user profile endpoint
- Password hashing with bcrypt

### Project Management

- Create projects
- View projects
- View individual project details
- Update projects
- Delete projects
- Project ownership

### Task Management

- Create tasks
- Update tasks
- Delete tasks
- Task assignment
- Task status management
- Task priority management
- Project-based task organization
- Due date support

### Real-Time Collaboration

- Socket.IO integration
- Real-time server events
- Client-side Socket.IO connection
- Real-time task/project updates architecture

### Backend & API

- RESTful API architecture
- Express.js
- PostgreSQL
- Prisma ORM
- Redis integration
- Zod request validation
- Centralized error handling
- Helmet security headers
- CORS support
- Swagger/OpenAPI documentation

### Testing

- Jest
- Supertest
- API integration tests
- Test coverage
- 61 automated tests
- High backend test coverage

### DevOps

- Docker
- Docker Compose
- PostgreSQL container
- Redis container
- Production Docker configuration
- GitHub Actions CI
- Automated Prisma migrations
- Vercel frontend deployment
- Render backend deployment

---

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │   Next.js Frontend   │
                         └──────────┬───────────┘
                                    │
                           REST API │ Socket.IO
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express Server    │
                         │      Node.js         │
                         └──────┬────────┬──────┘
                                │        │
                         Prisma │        │ Redis
                                │        │
                                ▼        ▼
                     ┌──────────────┐  ┌──────────────┐
                     │ PostgreSQL   │  │    Redis     │
                     │  Database    │  │    Cache     │
                     └──────────────┘  └──────────────┘

                         Socket.IO
                              │
                              ▼
                     Real-Time Events
```
