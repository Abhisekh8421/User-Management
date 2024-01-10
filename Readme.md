# User Management System

## Overview

This repository contains the backend implementation of a user management system built with Node.js, Express, MongoDB, and JWT authentication. The system includes features such as user registration, login, logout, profile update, and admin functionalities like managing users, updating user roles, and creating new admin accounts.

## Project Structure

- **controllers**: Contains user and admin controllers handling various functionalities.
- **middlewares**: Includes middleware for user authentication and multer middleware for file uploads.
- **models**: Defines the mongoose schema for the User model.
- **routes**: Contains route definitions for user and admin endpoints.
- **utils**: Houses utility functions, error handling classes, and ApiResponse class.
- **app.js**: Entry point for the Express application.
- **.env.example**: Example environment file. Rename to `.env` and configure accordingly.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Abhisekh8421/RoleMate.git
   ```

2. Install dependencies:

   ```bash
   cd RoleMate
   npm install
   ```

3. Set up your MongoDB database and update the `.env` file with the database URI.

4. Rename `.env.example` to `.env` and configure other environment variables.

5. Run the application:

   ```bash
   npm start
   ```

## Endpoints

### User Routes

- **POST /register**: Register a new user.
- **POST /login**: Login with email and password.
- **GET /logout**: Logout the currently authenticated user.
- **POST /refresh-token**: Refresh access token using the refresh token.
- **PUT /updateUser**: Update user details and profile image.
- **GET /user-profile**: Get the user's profile.
- **DELETE /delete-profile**: Delete the user's profile.

### Admin Routes

- **GET /users**: Get all users (Admin only).
- **GET /users/:userId**: Get user details by ID (Admin only).
- **DELETE /users/:userId**: Delete user by ID (Admin only).
- **PUT /users/:userId**: Update user details by ID (Admin only).
- **PUT /admin-exist-create/:userId**: Convert an existing user to an admin (Admin only).
- **POST /create-newAdmin**: Create a new admin account (Admin only).

## Error Handling

The application uses a custom `ApiError` class for standardized error responses. Error handling is implemented in the controllers.

## Multer Middleware

Multer middleware is used for handling file uploads. The `upload` middleware is configured in `multer_middleware.js`.

## Authentication

JWT (JSON Web Tokens) are used for user authentication. Access tokens and refresh tokens are generated during login and used for subsequent requests.

## Contribute

Feel free to contribute to the project by opening issues, suggesting improvements, or submitting pull requests.

---

**Happy Coding!** 🚀👩‍💻👨‍💻