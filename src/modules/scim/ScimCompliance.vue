<script setup lang="ts">
type Status = 'yes' | 'partial' | 'no'

interface Row {
  feature: string
  status: Status
  notes: string
}

interface Section {
  title: string
  rows: Row[]
}

interface IdpNote {
  name: string
  items: string[]
}

const sections: Section[] = [
  {
    title: 'Protocol — RFC 7644',
    rows: [
      { feature: 'Users — GET / POST / PUT / PATCH / DELETE', status: 'yes', notes: 'Full CRUD' },
      { feature: 'Groups — GET / POST / PUT / PATCH / DELETE', status: 'yes', notes: 'Full CRUD including membership' },
      { feature: 'Filtering — comparison operators', status: 'yes', notes: 'eq, ne, co, sw, ew, pr, gt, ge, lt, le' },
      { feature: 'Filtering — logical operators', status: 'no', notes: 'AND, OR, NOT and parenthesized expressions' },
      { feature: 'Filtering — value path filters', status: 'no', notes: 'emails[type eq "work"] syntax' },
      { feature: 'attributes / excludedAttributes params', status: 'no', notes: 'Responses always return all fields' },
      { feature: 'Pagination (startIndex, count)', status: 'partial', notes: 'Applied in-memory after loading all rows' },
      { feature: 'Sorting (sortBy, sortOrder)', status: 'no', notes: '' },
      { feature: 'Bulk operations (/Bulk)', status: 'no', notes: '' },
      { feature: 'PATCH — flat add / replace / remove', status: 'yes', notes: 'Direct attribute paths on User and Group' },
      { feature: 'PATCH — value filter paths', status: 'no', notes: 'e.g. emails[type eq "work"].value' },
      { feature: 'OPTIONS / CORS preflight', status: 'no', notes: 'Only Access-Control-Allow-Origin: * on responses' },
      { feature: 'ETags / conditional requests', status: 'no', notes: 'W/"…" emitted in meta.version but If-Match / If-None-Match ignored' },
      { feature: 'Search over POST (/.search)', status: 'no', notes: '' },
      { feature: 'GET /Schemas/:id (individual schema)', status: 'no', notes: 'Only the /Schemas list endpoint exists' },
      { feature: 'userName uniqueness', status: 'yes', notes: 'Unique per server; duplicates return 409 Conflict' },
      { feature: 'Authentication / authorization', status: 'yes', notes: 'Bearer token generated per server; validated on every SCIM request' },
    ],
  },
  {
    title: 'Schema — RFC 7643',
    rows: [
      { feature: 'Core User attributes', status: 'yes', notes: 'userName, name, displayName, active, title, emails, phoneNumbers, addresses, locale, timezone, preferredLanguage' },
      { feature: 'password', status: 'no', notes: 'Not stored or validated' },
      { feature: 'nickName, profileUrl, userType', status: 'no', notes: '' },
      { feature: 'photos, ims, entitlements, roles, x509Certificates', status: 'no', notes: '' },
      { feature: 'Enterprise User extension', status: 'no', notes: 'manager, organization, department, division not implemented' },
      { feature: 'Group nesting', status: 'no', notes: 'Members are always Users; group-in-group not supported' },
    ],
  },
]

const idpNotes: IdpNote[] = [
  {
    name: 'Okta',
    items: [
      'Checks for existing users via GET /Users?filter=userName eq "…" before creating — supported.',
      'Deactivates users with PATCH { active: false } rather than DELETE — supported.',
      'Syncs group membership via PATCH on the Group with add / remove member operations — supported.',
      'Sends its own internal ID as externalId — stored and returned.',
      'Configure the Okta app with the Bearer token shown after server creation.',
    ],
  },
  {
    name: 'Entra ID (Azure AD)',
    items: [
      'Probes connectivity on setup with GET /Users?filter=userName eq "nonexistent@domain" — returns an empty list, which is correct.',
      'Uses filter=externalId eq "…" (not userName) for user correlation — supported.',
      'More aggressive about PUT (full replace) for profile sync — supported.',
      'userName is typically a UPN (alice@contoso.com); no format enforcement on this server.',
      'Soft-deletes via PATCH { active: false } — supported.',
      'Configure the Enterprise App with the Bearer token shown after server creation.',
    ],
  }
]

function statusLabel(status: Status): string {
  switch (status) {
    case 'yes': return 'Yes'
    case 'partial': return 'Partial'
    case 'no': return 'No'
  }
}

function statusClass(status: Status): string {
  switch (status) {
    case 'yes': return 'bg-success/10 text-success border-success/20'
    case 'partial': return 'bg-accent/10 text-accent border-accent/20'
    case 'no': return 'bg-surface-overlay text-text-muted border-border'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h2 class="text-sm font-semibold text-text-primary">SCIM 2.0 Compliance</h2>
      <p class="mt-1 text-xs text-text-muted">
        Coverage against <a href="https://tools.ietf.org/html/rfc7644" target="_blank" rel="noopener" class="text-accent hover:underline">RFC 7644</a>
        and <a href="https://tools.ietf.org/html/rfc7643" target="_blank" rel="noopener" class="text-accent hover:underline">RFC 7643</a>.
        The implemented subset covers what real identity providers exercise in practice.
      </p>
    </div>

    <div v-for="section in sections" :key="section.title" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.title }}</h3>
      <div class="rounded-lg border border-border overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-surface-raised border-b border-border">
              <th class="px-4 py-2 text-left font-medium text-text-muted w-1/3">Feature</th>
              <th class="px-4 py-2 text-left font-medium text-text-muted w-20">Status</th>
              <th class="px-4 py-2 text-left font-medium text-text-muted">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in section.rows"
              :key="row.feature"
              class="border-b border-border last:border-0"
            >
              <td class="px-4 py-2.5 text-text-secondary">{{ row.feature }}</td>
              <td class="px-4 py-2.5">
                <span class="px-1.5 py-0.5 rounded border text-xs" :class="statusClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-text-muted">{{ row.notes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Identity Provider Notes</h3>
      <div class="flex flex-col gap-3">
        <div
          v-for="idp in idpNotes"
          :key="idp.name"
          class="rounded-lg border border-border bg-surface-raised p-4"
        >
          <p class="text-xs font-semibold text-text-primary mb-2">{{ idp.name }}</p>
          <ul class="flex flex-col gap-1.5">
            <li
              v-for="item in idp.items"
              :key="item"
              class="flex items-start gap-2 text-xs text-text-secondary"
            >
              <span class="mt-0.5 shrink-0 text-text-muted">–</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
