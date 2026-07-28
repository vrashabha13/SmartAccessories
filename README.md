# E-Commerce Registration and Login Application

Full-stack authentication application with React frontend, Spring Boot backend, MySQL database, JWT authentication, and session management.

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL running on `localhost:3306` with database `stringstack-ecommerce`

## Database Configuration

- Host: `localhost`
- Port: `3306`
- `Username: `root`
- Database: `stringstack-ecommerce

Tables (`Users`, `Sessions`) are created automatically via Hibernate on first backend startup.

## Backend Setup

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`

### API Endpoints

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| POST   | `/register`| Register a new user      |
| POST   | `/login`   | Authenticate and get JWT |
| POST   | `/logout`  | Invalidate session (Bearer token required) |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Pages

- `/register` — User registration form
- `/login` — User login form
- `/home` — Protected page displaying "Welcome User"

## Security Features

- BCrypt password encryption
- JWT-based authentication
- Server-side session tracking in MySQL
- Protected routes and APIs
- Generic login error messages
