import { inject, track } from '@vercel/analytics'
import { analyticsEvents, type AnalyticsEvent } from '@mobench/site-config'

const analyticsEnabled = window.location.hostname === 'mobench.org'
const allowedEvents = new Set<string>(analyticsEvents)

function emit(name?: string) {
  if (!analyticsEnabled || !name || !allowedEvents.has(name)) return
  track(name as AnalyticsEvent)
}

if (analyticsEnabled) inject()

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element
    ? event.target.closest<HTMLElement>('[data-event]')
    : null
  const name = target?.dataset.event
  if (name !== 'install_copied') emit(name)
})

document.addEventListener('mobench:analytics', (event) => {
  emit((event as CustomEvent<{ name?: string }>).detail?.name)
})
