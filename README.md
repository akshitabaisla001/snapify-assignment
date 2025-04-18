# Snapify - API-Driven Photo Gallery

A modern RESTful API for managing photo uploads and galleries.

## Features

- User authentication and authorization
- Photo upload with Cloudinary integration
- Gallery management with pagination
- Admin reporting and statistics
- Secure access control
- Comprehensive logging

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize
- Cloudinary for file storage
- JWT for authentication
- Winston for logging

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and get JWT token
- `GET /auth/me` - Get current user profile

### Photos

- `POST /photos/upload` - Upload a photo (with form-data)
- `GET /photos` - Get all photos with pagination
- `GET /photos/:id` - Get a single photo by ID
- `DELETE /photos/:id` - Delete a photo

### Admin

- `GET /admin/stats` - Get system statistics (admin only)

## Getting Started

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies: `npm install`
4. Create database: `createdb snapify`
5. Start the server: `npm run dev`

## Environment Variables

Make sure to set the following environment variables:

```
PORT=3000
NODE_ENV=development

DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=snapify
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## License

MIT# snapify-assignment
