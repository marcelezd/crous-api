const api_url =
  'http://webservices-v2.crous-mobile.fr:8080/feed/bordeaux/externe/crous-bordeaux.min.json'

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response
  return response.text()
}

async function handleRequest(request) {
  if (request.method !== 'GET') {
    return new Response('Expected GET', { status: 500 })
  }
  const rq_init = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }
  const rp_init = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(api_url, rq_init)
  const results = await gatherResponse(response)

  return new Response(results, rp_init)
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
