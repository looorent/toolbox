export function buildWebhookOpenApiSpec(webhookUrl: string): object {
  const parsed = new URL(webhookUrl)
  const webhookPath = parsed.pathname
  const origin = parsed.origin

  const jsonBody = {
    type: 'object',
    additionalProperties: true,
    example: { event: 'test', data: { key: 'value' } },
  }

  const capturedResponse = {
    '200': {
      description: 'Request captured successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              received: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  }

  const bodyContent = {
    'application/json': { schema: jsonBody },
    'application/x-www-form-urlencoded': { schema: { type: 'object', additionalProperties: { type: 'string' } } },
    'text/plain': { schema: { type: 'string' } },
    '*/*': { schema: {} },
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Webhook Catcher',
      description: `Captures and inspects any inbound HTTP request. Send requests to \`${webhookUrl}\` and inspect them in real time.`,
      version: '1.0.0',
    },
    servers: [{ url: origin, description: 'Webhook Catcher' }],
    paths: {
      [webhookPath]: {
        summary: 'Webhook receiver',
        description: 'Accepts any HTTP request, records headers, body, and query parameters, and returns 200.',
        get: {
          operationId: 'webhookGet',
          summary: 'GET',
          parameters: [{ name: '*', in: 'query', description: 'Any query parameters', schema: { type: 'string' } }],
          responses: capturedResponse,
        },
        post: {
          operationId: 'webhookPost',
          summary: 'POST',
          requestBody: { required: false, content: bodyContent },
          responses: capturedResponse,
        },
        put: {
          operationId: 'webhookPut',
          summary: 'PUT',
          requestBody: { required: false, content: bodyContent },
          responses: capturedResponse,
        },
        patch: {
          operationId: 'webhookPatch',
          summary: 'PATCH',
          requestBody: { required: false, content: bodyContent },
          responses: capturedResponse,
        },
        delete: {
          operationId: 'webhookDelete',
          summary: 'DELETE',
          responses: capturedResponse,
        },
        head: {
          operationId: 'webhookHead',
          summary: 'HEAD',
          responses: { '200': { description: 'Request captured' } },
        },
      },
    },
  }
}
