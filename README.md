# CodeQuest

**CSC13002 - Introduction to Software Engineering Project**

A full-stack web application for coding challenges and learning platform.

## 📁 Project Structure

```
CodeQuest/
├── src/
│   ├── backend/                 # Node.js + Express API
│   │   ├── config/              # Database & config files
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Auth & validation middleware
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   ├── server.js            # Entry point
│   │   ├── package.json         # Backend dependencies
│   │   └── README.md            # Backend documentation
│   │
│   └── frontend/                # Frontend files
│       ├── pages/               # HTML pages
│       ├── css/                 # Stylesheets
│       ├── js/                  # JavaScript files
│       └── assets/              # Images, videos, etc.
│
├── docs/                        # Documentation
│   ├── management/              # Project management docs
│   ├── requirements/            # Requirements & use cases
│   ├── analysis-design/         # Architecture & UML
│   └── test/                    # Test plans & reports
│
├── pa/                          # Project Assignments
│   └── pa0/                     # PA0 submission
│
└── README.md                    # This file
```

## 🚀 Quick Start

### Backend Setup

```bash
cd src/backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

Open `src/frontend/pages/home.html` in browser or use live server.

## 🔧 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

## 📚 API Documentation

See [Backend README](src/backend/README.md) for detailed API documentation.

### Available Endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

## 👥 Team

**Project**: CodeQuest  
**Course**: CSC13002 - Introduction to Software Engineering  
**Methodology**: Scrum (2-week sprints)

## 📝 Development

### Branches

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Workflow

1. Create feature branch from `develop`
2. Implement feature
3. Test locally
4. Create Pull Request to `develop`
5. Code review & merge
6. Deploy to `main` after sprint completion

## 📖 Documentation

All project documentation is in the `/docs` folder:

- **Management**: Sprint plans, weekly reports
- **Requirements**: Vision document, use cases
- **Analysis & Design**: Architecture, UML diagrams
- **Test**: Test plans and reports

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- Environment variables for sensitive data
- CORS enabled
- Input validation

## 📦 Dependencies

See `src/backend/package.json` for complete list.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ by CodeQuest Team**