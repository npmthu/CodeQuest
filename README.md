# CodeQuest

**CSC13002 - Introduction to Software Engineering Project**

Web-based platform for coding challenges and programming education.

##  Project Structure

```
CodeQuest/
 src/
    backend/         # Node.js + Express + MongoDB
    frontend/        # HTML + CSS + JavaScript
 docs/                # Documentation
 pa/                  # Project Assignments
 README.md
```

##  Status: Initial Setup (PA0)

### Completed:
-  Backend authentication API (register, login, change-password)
-  MongoDB integration
-  JWT token authentication

### Tech Stack:
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Frontend**: HTML5, CSS3, JavaScript

##  Quick Start

Follow these steps to run the project locally (PowerShell commands shown):

1) Install dependencies

```powershell
# (optional) install root deps if present
npm install

# install backend dependencies
cd src/backend
npm install
```

2) Edit MongoDB connection string (only if needed)

Open `src/backend/server.js` and find the mongoose connection call near the top. Example lines to edit:

```javascript
// example local MongoDB (run mongod locally):
mongoose.connect('mongodb://localhost:27017/codequest', { useNewUrlParser: true, useUnifiedTopology: true })

// or MongoDB Atlas (replace <user>, <password>, <cluster> and <dbname>):
mongoose.connect('mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
```

If you run MongoDB locally, make sure the service is running (Windows example):

```powershell
# start MongoDB service (if installed as a service)
net start MongoDB

# or run mongod directly (requires MongoDB binaries in PATH)
mongod --dbpath "C:\\data\\db"
```

3) Start the backend

```powershell
# from src/backend
node server.js
# (or if you have a start script in package.json)
# npm start
```

By default the backend listens on http://localhost:3000 (see `server.js`).

4) Serve the frontend

You can open the HTML directly in your browser or run a simple static server. From the repository root or from `src/frontend` run one of the following:

Using Python (needs Python installed):

```powershell
cd src/frontend
python -m http.server 8000
# then open http://localhost:8000/pages/login_register.html
```

Using Node (npx serve):

```powershell
cd src/frontend
npx serve -l 8000
# then open http://localhost:8000/pages/login_register.html
```

Or open `src/frontend/pages/login_register.html` with the VS Code Live Server extension.

Notes
- If your frontend is served from a different origin than the backend, the backend already enables CORS in `src/backend/server.js` so API calls from the frontend should work.
- After successful login the frontend stores a JWT in `localStorage` and calls the backend API at `http://localhost:3000/api` (see `src/frontend/js/script.js`).
- If you still get MongoDB connection errors, double-check your connection string and that MongoDB is reachable from your machine.

##  Development Branches
- main
- feature-hieu
- feature-nam

---
**CodeQuest Team - CSC13002**
