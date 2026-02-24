const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handlePreflight(request: Request): Response | null {
  return request.method === 'OPTIONS' ? new Response(null, { headers: CORS_HEADERS }) : null
}
