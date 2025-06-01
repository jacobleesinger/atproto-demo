import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { createAgent, createOauthClient } from '~/utils/atproto'
import { z } from 'zod'

async function getUser({ deps: { did } }: { deps: { did: string } }) {
  const client = createOauthClient()
  const session = await client.restore(did)
  const agent = createAgent(session)
  const { data: user } = await agent.getProfile({ actor: session.did })
  return { user }
}
export const Route = createFileRoute('/post')({
  component: RouteComponent,
  validateSearch: (search) => search as { did: string },
  loaderDeps: ({ search: { did } }) => ({ did }),
  loader: ({ deps: { did } }) => getUser({ deps: { did } })
})

const Input = z.object({
  did: z.string(),
  content: z.string(),
})

export const post = createServerFn({
  method: "POST"
})
.validator(formData => {
  if (!(formData instanceof FormData)) {
    throw new Error('Invalid form data')
  }

  const did = formData.get('did')
  const content = formData.get('content')

  return Input.parse({ did, content })
})
.handler(async (ctx): Promise<any> => {
  const { did, content } = ctx.data;
  const client = createOauthClient()
  const session = await client.restore(did)
  const agent = createAgent(session)

  try {
    await agent.post({ text: content })
  } catch (error) {
    console.error('Error posting to Bluesky', error)
    throw new Error('Failed to post to Bluesky')
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: '/post?did=' + did
    }
  })
})

function RouteComponent() {
  const { user } = useLoaderData({ from: Route.id })
  return (
    <section>
      <h1 className="text-2xl font-bold">Post to Bluesky</h1>
      <section>
        <p>logged in as {user.displayName}</p>
      </section>
      <form className="flex flex-col gap-2" action={post.url} method="post">
        <input type="hidden" name="did" value={user.did} />
        <textarea name="content" className="w-full p-2 border border-gray-300 rounded-md" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Post</button>
      </form>
    </section>
  )
}
