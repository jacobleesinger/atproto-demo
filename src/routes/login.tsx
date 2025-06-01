import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createOauthClient } from '~/utils/atproto'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

const Input = z.object({
  handle: z.string(),
})

const getOauthUrl = createServerFn({
  method: 'POST'
})
.validator((formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('Invalid form data')
  }

  const handle = formData.get('handle')

  if (typeof handle !== 'string') {
    throw new Error('Invalid handle')
  }

  return Input.parse({ handle })
})
.handler(async (ctx) => {
  const { handle } = ctx.data;
  console.log('handle', handle);

  const client = createOauthClient()
  const url = await client.authorize(handle, { scope: 'atproto transition:generic' })
  
  throw new Response(null, {
    status: 302,
    headers: {
      Location: url.toString()
    }
  })
})

function RouteComponent() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <form className="flex flex-col gap-2 items-center" action={getOauthUrl.url} method="POST">
        <label htmlFor="handle">atproto handle</label>
        <input
          type="text"
          name="handle"
          placeholder="Handle"
          className="border border-gray-300 rounded-md p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 w-fit"
        >
          Login
        </button>
      </form>
    </section>
  )
}
