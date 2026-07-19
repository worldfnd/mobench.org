import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import ogPages from '@/og-pages.json'

type DocsPageOg = {
  id: string
  label: string
  group: string
  description: string
}

type OgTarget = {
  title: string
  description: string
  url: string
  image: string
}

const LANDING_TITLE = 'mobench - Rust mobile benchmarking CLI and SDK'
const DOCS_TITLE = 'mobench docs - Rust mobile benchmark documentation'

function absoluteUrl(base: string, path: string) {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  let element = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)

  if (!element) {
    if (selector.startsWith('link')) {
      element = document.createElement('link')
      element.setAttribute('rel', 'canonical')
    } else {
      element = document.createElement('meta')
      const property = selector.match(/property="([^"]+)"/)?.[1]
      const name = selector.match(/name="([^"]+)"/)?.[1]
      if (property) element.setAttribute('property', property)
      if (name) element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }

  element.setAttribute(attr, value)
}

function docsPageForPath(pathname: string): DocsPageOg | null {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  if (!slug) return null
  if (slug === 'docs') return null

  const aliased = (ogPages.aliases as Record<string, string>)[slug] ?? slug
  return ogPages.docsPages.find((page) => page.id === aliased) ?? null
}

function ogForPath(pathname: string): OgTarget {
  const isDocsSubdomain = typeof window !== 'undefined' && window.location.hostname === 'docs.mobench.org'
  const docsPage = docsPageForPath(pathname)

  if (docsPage) {
    const path = `/${docsPage.id}`
    return {
      title: `${docsPage.label} - mobench docs`,
      description: docsPage.description,
      url: absoluteUrl(ogPages.site.docsUrl, path),
      image: absoluteUrl(ogPages.site.docsUrl, `/og/${docsPage.id}.jpg`),
    }
  }

  if (pathname === '/docs' || pathname === '/docs/' || (isDocsSubdomain && pathname === '/')) {
    return {
      title: DOCS_TITLE,
      description: ogPages.docsRoot.description,
      url: absoluteUrl(ogPages.site.docsUrl, isDocsSubdomain ? '/' : '/docs'),
      image: absoluteUrl(ogPages.site.docsUrl, ogPages.docsRoot.image),
    }
  }

  return {
    title: LANDING_TITLE,
    description: ogPages.landing.description,
    url: absoluteUrl(ogPages.site.landingUrl, '/'),
    image: absoluteUrl(ogPages.site.landingUrl, ogPages.landing.image),
  }
}

export function AppHead() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    const target = ogForPath(pathname)

    document.title = target.title
    setMeta('meta[name="description"]', 'content', target.description)
    setMeta('link[rel="canonical"]', 'href', target.url)
    setMeta('meta[property="og:type"]', 'content', 'website')
    setMeta('meta[property="og:site_name"]', 'content', 'mobench')
    setMeta('meta[property="og:title"]', 'content', target.title)
    setMeta('meta[property="og:description"]', 'content', target.description)
    setMeta('meta[property="og:url"]', 'content', target.url)
    setMeta('meta[property="og:image"]', 'content', target.image)
    setMeta('meta[property="og:image:width"]', 'content', '1200')
    setMeta('meta[property="og:image:height"]', 'content', '630')
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'content', target.title)
    setMeta('meta[name="twitter:description"]', 'content', target.description)
    setMeta('meta[name="twitter:image"]', 'content', target.image)
  }, [pathname])

  return null
}
