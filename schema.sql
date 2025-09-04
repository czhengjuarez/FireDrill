-- Fire Drill Database Schema

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    scenarios TEXT, -- JSON array of scenario names
    custom_cards TEXT, -- JSON array of custom cards
    selected_roles TEXT, -- JSON array of selected roles
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom scenarios table
CREATE TABLE IF NOT EXISTS custom_scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    severity TEXT,
    estimated_time TEXT,
    objectives TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Multiplayer sessions table
CREATE TABLE IF NOT EXISTS multiplayer_sessions (
    id TEXT PRIMARY KEY,
    facilitator_id TEXT NOT NULL,
    facilitator_name TEXT NOT NULL,
    session_code TEXT UNIQUE NOT NULL,
    scenario_data TEXT NOT NULL, -- JSON
    available_roles TEXT DEFAULT '[]', -- JSON array of role IDs selected by facilitator
    participants TEXT DEFAULT '[]', -- JSON array
    current_inject_id TEXT,
    phase TEXT DEFAULT 'setup', -- 'setup', 'briefing', 'active', 'debrief', 'completed'
    responses TEXT DEFAULT '{}', -- JSON object
    facilitator_notes TEXT DEFAULT '',
    session_log TEXT DEFAULT '[]', -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom roles table
CREATE TABLE IF NOT EXISTS custom_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT, -- JSON array of responsibilities
    icon TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_custom_roles_created_at ON custom_roles(created_at);
