const fs = require('fs');
const path = require('path');

// Read the built files
const htmlContent = fs.readFileSync('dist/index.html', 'utf8');
const assetFiles = fs.readdirSync('dist/assets');

const cssFile = assetFiles.find(f => f.endsWith('.css'));
const jsFile = assetFiles.find(f => f.endsWith('.js'));

let cssContent = '';
let jsContent = '';

if (cssFile) {
  cssContent = fs.readFileSync(`dist/assets/${cssFile}`, 'utf8');
}

if (jsFile) {
  jsContent = fs.readFileSync(`dist/assets/${jsFile}`, 'utf8');
}

// Create inline HTML with embedded CSS and JS
// Escape template literals and dollar signs to prevent conflicts
const escapedJsContent = jsContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const inlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cybersecurity Fire Drill</title>
    <style>
${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
${escapedJsContent}
    </script>
</body>
</html>`;

// Update the worker with the inline HTML
const workerTemplate = `import { v4 as uuidv4 } from 'uuid';

// Inline HTML with embedded React app
const INLINE_HTML = \`${inlineHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const { pathname } = url
    
    // Handle API routes for project management
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, env)
    }
    
    // Serve the inline React app for all other routes
    return new Response(INLINE_HTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}

async function handleApiRequest(request, env) {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Project management endpoints
    if (pathname === '/api/projects') {
      if (method === 'GET') {
        return await listProjects(env, corsHeaders)
      } else if (method === 'POST') {
        return await createProject(request, env, corsHeaders)
      }
    } else if (pathname.startsWith('/api/projects/')) {
      const projectId = pathname.split('/')[3]
      if (method === 'GET') {
        return await getProject(projectId, env, corsHeaders)
      } else if (method === 'PUT') {
        return await updateProject(request, projectId, env, corsHeaders)
      } else if (method === 'DELETE') {
        return await deleteProject(projectId, env, corsHeaders)
      }
    }
    
    // Custom roles endpoints
    else if (pathname === '/api/custom-roles') {
      if (method === 'GET') {
        return await listCustomRoles(env, corsHeaders)
      } else if (method === 'POST') {
        return await createCustomRole(request, env, corsHeaders)
      }
    } else if (pathname.startsWith('/api/custom-roles/')) {
      const roleId = pathname.split('/')[3]
      if (method === 'GET') {
        return await getCustomRole(roleId, env, corsHeaders)
      } else if (method === 'PUT') {
        return await updateCustomRole(request, roleId, env, corsHeaders)
      } else if (method === 'DELETE') {
        return await deleteCustomRole(roleId, env, corsHeaders)
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Project CRUD operations
async function listProjects(env, corsHeaders) {
  try {
    const result = await env.DB.prepare('SELECT * FROM projects ORDER BY created_at DESC').all()
    const projects = result.results.map(project => ({
      ...project,
      scenarios: JSON.parse(project.scenarios || '[]'),
      custom_cards: JSON.parse(project.custom_cards || '[]')
    }))
    
    return new Response(JSON.stringify(projects), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function createProject(request, env, corsHeaders) {
  try {
    const projectData = await request.json()
    const projectId = uuidv4()
    
    await env.DB.prepare(\`
      INSERT INTO projects (id, name, description, scenarios, custom_cards, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    \`).bind(
      projectId,
      projectData.name,
      projectData.description || '',
      JSON.stringify(projectData.scenarios || []),
      JSON.stringify(projectData.custom_cards || [])
    ).run()
    
    const project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description || '',
      scenarios: projectData.scenarios || [],
      custom_cards: projectData.custom_cards || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getProject(projectId, env, corsHeaders) {
  try {
    const result = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first()
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const project = {
      ...result,
      scenarios: JSON.parse(result.scenarios || '[]'),
      custom_cards: JSON.parse(result.custom_cards || '[]')
    }
    
    return new Response(JSON.stringify(project), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function updateProject(request, projectId, env, corsHeaders) {
  try {
    const projectData = await request.json()
    
    await env.DB.prepare(\`
      UPDATE projects 
      SET name = ?, description = ?, scenarios = ?, custom_cards = ?, updated_at = datetime('now')
      WHERE id = ?
    \`).bind(
      projectData.name,
      projectData.description || '',
      JSON.stringify(projectData.scenarios || []),
      JSON.stringify(projectData.custom_cards || []),
      projectId
    ).run()
    
    const project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description || '',
      scenarios: projectData.scenarios || [],
      custom_cards: projectData.custom_cards || [],
      updated_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(project), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function deleteProject(projectId, env, corsHeaders) {
  try {
    await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run()
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Custom roles CRUD operations
async function listCustomRoles(env, corsHeaders) {
  try {
    const result = await env.DB.prepare('SELECT * FROM custom_roles ORDER BY created_at DESC').all()
    const roles = result.results.map(role => ({
      ...role,
      responsibilities: JSON.parse(role.responsibilities || '[]')
    }))
    
    return new Response(JSON.stringify(roles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function createCustomRole(request, env, corsHeaders) {
  try {
    const roleData = await request.json()
    const roleId = uuidv4()
    
    await env.DB.prepare(\`
      INSERT INTO custom_roles (id, name, description, responsibilities, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    \`).bind(
      roleId,
      roleData.name,
      roleData.description || '',
      JSON.stringify(roleData.responsibilities || [])
    ).run()
    
    const role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description || '',
      responsibilities: roleData.responsibilities || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(role), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getCustomRole(roleId, env, corsHeaders) {
  try {
    const result = await env.DB.prepare('SELECT * FROM custom_roles WHERE id = ?').bind(roleId).first()
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const role = {
      ...result,
      responsibilities: JSON.parse(result.responsibilities || '[]')
    }
    
    return new Response(JSON.stringify(role), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function updateCustomRole(request, roleId, env, corsHeaders) {
  try {
    const roleData = await request.json()
    
    await env.DB.prepare(\`
      UPDATE custom_roles 
      SET name = ?, description = ?, responsibilities = ?, updated_at = datetime('now')
      WHERE id = ?
    \`).bind(
      roleData.name,
      roleData.description || '',
      JSON.stringify(roleData.responsibilities || []),
      roleId
    ).run()
    
    const role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description || '',
      responsibilities: roleData.responsibilities || [],
      updated_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(role), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function deleteCustomRole(roleId, env, corsHeaders) {
  try {
    await env.DB.prepare('DELETE FROM custom_roles WHERE id = ?').bind(roleId).run()
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}`;

// Write the new worker file
fs.writeFileSync('workers-site/index.js', workerTemplate);

console.log('✅ Created inline worker with embedded React app');
console.log(`📊 HTML size: ${inlineHtml.length} characters`);
console.log(`📊 CSS size: ${cssContent.length} characters`);
console.log(`📊 JS size: ${jsContent.length} characters`);
