import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage for testing
let projects = [];
let customRoles = [];
let idCounter = 1;

// Generate simple ID
function generateId() {
  return `mock_${idCounter++}_${Date.now()}`;
}

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const project = {
    id: generateId(),
    ...req.body,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(project);
  res.json(project);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects[index] = {
    ...projects[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects.splice(index, 1);
  res.status(204).send();
});

// Custom roles endpoints
app.get('/api/custom-roles', (req, res) => {
  res.json(customRoles);
});

app.post('/api/custom-roles', (req, res) => {
  const role = {
    id: generateId(),
    ...req.body,
    isCustom: true,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customRoles.push(role);
  res.json(role);
});

app.delete('/api/custom-roles/:id', (req, res) => {
  const index = customRoles.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Role not found' });
  }
  customRoles.splice(index, 1);
  res.status(204).send();
});

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
