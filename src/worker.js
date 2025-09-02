export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    
    // Handle API routes for project management
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // For static assets, return 404 (will be handled by Pages)
    return new Response('Not Found', { status: 404 });
  },
};

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Project management endpoints
    if (pathname === '/api/projects') {
      if (method === 'GET') {
        return await listProjects(env, corsHeaders);
      } else if (method === 'POST') {
        return await createProject(request, env, corsHeaders);
      }
    } else if (pathname.startsWith('/api/projects/')) {
      const projectId = pathname.split('/')[3];
      if (method === 'GET') {
        return await getProject(projectId, env, corsHeaders);
      } else if (method === 'PUT') {
        return await updateProject(request, projectId, env, corsHeaders);
      } else if (method === 'DELETE') {
        return await deleteProject(projectId, env, corsHeaders);
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function listProjects(env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const objects = await bucket.list();
  
  const projects = [];
  for (const object of objects.objects) {
    if (object.key.endsWith('.json')) {
      const projectData = await bucket.get(object.key);
      if (projectData) {
        const project = JSON.parse(await projectData.text());
        projects.push({
          id: project.id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        });
      }
    }
  }

  return new Response(JSON.stringify(projects), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createProject(request, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const projectData = await request.json();
  
  const project = {
    id: generateId(),
    name: projectData.name,
    description: projectData.description || '',
    scenarios: projectData.scenarios || [],
    customCards: projectData.customCards || {},
    roles: projectData.roles || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await bucket.put(`${project.id}.json`, JSON.stringify(project));

  return new Response(JSON.stringify(project), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getProject(projectId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const projectData = await bucket.get(`${projectId}.json`);
  
  if (!projectData) {
    return new Response('Project not found', { status: 404, headers: corsHeaders });
  }

  const project = JSON.parse(await projectData.text());
  return new Response(JSON.stringify(project), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateProject(request, projectId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const existingData = await bucket.get(`${projectId}.json`);
  
  if (!existingData) {
    return new Response('Project not found', { status: 404, headers: corsHeaders });
  }

  const existingProject = JSON.parse(await existingData.text());
  const updateData = await request.json();
  
  const updatedProject = {
    ...existingProject,
    ...updateData,
    id: projectId,
    updatedAt: new Date().toISOString()
  };

  await bucket.put(`${projectId}.json`, JSON.stringify(updatedProject));

  return new Response(JSON.stringify(updatedProject), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteProject(projectId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  await bucket.delete(`${projectId}.json`);
  
  return new Response(null, { status: 204, headers: corsHeaders });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
