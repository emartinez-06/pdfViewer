# PDF Viewer

A modern web-based PDF viewer application with backend API support.

## Project Structure

```
pdfViewer/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── tests/               # Backend tests
│   └── config/              # Configuration files
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS/SCSS files
│   │   └── assets/          # Static assets
│   ├── public/              # Public files
│   └── tests/               # Frontend tests
├── docs/                    # Documentation
├── database/                # Database files/migrations
└── scripts/                 # Build/deployment scripts
```

## Features

- PDF file viewing and navigation
- Document management
- Responsive design
- RESTful API backend

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pdfViewer
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Development

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

## API Documentation

API documentation will be available at `/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.