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

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL running on localhost:3306

## Local Configuration

Sensitive values such as the database password, JWT secret, and Razorpay credentials should be kept in a local-only file.

1. Copy the example file:
   ```bash
   cp backend/src/main/resources/application-local.properties.example backend/src/main/resources/application-local.properties
   ```
2. Fill in your local values in the copied file.
3. Keep that file untracked locally; it is ignored by Git.

## Database Setup

Create a MySQL database named `mobile_accessories` and update the local credentials in the copied configuration file.

## Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

The backend runs at http://localhost:8080.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

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

## Security Notes

- Password hashing with BCrypt
- JWT-based authentication
- Protected routes and protected API access
- Secret values should stay in local configuration and never be committed to Git
