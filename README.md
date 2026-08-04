<<<<<<< HEAD
# E-Commerce Registration and Login Application

Full-stack authentication application with React frontend, Spring Boot backend, MySQL database, JWT authentication, and session management.
=======
# SmartAccessories

SmartAccessories is a full-stack e-commerce web application built with React for the frontend and Spring Boot for the backend. The app supports user registration and login, product browsing by category, cart management, checkout with Razorpay, and order history.

## Features Implemented

- User authentication with registration, login, and logout
- JWT-based authentication for protected API calls
- Product browsing by category with stock indicators
- Add-to-cart flow with live cart count updates
- Cart management including quantity updates and item removal
- Checkout integration with Razorpay for secure payments
- Order placement and order history viewing
- Protected routes for authenticated users
- Responsive shopping UI with category navigation and cart experience

## Tech Stack

- Frontend: React, Vite, React Router, React Icons
- Backend: Spring Boot, Spring Security, JWT, Hibernate/JPA
- Database: MySQL
- Payments: Razorpay
>>>>>>> f7997f2 (Updated Readme file)

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
<<<<<<< HEAD
- MySQL running on `localhost:3306` with database `stringstack-ecommerce`

## Database Configuration

- Host: `localhost`
- Port: `3306`
- `Username: `root`
- Password: `vrasdfgh`
- Database: `stringstack-ecommerce

Tables (`Users`, `Sessions`) are created automatically via Hibernate on first backend startup.
=======
- MySQL running on localhost:3306

## Database Setup

Create a MySQL database named `mobile_accessories` and update the database credentials in the backend configuration file if needed.
>>>>>>> f7997f2 (Updated Readme file)

## Backend Setup

```bash
cd backend
<<<<<<< HEAD
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`

### API Endpoints

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| POST   | `/register`| Register a new user      |
| POST   | `/login`   | Authenticate and get JWT |
| POST   | `/logout`  | Invalidate session (Bearer token required) |
=======
./mvnw spring-boot:run
```

The backend runs at http://localhost:8080.
>>>>>>> f7997f2 (Updated Readme file)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

<<<<<<< HEAD
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
=======
The frontend runs at http://localhost:5173.

## Main Application Routes

- `/` — redirects users to the appropriate page based on authentication state
- `/register` — user registration page
- `/login` — user login page
- `/home` — protected product catalog page
- `/cart` — protected shopping cart page
- `/orders` — protected order history page

## Backend API Overview

### Authentication

- `POST /register` — register a new user
- `POST /login` — authenticate a user and return a JWT
- `POST /logout` — log out the current user

### Products

- `GET /categories` — fetch all product categories
- `GET /products/category/{categoryId}` — fetch products for a category
- `GET /products/{productId}` — fetch a single product

### Cart

- `GET /cart` — fetch the current user’s cart
- `GET /cart/count` — fetch cart item count
- `POST /cart` — add a product to the cart
- `PUT /cart/{cartItemId}` — update cart item quantity
- `DELETE /cart/{cartItemId}` — remove an item from the cart

### Orders and Payments

- `POST /orders/create` — create a Razorpay order
- `POST /payments/verify` — verify a completed payment
- `GET /orders` — retrieve order history for the logged-in user

## Security Features

- Password hashing with BCrypt
- JWT-based authentication
- Protected routes and protected API access
- Secure payment verification flow

## Notes

The application is designed for local development and uses MySQL as its persistence layer. Make sure your database is running before starting the backend.
>>>>>>> f7997f2 (Updated Readme file)
