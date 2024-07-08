# Node.js Express JWT Authentication

A Node.js application using Express and JWT for authentication.

## Features
- User registration
- User login
- Protected routes with JWT

## Prerequisites
- Node.js >= v20.8.0
- MongoDB (or any other database you are using)

## Installation
```bash
git clone https://github.com/pankajmadhikar/express-auth-jwt.git
cd your-repo
npm install

## Running the Application
```bash
npm start

## Usage
To use the API, follow these steps:
1. Register a new user via `POST /api/user/register`
2. Login with registered user credentials via `POST /api/user/login`
3. Use the received JWT token to access protected routes


## API Endpoints
- `POST /api/user/register`: Register a new user.
- `POST /api/user/login`: Authenticate a user and get a token.
- `GET /api/protected`: Access protected resource (requires JWT).


## Contributing
Contributions are welcome! Please open an issue or submit a pull request.


## License
This project is licensed under the MIT License.


## Contact Information
Maintained by [Your Name](mailto:your.email@example.com).


├── src
│   ├── config
│   │   └── config.js
│   ├── controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── models
│   │   └── user.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── middleware
│   │   └── authMiddleware.js
│   ├── utils
│   │   └── jwtUtils.js
│   ├── app.js
│   └── server.js
├── test
│   ├── auth.test.js
│   └── user.test.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── LICENSE


.env:
DATABASE_URL=mongodb://localhost:27017/yourdb
JWT_SECRET=your_jwt_secret



src/config/config.js:
require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};




src/middleware/errorMiddleware.js:

function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}

module.exports = errorHandler;
