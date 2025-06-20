
import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createAgent, createOauthClient } from '~/utils/atproto'

export const APIRoute = createAPIFileRoute('/api/oauth/callback')({
  GET: async ({ request }) => {
    console.log('GET /api/oauth/callback')
    const url = new URL(request.url)
    const params = url.searchParams;

    console.log('params', params);


    try {
      const client = createOauthClient()
      const { session, state } = await client.callback(params)

      const agent = createAgent(session)
      const { data: user } = await agent.getProfile({ actor: session.did })

      console.log('user', user);

      // console.log('session', session);
      // console.log('state', state);

      // const agent = createAgent();
      // const { data: user } = await agent.getProfile({ actor: session.did })

      // console.log('user', user);

      return Response.redirect(new URL(`/post?did=${session.did}`, request.url), 302)

    } catch (error) {
      console.error('Error in GET /api/oauth/callback', error)
      return json({ error: 'Internal server error' }, { status: 500 })
    }
  }
})
