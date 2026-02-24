<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import { useCopy } from '@composables/useCopy'
import { ref } from 'vue'

const props = defineProps<{
  serverId: string
  scimBaseUrl: string
  bearerToken: string | null
}>()

const { copy, copiedKey } = useCopy()

function copyOpenApiUrl(): void {
  const url = `${window.location.origin}/api/scim-servers/${props.serverId}/openapi.json`
  copy('openapi', url)
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
  method: HttpMethod
  path: string
  summary: string
  description: string
  curlExample: string
  requestBody?: string
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  POST: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  PUT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  PATCH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/20',
}

function methodColor(method: HttpMethod): string {
  return METHOD_COLORS[method]
}

function buildEndpoints(): { title: string; endpoints: Endpoint[] }[] {
  const base = props.scimBaseUrl
  const tokenValue = props.bearerToken ?? '<token>'
  const authHeader = `-H 'Authorization: Bearer ${tokenValue}'`

  return [
    {
      title: 'Discovery',
      endpoints: [
        {
          method: 'GET',
          path: '/ServiceProviderConfig',
          summary: 'Service Provider Configuration',
          description: 'Returns the SCIM service provider capabilities.',
          curlExample: `curl -s '${base}/ServiceProviderConfig' \\\n  ${authHeader}`,
        },
        {
          method: 'GET',
          path: '/ResourceTypes',
          summary: 'Resource Types',
          description: 'Lists the resource types (User, Group) supported by this server.',
          curlExample: `curl -s '${base}/ResourceTypes' \\\n  ${authHeader}`,
        },
        {
          method: 'GET',
          path: '/Schemas',
          summary: 'Schemas',
          description: 'Lists the SCIM schemas supported by this server.',
          curlExample: `curl -s '${base}/Schemas' \\\n  ${authHeader}`,
        },
      ],
    },
    {
      title: 'Users',
      endpoints: [
        {
          method: 'GET',
          path: '/Users',
          summary: 'List Users',
          description: 'Returns a paginated list of users. Supports filtering with the `filter` query parameter (e.g. `filter=userName eq "alice"`).',
          curlExample: `curl -s '${base}/Users' \\\n  ${authHeader}\n\n# With filter\ncurl -s '${base}/Users?filter=userName+eq+"alice.johnson"' \\\n  ${authHeader}\n\n# With pagination\ncurl -s '${base}/Users?startIndex=1&count=10' \\\n  ${authHeader}`,
        },
        {
          method: 'POST',
          path: '/Users',
          summary: 'Create User',
          description: 'Creates a new user. `userName` is required.',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            userName: 'alice.johnson',
            name: { givenName: 'Alice', familyName: 'Johnson' },
            displayName: 'Alice Johnson',
            emails: [{ value: 'alice@example.com', type: 'work', primary: true }],
            active: true,
          }, null, 2),
          curlExample: `curl -s -X POST '${base}/Users' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],"userName":"alice.johnson","name":{"givenName":"Alice","familyName":"Johnson"},"emails":[{"value":"alice@example.com","primary":true}],"active":true}'`,
        },
        {
          method: 'GET',
          path: '/Users/:id',
          summary: 'Get User',
          description: 'Returns a single user by ID.',
          curlExample: `curl -s '${base}/Users/<userId>' \\\n  ${authHeader}`,
        },
        {
          method: 'PUT',
          path: '/Users/:id',
          summary: 'Replace User',
          description: 'Replaces all attributes of an existing user.',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            userName: 'alice.johnson',
            name: { givenName: 'Alice', familyName: 'Johnson' },
            active: false,
          }, null, 2),
          curlExample: `curl -s -X PUT '${base}/Users/<userId>' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],"userName":"alice.johnson","active":false}'`,
        },
        {
          method: 'PATCH',
          path: '/Users/:id',
          summary: 'Patch User',
          description: 'Applies partial updates to a user using SCIM patch operations (`add`, `replace`, `remove`).',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
            Operations: [
              { op: 'replace', path: 'active', value: false },
              { op: 'replace', path: 'displayName', value: 'Alice J.' },
            ],
          }, null, 2),
          curlExample: `curl -s -X PATCH '${base}/Users/<userId>' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"op":"replace","path":"active","value":false}]}'`,
        },
        {
          method: 'DELETE',
          path: '/Users/:id',
          summary: 'Delete User',
          description: 'Deletes a user. Returns 204 No Content on success.',
          curlExample: `curl -s -X DELETE '${base}/Users/<userId>' \\\n  ${authHeader}`,
        },
      ],
    },
    {
      title: 'Groups',
      endpoints: [
        {
          method: 'GET',
          path: '/Groups',
          summary: 'List Groups',
          description: 'Returns a paginated list of groups.',
          curlExample: `curl -s '${base}/Groups' \\\n  ${authHeader}\n\n# With filter\ncurl -s '${base}/Groups?filter=displayName+eq+"Engineering"' \\\n  ${authHeader}`,
        },
        {
          method: 'POST',
          path: '/Groups',
          summary: 'Create Group',
          description: 'Creates a new group. `displayName` is required.',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
            displayName: 'Engineering',
            members: [{ value: '<userId>', display: 'Alice Johnson' }],
          }, null, 2),
          curlExample: `curl -s -X POST '${base}/Groups' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"],"displayName":"Engineering","members":[{"value":"<userId>"}]}'`,
        },
        {
          method: 'GET',
          path: '/Groups/:id',
          summary: 'Get Group',
          description: 'Returns a single group by ID.',
          curlExample: `curl -s '${base}/Groups/<groupId>' \\\n  ${authHeader}`,
        },
        {
          method: 'PUT',
          path: '/Groups/:id',
          summary: 'Replace Group',
          description: 'Replaces all attributes of an existing group including its member list.',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
            displayName: 'Engineering',
            members: [],
          }, null, 2),
          curlExample: `curl -s -X PUT '${base}/Groups/<groupId>' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"],"displayName":"Engineering","members":[]}'`,
        },
        {
          method: 'PATCH',
          path: '/Groups/:id',
          summary: 'Patch Group',
          description: 'Applies partial updates to a group. Supports adding/removing members.',
          requestBody: JSON.stringify({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
            Operations: [
              { op: 'add', path: 'members', value: [{ value: '<userId>' }] },
            ],
          }, null, 2),
          curlExample: `curl -s -X PATCH '${base}/Groups/<groupId>' \\\n  -H 'Content-Type: application/scim+json' \\\n  ${authHeader} \\\n  -d '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"op":"add","path":"members","value":[{"value":"<userId>"}]}]}'`,
        },
        {
          method: 'DELETE',
          path: '/Groups/:id',
          summary: 'Delete Group',
          description: 'Deletes a group. Returns 204 No Content on success.',
          curlExample: `curl -s -X DELETE '${base}/Groups/<groupId>' \\\n  ${authHeader}`,
        },
      ],
    },
  ]
}

const expandedEndpoint = ref<string | null>(null)

function toggleEndpoint(key: string): void {
  expandedEndpoint.value = expandedEndpoint.value === key ? null : key
}

function endpointKey(section: string, method: string, path: string): string {
  return `${section}:${method}:${path}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-text-primary">API Reference</h2>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-raised border border-border transition-colors cursor-pointer"
          :class="copiedKey === 'openapi' ? 'text-success border-success/20' : 'text-text-secondary hover:border-border-focus hover:text-text-primary'"
          title="Copy OpenAPI 3.0 spec URL (importable in Postman, Insomnia, etc.)"
          @click="copyOpenApiUrl"
        >
          <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copiedKey === 'openapi' ? 'Copied!' : 'OpenAPI' }}
        </button>
      </div>
      <div class="flex items-center gap-2 px-3 py-2 bg-surface-raised rounded-lg border border-border">
        <span class="text-xs text-text-muted shrink-0">Base URL</span>
        <code class="flex-1 text-xs font-mono text-text-secondary truncate">{{ scimBaseUrl }}</code>
        <CopyButton :value="scimBaseUrl" class="shrink-0" />
      </div>
      <p class="text-xs text-text-muted">
        This server implements the <strong class="text-text-secondary">SCIM 2.0</strong> standard (<a href="https://tools.ietf.org/html/rfc7644" target="_blank" rel="noopener" class="text-accent hover:underline">RFC 7644</a>).
        All endpoints accept and return <code class="text-text-secondary">application/scim+json</code>.
      </p>
    </div>

    <div v-for="section in buildEndpoints()" :key="section.title" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.title }}</h3>

      <div
        v-for="endpoint in section.endpoints"
        :key="endpointKey(section.title, endpoint.method, endpoint.path)"
        class="rounded-lg border border-border overflow-hidden"
      >
        <!-- Header row (clickable) -->
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-3 bg-surface-raised hover:bg-surface-overlay transition-colors text-left cursor-pointer"
          @click="toggleEndpoint(endpointKey(section.title, endpoint.method, endpoint.path))"
        >
          <span
            class="shrink-0 px-2 py-0.5 text-xs font-mono font-semibold rounded border uppercase"
            :class="methodColor(endpoint.method)"
          >{{ endpoint.method }}</span>
          <code class="flex-1 text-xs font-mono text-text-primary truncate">{{ endpoint.path }}</code>
          <span class="shrink-0 text-xs text-text-muted hidden sm:block">{{ endpoint.summary }}</span>
          <svg
            class="w-4 h-4 text-text-muted shrink-0 transition-transform"
            :class="expandedEndpoint === endpointKey(section.title, endpoint.method, endpoint.path) ? 'rotate-180' : ''"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Expanded content -->
        <div
          v-if="expandedEndpoint === endpointKey(section.title, endpoint.method, endpoint.path)"
          class="border-t border-border"
        >
          <div class="p-4 flex flex-col gap-4">
            <p class="text-xs text-text-secondary">{{ endpoint.description }}</p>

            <div v-if="endpoint.requestBody">
              <p class="text-xs font-semibold text-text-muted mb-2">Request Body</p>
              <div class="relative">
                <pre class="text-xs font-mono text-text-secondary bg-surface rounded-lg p-3 border border-border overflow-x-auto">{{ endpoint.requestBody }}</pre>
                <CopyButton :value="endpoint.requestBody" class="absolute top-2 right-2" />
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold text-text-muted mb-2">cURL Example</p>
              <div class="relative">
                <pre class="text-xs font-mono text-text-secondary bg-surface rounded-lg p-3 border border-border overflow-x-auto">{{ endpoint.curlExample }}</pre>
                <CopyButton :value="endpoint.curlExample" class="absolute top-2 right-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
