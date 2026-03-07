<script setup lang="ts">
import { TbCard } from '@components'

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
    case 'yes': return 'tb-badge--valid'
    case 'partial': return 'tb-badge--accent'
    case 'no': return ''
  }
}
</script>

<template>
  <div class="tb-stack-6">
    <div>
      <h2 class="tb-section-title">SCIM 2.0 Compliance</h2>
      <p class="tb-hint tb-mt-2">
        Coverage against <a href="https://tools.ietf.org/html/rfc7644" target="_blank" rel="noopener" class="tb-text-accent tb-link">RFC 7644</a>
        and <a href="https://tools.ietf.org/html/rfc7643" target="_blank" rel="noopener" class="tb-text-accent tb-link">RFC 7643</a>.
        The implemented subset covers what real identity providers exercise in practice.
      </p>
    </div>

    <div v-for="section in sections" :key="section.title" class="tb-stack-2">
      <h3 class="tb-label tb-label--inline">{{ section.title }}</h3>
      <div class="tb-table__wrapper">
        <table class="tb-table">
          <thead>
            <tr>
              <th class="tb-w-third">Feature</th>
              <th class="tb-w-20">Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in section.rows"
              :key="row.feature"
            >
              <td class="tb-text-secondary">{{ row.feature }}</td>
              <td>
                <span
                  class="tb-badge"
                  :class="statusClass(row.status)"
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="tb-text-muted">{{ row.notes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="tb-stack-2">
      <h3 class="tb-label tb-label--inline">Identity Provider Notes</h3>
      <div class="tb-stack-3">
        <TbCard
          v-for="idp in idpNotes"
          :key="idp.name"
          :title="idp.name"
        >
          <ul class="tb-stack-3 tb-list-reset">
            <li
              v-for="item in idp.items"
              :key="item"
              class="tb-row tb-items-start tb-text-xs tb-text-secondary"
            >
              <span class="tb-text-muted tb-flex-shrink-0 tb-mt-1">-</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </TbCard>
      </div>
    </div>
  </div>
</template>
