export function buildScimOpenApiSpec(base: string): object {
  const userExample = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id: '2819c223-7f76-453a-919d-413861904646',
    externalId: 'bjensen',
    userName: 'bjensen@example.com',
    name: { formatted: 'Ms. Barbara J Jensen III', familyName: 'Jensen', givenName: 'Barbara', middleName: 'Jane' },
    displayName: 'Babs Jensen',
    title: 'Tour Guide',
    preferredLanguage: 'en-US',
    locale: 'en-US',
    timezone: 'America/Los_Angeles',
    active: true,
    emails: [
      { value: 'bjensen@example.com', type: 'work', primary: true },
      { value: 'babs@jensen.org', type: 'home' },
    ],
    phoneNumbers: [{ value: 'tel:+1-555-555-5555', type: 'work' }],
    addresses: [
      {
        streetAddress: '100 Universal City Plaza',
        locality: 'Hollywood',
        region: 'CA',
        postalCode: '91608',
        country: 'US',
        type: 'work',
        primary: true,
      },
    ],
    groups: [{ value: 'e9e30dba-f08f-4109-8486-d5c6a331660a', display: 'Tour Guides', type: 'direct' }],
    meta: {
      resourceType: 'User',
      created: '2010-01-23T04:56:22Z',
      lastModified: '2011-05-13T04:42:34Z',
      location: `${base}/Users/2819c223-7f76-453a-919d-413861904646`,
    },
  }

  const groupExample = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    id: 'e9e30dba-f08f-4109-8486-d5c6a331660a',
    displayName: 'Tour Guides',
    members: [{ value: '2819c223-7f76-453a-919d-413861904646', display: 'Babs Jensen' }],
    meta: {
      resourceType: 'Group',
      created: '2010-01-23T04:56:22Z',
      lastModified: '2011-05-13T04:42:34Z',
      location: `${base}/Groups/e9e30dba-f08f-4109-8486-d5c6a331660a`,
    },
  }

  const scimJsonContent = 'application/scim+json'
  const userSchema = { $ref: '#/components/schemas/User' }
  const groupSchema = { $ref: '#/components/schemas/Group' }
  const patchSchema = { $ref: '#/components/schemas/PatchRequest' }
  const errorContent = { [scimJsonContent]: { schema: { $ref: '#/components/schemas/Error' } } }
  const notFound = { description: 'Not found', content: errorContent }

  return {
    openapi: '3.0.3',
    info: {
      title: 'SCIM 2.0 Server',
      description:
        'SCIM 2.0 compliant identity management API implementing RFC 7643 (schema) and RFC 7644 (protocol). All endpoints accept and return `application/scim+json`.',
      version: '2.0.0',
    },
    servers: [{ url: base, description: 'SCIM Server' }],
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Discovery', description: 'Service discovery endpoints' },
      { name: 'Users', description: 'User resource management' },
      { name: 'Groups', description: 'Group resource management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', description: 'OAuth2 Bearer Token (Okta, Entra ID, OneLogin, etc.)' },
        basicAuth: { type: 'http', scheme: 'basic' },
      },
      schemas: {
        Meta: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', example: 'User' },
            created: { type: 'string', format: 'date-time' },
            lastModified: { type: 'string', format: 'date-time' },
            location: { type: 'string', format: 'uri' },
            version: { type: 'string' },
          },
        },
        ScimName: {
          type: 'object',
          properties: {
            formatted: { type: 'string', example: 'Ms. Barbara J Jensen III' },
            familyName: { type: 'string', example: 'Jensen' },
            givenName: { type: 'string', example: 'Barbara' },
            middleName: { type: 'string', example: 'Jane' },
          },
        },
        ScimEmail: {
          type: 'object',
          required: ['value'],
          properties: {
            value: { type: 'string', format: 'email', example: 'bjensen@example.com' },
            type: { type: 'string', enum: ['work', 'home', 'other'], example: 'work' },
            primary: { type: 'boolean', example: true },
          },
        },
        ScimPhoneNumber: {
          type: 'object',
          required: ['value'],
          properties: {
            value: { type: 'string', example: 'tel:+1-555-555-5555' },
            type: { type: 'string', enum: ['work', 'home', 'mobile', 'fax', 'other'], example: 'work' },
          },
        },
        ScimAddress: {
          type: 'object',
          properties: {
            formatted: { type: 'string' },
            streetAddress: { type: 'string', example: '100 Universal City Plaza' },
            locality: { type: 'string', example: 'Hollywood' },
            region: { type: 'string', example: 'CA' },
            postalCode: { type: 'string', example: '91608' },
            country: { type: 'string', example: 'US' },
            type: { type: 'string', enum: ['work', 'home', 'other'], example: 'work' },
            primary: { type: 'boolean' },
          },
        },
        ScimGroupRef: {
          type: 'object',
          properties: {
            value: { type: 'string', description: 'Group ID', example: 'e9e30dba-f08f-4109-8486-d5c6a331660a' },
            display: { type: 'string', example: 'Tour Guides' },
            type: { type: 'string', enum: ['direct', 'indirect'] },
          },
        },
        ScimMember: {
          type: 'object',
          required: ['value'],
          properties: {
            value: { type: 'string', description: 'User ID', example: '2819c223-7f76-453a-919d-413861904646' },
            display: { type: 'string', example: 'Babs Jensen' },
          },
        },
        User: {
          type: 'object',
          required: ['userName'],
          properties: {
            schemas: { type: 'array', items: { type: 'string' }, example: ['urn:ietf:params:scim:schemas:core:2.0:User'] },
            id: { type: 'string', readOnly: true, example: '2819c223-7f76-453a-919d-413861904646' },
            externalId: { type: 'string', example: 'bjensen' },
            userName: { type: 'string', example: 'bjensen@example.com' },
            displayName: { type: 'string', example: 'Babs Jensen' },
            name: { $ref: '#/components/schemas/ScimName' },
            title: { type: 'string', example: 'Tour Guide' },
            preferredLanguage: { type: 'string', example: 'en-US' },
            locale: { type: 'string', example: 'en-US' },
            timezone: { type: 'string', example: 'America/Los_Angeles' },
            active: { type: 'boolean', example: true },
            emails: { type: 'array', items: { $ref: '#/components/schemas/ScimEmail' } },
            phoneNumbers: { type: 'array', items: { $ref: '#/components/schemas/ScimPhoneNumber' } },
            addresses: { type: 'array', items: { $ref: '#/components/schemas/ScimAddress' } },
            groups: { type: 'array', items: { $ref: '#/components/schemas/ScimGroupRef' }, readOnly: true },
            meta: { $ref: '#/components/schemas/Meta', readOnly: true },
          },
        },
        Group: {
          type: 'object',
          required: ['displayName'],
          properties: {
            schemas: { type: 'array', items: { type: 'string' }, example: ['urn:ietf:params:scim:schemas:core:2.0:Group'] },
            id: { type: 'string', readOnly: true, example: 'e9e30dba-f08f-4109-8486-d5c6a331660a' },
            externalId: { type: 'string' },
            displayName: { type: 'string', example: 'Tour Guides' },
            members: { type: 'array', items: { $ref: '#/components/schemas/ScimMember' } },
            meta: { $ref: '#/components/schemas/Meta', readOnly: true },
          },
        },
        ListResponse: {
          type: 'object',
          properties: {
            schemas: { type: 'array', items: { type: 'string' }, example: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'] },
            totalResults: { type: 'integer', example: 1 },
            startIndex: { type: 'integer', example: 1 },
            itemsPerPage: { type: 'integer', example: 100 },
            Resources: { type: 'array', items: {} },
          },
        },
        PatchOperation: {
          type: 'object',
          required: ['op'],
          properties: {
            op: { type: 'string', enum: ['add', 'replace', 'remove'], example: 'replace' },
            path: { type: 'string', example: 'active' },
            value: { description: 'Value to set (omitted for `remove`)' },
          },
        },
        PatchRequest: {
          type: 'object',
          required: ['schemas', 'Operations'],
          properties: {
            schemas: { type: 'array', items: { type: 'string' }, example: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'] },
            Operations: { type: 'array', items: { $ref: '#/components/schemas/PatchOperation' } },
          },
        },
        Error: {
          type: 'object',
          properties: {
            schemas: { type: 'array', items: { type: 'string' }, example: ['urn:ietf:params:scim:api:messages:2.0:Error'] },
            status: { type: 'string', example: '400' },
            scimType: { type: 'string', example: 'invalidValue' },
            detail: { type: 'string', example: 'Field userName is required.' },
          },
        },
      },
    },
    paths: {
      '/ServiceProviderConfig': {
        get: {
          tags: ['Discovery'],
          operationId: 'getServiceProviderConfig',
          summary: 'Service Provider Configuration',
          description: 'Returns the SCIM service provider capabilities including supported features and authentication schemes.',
          responses: {
            '200': {
              description: 'Service provider configuration',
              content: {
                [scimJsonContent]: {
                  schema: { type: 'object' },
                  example: {
                    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
                    documentationUri: 'https://tools.ietf.org/html/rfc7644',
                    patch: { supported: true },
                    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
                    filter: { supported: true, maxResults: 200 },
                    changePassword: { supported: false },
                    sort: { supported: false },
                    etag: { supported: false },
                    authenticationSchemes: [
                      { type: 'oauthbearertoken', name: 'OAuth Bearer Token', description: 'Authentication using an OAuth2 Bearer Token.' },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/ResourceTypes': {
        get: {
          tags: ['Discovery'],
          operationId: 'listResourceTypes',
          summary: 'List Resource Types',
          description: 'Lists the resource types (User, Group) supported by this server.',
          responses: { '200': { description: 'List of resource types', content: { [scimJsonContent]: { schema: { type: 'object' } } } } },
        },
      },
      '/Schemas': {
        get: {
          tags: ['Discovery'],
          operationId: 'listSchemas',
          summary: 'List Schemas',
          description: 'Lists the SCIM schemas supported by this server.',
          responses: { '200': { description: 'List of schemas', content: { [scimJsonContent]: { schema: { type: 'object' } } } } },
        },
      },
      '/Users': {
        get: {
          tags: ['Users'],
          operationId: 'listUsers',
          summary: 'List Users',
          description: 'Returns a paginated list of users. Supports filtering with the `filter` query parameter.',
          parameters: [
            {
              name: 'filter',
              in: 'query',
              description: 'Filter expression (e.g. `userName eq "bjensen@example.com"`)',
              schema: { type: 'string' },
            },
            { name: 'startIndex', in: 'query', description: '1-based index of the first result', schema: { type: 'integer', default: 1 } },
            { name: 'count', in: 'query', description: 'Maximum number of results per page', schema: { type: 'integer', default: 100 } },
            {
              name: 'attributes',
              in: 'query',
              description: 'Comma-separated list of attributes to include',
              schema: { type: 'string' },
              example: 'userName,emails',
            },
          ],
          responses: {
            '200': {
              description: 'List of users',
              content: {
                [scimJsonContent]: {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ListResponse' },
                      { properties: { Resources: { type: 'array', items: userSchema } } },
                    ],
                  },
                  example: {
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
                    totalResults: 1,
                    startIndex: 1,
                    itemsPerPage: 100,
                    Resources: [userExample],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Users'],
          operationId: 'createUser',
          summary: 'Create User',
          description: 'Creates a new user. `userName` is required and must be unique within the server.',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: userSchema,
                examples: {
                  minimal: {
                    summary: 'Minimal user',
                    value: { schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'], userName: 'bjensen@example.com', active: true },
                  },
                  full: {
                    summary: 'Full user with all attributes',
                    value: {
                      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
                      userName: 'bjensen@example.com',
                      externalId: 'bjensen',
                      name: { givenName: 'Barbara', familyName: 'Jensen', middleName: 'Jane', formatted: 'Ms. Barbara J Jensen III' },
                      displayName: 'Babs Jensen',
                      title: 'Tour Guide',
                      preferredLanguage: 'en-US',
                      locale: 'en-US',
                      timezone: 'America/Los_Angeles',
                      active: true,
                      emails: [{ value: 'bjensen@example.com', type: 'work', primary: true }],
                      phoneNumbers: [{ value: 'tel:+1-555-555-5555', type: 'work' }],
                      addresses: [
                        {
                          streetAddress: '100 Universal City Plaza',
                          locality: 'Hollywood',
                          region: 'CA',
                          postalCode: '91608',
                          country: 'US',
                          type: 'work',
                          primary: true,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User created', content: { [scimJsonContent]: { schema: userSchema, example: userExample } } },
            '400': { description: 'Invalid input', content: errorContent },
            '409': { description: 'userName already exists', content: errorContent },
          },
        },
      },
      '/Users/{id}': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
            example: '2819c223-7f76-453a-919d-413861904646',
          },
        ],
        get: {
          tags: ['Users'],
          operationId: 'getUser',
          summary: 'Get User',
          description: 'Returns a single user by ID.',
          responses: {
            '200': { description: 'User found', content: { [scimJsonContent]: { schema: userSchema, example: userExample } } },
            '404': notFound,
          },
        },
        put: {
          tags: ['Users'],
          operationId: 'replaceUser',
          summary: 'Replace User',
          description: 'Replaces all attributes of an existing user. Omitted optional attributes are cleared.',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: userSchema,
                example: {
                  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
                  userName: 'bjensen@example.com',
                  name: { givenName: 'Barbara', familyName: 'Jensen' },
                  displayName: 'Babs Jensen',
                  active: true,
                  emails: [{ value: 'bjensen@example.com', type: 'work', primary: true }],
                },
              },
            },
          },
          responses: {
            '200': { description: 'User replaced', content: { [scimJsonContent]: { schema: userSchema, example: userExample } } },
            '404': notFound,
          },
        },
        patch: {
          tags: ['Users'],
          operationId: 'patchUser',
          summary: 'Patch User',
          description: 'Applies partial updates to a user using SCIM patch operations (`add`, `replace`, `remove`).',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: patchSchema,
                examples: {
                  deactivate: {
                    summary: 'Deactivate user',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'replace', path: 'active', value: false }],
                    },
                  },
                  updateName: {
                    summary: 'Update display name',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'replace', path: 'displayName', value: 'Barbara Jensen' }],
                    },
                  },
                  addEmail: {
                    summary: 'Add secondary email',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'add', path: 'emails', value: [{ value: 'barbara@personal.com', type: 'home' }] }],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'User patched', content: { [scimJsonContent]: { schema: userSchema, example: userExample } } },
            '400': { description: 'Invalid patch operation', content: errorContent },
            '404': notFound,
          },
        },
        delete: {
          tags: ['Users'],
          operationId: 'deleteUser',
          summary: 'Delete User',
          description: 'Permanently deletes a user.',
          responses: { '204': { description: 'User deleted' }, '404': notFound },
        },
      },
      '/Groups': {
        get: {
          tags: ['Groups'],
          operationId: 'listGroups',
          summary: 'List Groups',
          description: 'Returns a paginated list of groups.',
          parameters: [
            {
              name: 'filter',
              in: 'query',
              description: 'Filter expression (e.g. `displayName eq "Tour Guides"`)',
              schema: { type: 'string' },
            },
            { name: 'startIndex', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'count', in: 'query', schema: { type: 'integer', default: 100 } },
          ],
          responses: {
            '200': {
              description: 'List of groups',
              content: {
                [scimJsonContent]: {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ListResponse' },
                      { properties: { Resources: { type: 'array', items: groupSchema } } },
                    ],
                  },
                  example: {
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
                    totalResults: 1,
                    startIndex: 1,
                    itemsPerPage: 100,
                    Resources: [groupExample],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Groups'],
          operationId: 'createGroup',
          summary: 'Create Group',
          description: 'Creates a new group. `displayName` is required.',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: groupSchema,
                examples: {
                  empty: {
                    summary: 'Empty group',
                    value: { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], displayName: 'Tour Guides' },
                  },
                  withMembers: {
                    summary: 'Group with initial members',
                    value: {
                      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
                      displayName: 'Tour Guides',
                      members: [{ value: '2819c223-7f76-453a-919d-413861904646', display: 'Babs Jensen' }],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Group created', content: { [scimJsonContent]: { schema: groupSchema, example: groupExample } } },
            '400': { description: 'Invalid input', content: errorContent },
          },
        },
      },
      '/Groups/{id}': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Group ID',
            schema: { type: 'string' },
            example: 'e9e30dba-f08f-4109-8486-d5c6a331660a',
          },
        ],
        get: {
          tags: ['Groups'],
          operationId: 'getGroup',
          summary: 'Get Group',
          description: 'Returns a single group by ID.',
          responses: {
            '200': { description: 'Group found', content: { [scimJsonContent]: { schema: groupSchema, example: groupExample } } },
            '404': notFound,
          },
        },
        put: {
          tags: ['Groups'],
          operationId: 'replaceGroup',
          summary: 'Replace Group',
          description: 'Replaces all attributes of an existing group including its full member list.',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: groupSchema,
                example: { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], displayName: 'Tour Guides', members: [] },
              },
            },
          },
          responses: {
            '200': { description: 'Group replaced', content: { [scimJsonContent]: { schema: groupSchema, example: groupExample } } },
            '404': notFound,
          },
        },
        patch: {
          tags: ['Groups'],
          operationId: 'patchGroup',
          summary: 'Patch Group',
          description: 'Applies partial updates to a group. Supports adding/removing members and renaming.',
          requestBody: {
            required: true,
            content: {
              [scimJsonContent]: {
                schema: patchSchema,
                examples: {
                  addMember: {
                    summary: 'Add a member',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'add', path: 'members', value: [{ value: '2819c223-7f76-453a-919d-413861904646' }] }],
                    },
                  },
                  removeMember: {
                    summary: 'Remove a member',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'remove', path: 'members[value eq "2819c223-7f76-453a-919d-413861904646"]' }],
                    },
                  },
                  rename: {
                    summary: 'Rename group',
                    value: {
                      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                      Operations: [{ op: 'replace', path: 'displayName', value: 'Senior Tour Guides' }],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Group patched', content: { [scimJsonContent]: { schema: groupSchema, example: groupExample } } },
            '400': { description: 'Invalid patch operation', content: errorContent },
            '404': notFound,
          },
        },
        delete: {
          tags: ['Groups'],
          operationId: 'deleteGroup',
          summary: 'Delete Group',
          description: 'Permanently deletes a group.',
          responses: { '204': { description: 'Group deleted' }, '404': notFound },
        },
      },
    },
  }
}
