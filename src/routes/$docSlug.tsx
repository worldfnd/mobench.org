import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Docs, getDocsPageBySlug } from './docs'

export const Route = createFileRoute('/$docSlug')({
  component: DocsSlugRoute,
})

function DocsSlugRoute() {
  const { docSlug } = Route.useParams()
  const page = getDocsPageBySlug(docSlug)

  if (!page) {
    return <DocsNotFound slug={docSlug} />
  }

  return <Docs initialPage={page.id} />
}

function DocsNotFound({ slug }: { slug: string }) {
  return (
    <main className="min-h-screen bg-cream px-5 py-16 text-ink sm:px-8">
      <div className="mx-auto max-w-[720px] rounded-xl border border-[rgba(20,18,12,0.12)] bg-white p-8 shadow-[0_28px_90px_-52px_rgba(20,18,12,0.45)]">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber/12 text-amber">
          <AlertTriangle size={22} />
        </div>
        <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-faintest">404</p>
        <h1 className="mb-3 text-[34px] font-semibold leading-[1.05] tracking-normal text-ink sm:text-[44px]">Docs page not found</h1>
        <p className="mb-6 text-[16px] leading-[1.7] text-ink-soft">
          No Mobench docs page matches <code className="rounded bg-leaf px-1.5 py-0.5 font-mono text-[14px] text-code">/{slug}</code>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/docs" className="inline-flex h-10 items-center rounded-lg border border-green/25 bg-green px-4 text-[14px] font-medium text-white no-underline hover:bg-green-dark">
            Go to docs
          </Link>
          <Link to="/" className="inline-flex h-10 items-center rounded-lg border border-[rgba(20,18,12,0.14)] bg-white px-4 text-[14px] font-medium text-ink no-underline hover:border-green/35 hover:bg-green/5">
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
