import { Router } from 'itty-router'
import api from './api'
import crous from './crous'

const router = Router()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Max-Age': '86400',
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response
  return response.text()
}

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers',
      ),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: 'GET, OPTIONS',
      },
    })
  }
}

async function get_ru(crous_name) {
  const rq_init = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }

  if (Object.keys(crous).includes(crous_name.toLowerCase())) {
    const response = await fetch(
      api.DOMAIN + api['FEED_' + crous_name.toUpperCase()],
      rq_init,
    )
    if (!response.ok) {
      return new Response(
        'error when fetching data, crous server returned ' + response.status,
        {
          status: 500,
        },
      )
    }

    let results = await response.text()
    // for some reason there are tabs in the strings which causes the json to be invalid
    results = results.replaceAll('\t', ' ')

    return new Response(results, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    })
  } else {
    return new Response('crous not found', { status: 404 })
  }
}

router.get(
  '/api/crous',
  () =>
    new Response(JSON.stringify(Object.keys(crous)), {
      headers: { 'Content-Type': 'application/json' },
    }),
)

router.get('/api/:crous/ru', ({ params }) => get_ru(`${params.crous}`))

router.get('*', () => new Response(null, { status: 400 }))

router.options('*', handleOptions)

router.all('*', () => new Response(null, { status: 405 }))

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request))
})
