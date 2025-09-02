import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const { pathname } = url
    
    // Handle API routes for project management
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, env)
    }
    
    // Serve static assets using KV asset handler
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil?.bind(ctx),
        }
      )
    } catch (e) {
      // If asset not found, serve index.html for SPA routing
      if (pathname !== '/' && !pathname.includes('.')) {
        try {
          const indexRequest = new Request(`${url.origin}/index.html`, request)
          
          const response = await getAssetFromKV(
            {
              request: indexRequest,
              waitUntil: ctx.waitUntil?.bind(ctx),
            }
          )
          
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache',
            },
            status: 200,
          })
        } catch (e) {
          return new Response(`SPA fallback failed: ${e.message}`, { status: 404 })
        }
      }
      
      return new Response(`Asset not found: ${pathname} - ${e.message}`, { status: 404 })
    }
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

async function listProjects(env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const objects = await bucket.list({ prefix: 'projects/' });
  
  const projects = [];
  for (const object of objects.objects) {
    if (object.key.endsWith('.json')) {
      const projectData = await bucket.get(object.key);
      if (projectData) {
        const project = JSON.parse(await projectData.text());
        projects.push(project);
      }
    }
  }

  return new Response(JSON.stringify(projects), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createProject(request, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  const projectData = await request.json()
  
  const project = {
    id: generateId(),
    name: projectData.name,
    selectedRoles: projectData.selectedRoles || [],
    selectedScenario: projectData.selectedScenario || null,
    createdAt: projectData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await bucket.put(`projects/${project.id}.json`, JSON.stringify(project))

  return new Response(JSON.stringify(project), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getProject(event, projectId, corsHeaders) {
  const bucket = event.env.FIRE_DRILL_PROJECTS
  const projectData = await bucket.get(`projects/${projectId}.json`)
  
  if (!projectData) {
    return new Response('Project not found', { status: 404, headers: corsHeaders })
  }

  const project = JSON.parse(await projectData.text())
  return new Response(JSON.stringify(project), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateProject(event, projectId, corsHeaders) {
  const bucket = event.env.FIRE_DRILL_PROJECTS
  const existingData = await bucket.get(`projects/${projectId}.json`)
  
  if (!existingData) {
    return new Response('Project not found', { status: 404, headers: corsHeaders })
  }

  const existingProject = JSON.parse(await existingData.text())
  const updateData = await event.request.json()
  
  const updatedProject = {
    ...existingProject,
    ...updateData,
    id: projectId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  }

  await bucket.put(`projects/${projectId}.json`, JSON.stringify(updatedProject))

  return new Response(JSON.stringify(updatedProject), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteProject(projectId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS
  await bucket.delete(`projects/${projectId}.json`)
  
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Custom Roles API Functions
async function listCustomRoles(env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const objects = await bucket.list({ prefix: 'custom-roles/' });
  
  const roles = [];
  for (const object of objects.objects) {
    if (object.key.endsWith('.json')) {
      const roleData = await bucket.get(object.key);
      if (roleData) {
        const role = JSON.parse(await roleData.text());
        roles.push(role);
      }
    }
  }

  return new Response(JSON.stringify(roles), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createCustomRole(request, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const roleData = await request.json();
  
  const role = {
    id: roleData.id || generateId(),
    name: roleData.name,
    description: roleData.description || '',
    color: roleData.color || 'bg-blue-500',
    icon: roleData.icon || 'user',
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await bucket.put(`custom-roles/${role.id}.json`, JSON.stringify(role));

  return new Response(JSON.stringify(role), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCustomRole(roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const roleData = await bucket.get(`custom-roles/${roleId}.json`);
  
  if (!roleData) {
    return new Response('Role not found', { status: 404, headers: corsHeaders });
  }

  const role = JSON.parse(await roleData.text());
  return new Response(JSON.stringify(role), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateCustomRole(request, roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const existingData = await bucket.get(`custom-roles/${roleId}.json`);
  
  if (!existingData) {
    return new Response('Role not found', { status: 404, headers: corsHeaders });
  }

  const existingRole = JSON.parse(await existingData.text());
  const updateData = await request.json();
  
  const updatedRole = {
    ...existingRole,
    ...updateData,
    id: roleId,
    updatedAt: new Date().toISOString()
  };

  await bucket.put(`custom-roles/${roleId}.json`, JSON.stringify(updatedRole));

  return new Response(JSON.stringify(updatedRole), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteCustomRole(roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  await bucket.delete(`custom-roles/${roleId}.json`);
  
  return new Response(null, { status: 204, headers: corsHeaders });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}
