var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-eEWUqE/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// workers-site/index.js
var workers_site_default = {
  async fetch(request, env, ctx) {
    const event = { request, env, ctx };
    return handleEvent(event);
  }
};
async function handleEvent(event) {
  const url = new URL(event.request.url);
  const { pathname } = url;
  if (pathname.startsWith("/api/")) {
    return handleApiRequest(event);
  }
  try {
    const bucket = event.env.FIRE_DRILL_PROJECTS;
    let assetKey = pathname === "/" ? "index.html" : pathname.substring(1);
    let object = await bucket.get(assetKey);
    if (!object) {
      object = await bucket.get("index.html");
      if (!object) {
        return new Response("App not found", { status: 404 });
      }
    }
    let contentType = "text/plain";
    if (assetKey.endsWith(".html")) contentType = "text/html";
    else if (assetKey.endsWith(".js")) contentType = "application/javascript";
    else if (assetKey.endsWith(".css")) contentType = "text/css";
    else if (assetKey.endsWith(".svg")) contentType = "image/svg+xml";
    else if (assetKey.endsWith(".png")) contentType = "image/png";
    else if (assetKey.endsWith(".jpg") || assetKey.endsWith(".jpeg")) contentType = "image/jpeg";
    return new Response(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
      }
    });
  } catch (error) {
    return new Response("Error loading page: " + error.message, { status: 500 });
  }
}
__name(handleEvent, "handleEvent");
async function handleApiRequest(event) {
  const url = new URL(event.request.url);
  const { pathname, searchParams } = url;
  const method = event.request.method;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (pathname === "/api/projects") {
      if (method === "GET") {
        return await listProjects(event.env, corsHeaders);
      } else if (method === "POST") {
        return await createProject(event.request, event.env, corsHeaders);
      }
    } else if (pathname.startsWith("/api/projects/")) {
      const projectId = pathname.split("/")[3];
      if (method === "GET") {
        return await getProject(projectId, event.env, corsHeaders);
      } else if (method === "PUT") {
        return await updateProject(event.request, projectId, event.env, corsHeaders);
      } else if (method === "DELETE") {
        return await deleteProject(projectId, event.env, corsHeaders);
      }
    } else if (pathname === "/api/custom-roles") {
      if (method === "GET") {
        return await listCustomRoles(event.env, corsHeaders);
      } else if (method === "POST") {
        return await createCustomRole(event.request, event.env, corsHeaders);
      }
    } else if (pathname.startsWith("/api/custom-roles/")) {
      const roleId = pathname.split("/")[3];
      if (method === "GET") {
        return await getCustomRole(roleId, event.env, corsHeaders);
      } else if (method === "PUT") {
        return await updateCustomRole(event.request, roleId, event.env, corsHeaders);
      } else if (method === "DELETE") {
        return await deleteCustomRole(roleId, event.env, corsHeaders);
      }
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleApiRequest, "handleApiRequest");
async function listProjects(env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const objects = await bucket.list({ prefix: "projects/" });
  const projects = [];
  for (const object of objects.objects) {
    if (object.key.endsWith(".json")) {
      const projectData = await bucket.get(object.key);
      if (projectData) {
        const project = JSON.parse(await projectData.text());
        projects.push(project);
      }
    }
  }
  return new Response(JSON.stringify(projects), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(listProjects, "listProjects");
async function createProject(request, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const projectData = await request.json();
  const project = {
    id: generateId(),
    name: projectData.name,
    selectedRoles: projectData.selectedRoles || [],
    selectedScenario: projectData.selectedScenario || null,
    createdAt: projectData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await bucket.put(`projects/${project.id}.json`, JSON.stringify(project));
  return new Response(JSON.stringify(project), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(createProject, "createProject");
async function getProject(event, projectId, corsHeaders) {
  const bucket = event.env.FIRE_DRILL_PROJECTS;
  const projectData = await bucket.get(`projects/${projectId}.json`);
  if (!projectData) {
    return new Response("Project not found", { status: 404, headers: corsHeaders });
  }
  const project = JSON.parse(await projectData.text());
  return new Response(JSON.stringify(project), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getProject, "getProject");
async function updateProject(event, projectId, corsHeaders) {
  const bucket = event.env.FIRE_DRILL_PROJECTS;
  const existingData = await bucket.get(`projects/${projectId}.json`);
  if (!existingData) {
    return new Response("Project not found", { status: 404, headers: corsHeaders });
  }
  const existingProject = JSON.parse(await existingData.text());
  const updateData = await event.request.json();
  const updatedProject = {
    ...existingProject,
    ...updateData,
    id: projectId,
    // Ensure ID doesn't change
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await bucket.put(`projects/${projectId}.json`, JSON.stringify(updatedProject));
  return new Response(JSON.stringify(updatedProject), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(updateProject, "updateProject");
async function deleteProject(projectId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  await bucket.delete(`projects/${projectId}.json`);
  return new Response(null, { status: 204, headers: corsHeaders });
}
__name(deleteProject, "deleteProject");
async function listCustomRoles(env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const objects = await bucket.list({ prefix: "custom-roles/" });
  const roles = [];
  for (const object of objects.objects) {
    if (object.key.endsWith(".json")) {
      const roleData = await bucket.get(object.key);
      if (roleData) {
        const role = JSON.parse(await roleData.text());
        roles.push(role);
      }
    }
  }
  return new Response(JSON.stringify(roles), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(listCustomRoles, "listCustomRoles");
async function createCustomRole(request, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  if (!bucket) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const roleData = await request.json();
  const role = {
    id: roleData.id || generateId(),
    name: roleData.name,
    description: roleData.description || "",
    color: roleData.color || "bg-blue-500",
    icon: roleData.icon || "user",
    isCustom: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await bucket.put(`custom-roles/${role.id}.json`, JSON.stringify(role));
  return new Response(JSON.stringify(role), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(createCustomRole, "createCustomRole");
async function getCustomRole(roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const roleData = await bucket.get(`custom-roles/${roleId}.json`);
  if (!roleData) {
    return new Response("Role not found", { status: 404, headers: corsHeaders });
  }
  const role = JSON.parse(await roleData.text());
  return new Response(JSON.stringify(role), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getCustomRole, "getCustomRole");
async function updateCustomRole(request, roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  const existingData = await bucket.get(`custom-roles/${roleId}.json`);
  if (!existingData) {
    return new Response("Role not found", { status: 404, headers: corsHeaders });
  }
  const existingRole = JSON.parse(await existingData.text());
  const updateData = await request.json();
  const updatedRole = {
    ...existingRole,
    ...updateData,
    id: roleId,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await bucket.put(`custom-roles/${roleId}.json`, JSON.stringify(updatedRole));
  return new Response(JSON.stringify(updatedRole), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(updateCustomRole, "updateCustomRole");
async function deleteCustomRole(roleId, env, corsHeaders) {
  const bucket = env.FIRE_DRILL_PROJECTS;
  await bucket.delete(`custom-roles/${roleId}.json`);
  return new Response(null, { status: 204, headers: corsHeaders });
}
__name(deleteCustomRole, "deleteCustomRole");
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
__name(generateId, "generateId");

// ../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-eEWUqE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = workers_site_default;

// ../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-eEWUqE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
