import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/oauth-callback')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      code: z.string(),
      iss: z.string(),
      state: z.string(),
    }).parse(search)
  }
})

function RouteComponent() {
  const { code, iss, state } = Route.useSearch()

  return (
    <section>
      <h1 className="text-2xl font-bold text-center">OAuth Callback</h1>
      <p>code: {code}</p>
      <p>iss: {iss}</p>
      <p>state: {state}</p>
    </section>
  )
}
