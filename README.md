# Cybersecurity Fire Drill

A comprehensive cybersecurity incident response training platform that simulates real-world cyber threats through interactive role-playing scenarios. Built with React and deployed on Cloudflare Workers with D1 database integration.

## 🚀 Live Demo

- **Production**: https://fire-drill.coscient.workers.dev
- **Test Environment**: https://fire-drill-test.coscient.workers.dev

## 📋 Project Overview

The Cybersecurity Fire Drill application helps organizations practice incident response through structured scenarios based on the NIST Cybersecurity Framework. Users can select organizational roles, choose from various cyber incident scenarios, and work through realistic response procedures.

### Key Features

- **Role-Based Training**: Select from predefined organizational roles (CISO, IT Manager, Security Analyst, etc.) or create custom roles
- **Scenario Library**: Multiple cybersecurity incident scenarios including phishing attacks, malware infections, data breaches, and more
- **Custom Content**: Create and manage custom scenarios and roles tailored to your organization
- **Project Management**: Save and load training configurations for repeated use
- **Interactive Gameplay**: Step-through incident response procedures with decision points and learning objectives
- **Team Collaboration**: Export/import scenarios for team sharing

## 🛠 Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers Platform

## 🏗 Architecture

The application uses a serverless architecture with:
- React frontend built and embedded inline in the Cloudflare Worker
- RESTful API endpoints for data management
- D1 database for persistent storage of projects and custom content
- Single-file deployment with embedded assets

## 📦 Installation & Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account with Workers and D1 access

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

4. **Start local development**
   ```bash
   # Start React dev server
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

The application uses three main tables:

- **projects**: Saved training configurations
- **custom_roles**: User-created organizational roles  
- **custom_scenarios**: User-created incident scenarios

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

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/custom-roles` - List custom roles
- `POST /api/custom-roles` - Create custom role
- `DELETE /api/custom-roles/:id` - Delete custom role

## 🎯 Usage

1. **Setup**: Enter your name and select project type
2. **Role Selection**: Choose organizational roles you want to practice
3. **Scenario Selection**: Pick a cybersecurity incident scenario
4. **Training**: Work through the incident response procedures
5. **Save Projects**: Save configurations for future training sessions

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
