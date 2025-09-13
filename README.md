# Cybersecurity Fire Drill

A comprehensive cybersecurity incident response training platform that simulates real-world cyber threats through interactive role-playing scenarios. Built with React and deployed on Cloudflare Workers with D1 database integration.

**🔐 Authentication Required**: Sign in with Google to access the platform and manage your training content.

## 🚀 Live Demo

- **Production**: https://fire-drill.coscient.workers.dev
- **Test Environment**: https://fire-drill-test.coscient.workers.dev

*Latest Version*: c24e7672-67c6-43d9-a319-a213177cd776

## 📋 Project Overview

The Cybersecurity Fire Drill application helps organizations practice incident response through structured scenarios based on the NIST Cybersecurity Framework. Users can select organizational roles, choose from various cyber incident scenarios, and work through realistic response procedures.

### Key Features

- **🔐 Google OAuth Authentication**: Secure sign-in with Google accounts for user data isolation
- **👤 User Profile Management**: Profile pictures and account management with data separation
- **🎭 Role-Based Training**: Select from predefined organizational roles (CISO, IT Manager, Security Analyst, etc.) or create custom roles
- **📚 Scenario Library**: Multiple cybersecurity incident scenarios including phishing attacks, malware infections, data breaches, and more
- **✏️ Custom Content**: Create and manage custom scenarios and roles tailored to your organization
- **💾 Project Management**: Save and load training configurations for repeated use
- **🎮 Interactive Gameplay**: Step-through incident response procedures with decision points and learning objectives
- **👥 Multiplayer Support**: Facilitate team training sessions with custom roles and scenarios
- **🔄 Team Collaboration**: Export/import scenarios for team sharing

## 🛠 Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth 2.0 with JWT token validation
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers Platform

## 🏗 Architecture

The application uses a serverless architecture with:
- React frontend built and embedded inline in the Cloudflare Worker
- Google OAuth authentication with JWT token validation
- RESTful API endpoints for data management with user authentication
- D1 database for persistent storage with user data isolation
- Single-file deployment with embedded assets

## 📦 Installation & Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account with Workers and D1 access
- Google Cloud Console project with OAuth 2.0 credentials configured

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/czhengjuarez/CyberSecurityFireDrill.git
   cd CyberSecurityFireDrill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Cloudflare D1 database**
   ```bash
   # Create D1 database
   npx wrangler d1 create fire-drill-db
   
   # Update wrangler.toml with your database ID
   # Run database migrations
   npx wrangler d1 execute fire-drill-db --file=schema.sql
   ```

4. **Configure Google OAuth**
   ```bash
   # Create config.local.toml with your Google OAuth credentials
   echo 'GOOGLE_CLIENT_ID = "your-google-client-id"' > config.local.toml
   echo 'GOOGLE_CLIENT_SECRET = "your-google-client-secret"' >> config.local.toml
   
   # Store client secret in Cloudflare Workers secrets
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   ```

5. **Start local development**
   ```bash
   # Start React dev server (must use port 5174 for Google OAuth)
   npm run dev
   
   # In another terminal, start Cloudflare Workers dev server
   npx wrangler dev
   ```

### Building and Deployment

1. **Build the React application**
   ```bash
   npm run build
   ```

2. **Update the worker with fresh build**
   ```bash
   node fix-inline.cjs
   ```

3. **Deploy to Cloudflare Workers**
   ```bash
   npx wrangler deploy
   ```

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── GameSetup.jsx   # Main setup interface
│   │   ├── GameBoard.jsx   # Training gameplay
│   │   ├── CustomRoleManager.jsx
│   │   ├── ScenarioEditor.jsx
│   │   └── ...
│   ├── data/
│   │   └── gameData.js     # Default roles and scenarios
│   └── utils/
│       └── scenarioStorage.js
├── workers-site/
│   └── index.js            # Cloudflare Worker with embedded React app
├── schema.sql              # Database schema
├── fix-inline.cjs          # Build automation script
├── wrangler.toml          # Cloudflare Workers configuration
└── package.json
```

## 🗄 Database Schema

The application uses a multi-user database schema with user data isolation:

- **users**: User accounts with Google OAuth integration (id, email, name, picture, provider info)
- **projects**: Saved training configurations (linked to user_id)
- **custom_roles**: User-created organizational roles (linked to user_id)
- **custom_scenarios**: User-created incident scenarios (linked to user_id)
- **multiplayer_sessions**: Team training sessions (linked to facilitator_id)

All user data is isolated by `user_id` foreign keys with cascade deletion support.

## 🔧 Configuration

### Environment Variables

Configure in `wrangler.toml`:

```toml
name = "fire-drill"
main = "workers-site/index.js"
compatibility_date = "2023-12-01"

[[d1_databases]]
binding = "DB"
database_name = "fire-drill-db"
database_id = "your-database-id"
```

### API Endpoints

**Authentication Endpoints:**
- `POST /api/auth/login` - Google OAuth login with JWT token
- `DELETE /api/auth/account` - Delete user account and all data

**Protected Endpoints (require authentication):**
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/custom-roles` - List user's custom roles
- `POST /api/custom-roles` - Create custom role
- `DELETE /api/custom-roles/:id` - Delete custom role
- `GET /api/custom-scenarios` - List user's custom scenarios
- `POST /api/custom-scenarios` - Create custom scenario
- `DELETE /api/custom-scenarios/:id` - Delete custom scenario

## 🎯 Usage

1. **Authentication**: Sign in with your Google account to access the platform
2. **Setup**: Enter your name and select project type (Single Player, Multiplayer, or Custom Multiplayer)
3. **Role Selection**: Choose organizational roles you want to practice or create custom roles
4. **Scenario Selection**: Pick a cybersecurity incident scenario or create custom scenarios
5. **Training**: Work through the incident response procedures with decision points
6. **Save Projects**: Save configurations for future training sessions
7. **Team Management**: Export/import scenarios and facilitate multiplayer sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


---

Built with ❤️ for cybersecurity education and training.
