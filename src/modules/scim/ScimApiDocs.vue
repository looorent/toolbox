<script setup lang="ts">
import { TbButton, TbCodeBlock, TbCopyButton, TbExpandable, TbHttpMethodBadge } from '@components'
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
  <div class="tb-stack-6">
    <div class="tb-stack-2">
      <div class="tb-row tb-row--between">
        <h2 class="tb-section-title">API Reference</h2>
        <TbButton
          variant="secondary"
          size="sm"
          title="Copy OpenAPI 3.0 spec URL (importable in Postman, Insomnia, etc.)"
          :class="copiedKey === 'openapi' ? 'tb-text-success' : ''"
          @click="copyOpenApiUrl"
        >
          <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copiedKey === 'openapi' ? 'Copied!' : 'OpenAPI' }}
        </TbButton>
      </div>
      <div class="tb-info-bar">
        <span class="tb-hint tb-flex-shrink-0">Base URL</span>
        <code class="tb-code-inline tb-text-secondary tb-truncate tb-flex-fill">{{ scimBaseUrl }}</code>
        <TbCopyButton :value="scimBaseUrl" class="tb-flex-shrink-0" />
      </div>
      <p class="tb-hint">
        This server implements the <strong class="tb-text-secondary">SCIM 2.0</strong> standard (<a href="https://tools.ietf.org/html/rfc7644" target="_blank" rel="noopener" class="tb-text-accent tb-link">RFC 7644</a>).
        All endpoints accept and return <code class="tb-text-secondary">application/scim+json</code>.
      </p>
    </div>

    <div v-for="section in buildEndpoints()" :key="section.title" class="tb-stack-2">
      <h3 class="tb-label tb-label--inline">{{ section.title }}</h3>

      <TbExpandable
        v-for="endpoint in section.endpoints"
        :key="endpointKey(section.title, endpoint.method, endpoint.path)"
        :model-value="expandedEndpoint === endpointKey(section.title, endpoint.method, endpoint.path)"
        @update:model-value="toggleEndpoint(endpointKey(section.title, endpoint.method, endpoint.path))"
      >
        <template #header>
          <TbHttpMethodBadge :method="endpoint.method" size="sm" />
          <code class="tb-code-inline tb-text-primary tb-truncate tb-flex-fill">{{ endpoint.path }}</code>
          <span class="tb-hint tb-sm-show">{{ endpoint.summary }}</span>
        </template>

        <div class="tb-stack-4">
          <p class="tb-text-xs tb-text-secondary">{{ endpoint.description }}</p>

          <TbCodeBlock v-if="endpoint.requestBody" title="Request Body" :value="endpoint.requestBody" copyable />
          <TbCodeBlock title="cURL Example" :value="endpoint.curlExample" copyable />
        </div>
      </TbExpandable>
    </div>
  </div>
</template>
