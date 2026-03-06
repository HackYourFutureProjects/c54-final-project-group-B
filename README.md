# BiCycleL - Premium Second-Hand Bike Marketplace

BiCycleL is a community-driven marketplace for high-quality second-hand bikes in the Netherlands. Built with the MERN stack, this platform features dynamic search, real-time messaging via WebSockets, and a modern responsive interface.

This project was developed as part of the HackYourFuture curriculum using Agile methodologies.

[Live Application](https://bicyclel.nl)

## Features

- **Real-time Communication**: Integrated chat system powered by Socket.IO with JWT authentication.
- **Advanced Search**: Location-based filtering, text-based keyword scoring, and interactive UI controls.
- **Security**: Implementation of NoSQL injection protection, rate limiting, and secure RESTful middleware.
- **Responsive Design**: Optimized for both mobile and desktop experiences using a unified navigation system.

## Project Setup

To initialize the project and install all dependencies:

```bash
npm install
npm run setup
```

The `setup` command automatically installs dependencies for both the `client` and `server` directories.

### Environment Configuration

1. Create a `.env` file in both the `client` and `server` directories by copying their respective `.env.example` templates.
2. Configure the required environment variables (MongoDB URI, JWT secrets, API keys).

### Development Mode

To start the application in development mode:

```bash
npm run dev
```

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Tech Stack Details](docs/TECH_STACK.md)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: Socket.IO
- **Testing**: Jest, Cypress

## Deployment

The application is configured for deployment on platforms like Heroku. For detailed instructions, please refer to the [Deployment Guide](docs/DEPLOYMENT.md).
