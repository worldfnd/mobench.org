import { inject, track } from '@vercel/analytics'
import { analyticsEvents, type AnalyticsEvent } from '@mobench/site-config'

const analyticsEnabled = window.location.hostname === 'docs.mobench.org'
const allowedEvents = new Set<string>(analyticsEvents)

function emit(name: AnalyticsEvent) {
  if (!analyticsEnabled || !allowedEvents.has(name)) return
  track(name)
}

if (analyticsEnabled) inject()

document.addEventListener('click', (event) => {
  const result = event.target instanceof Element
    ? event.target.closest('.pagefind-ui__result-link')
    : null
  if (result) emit('search_result_opened')
})

const searchRoot = document.querySelector('#starlight__search')
let zeroResultTracked = false

searchRoot?.addEventListener('input', () => {
  zeroResultTracked = false
})

if (searchRoot) {
  const observer = new MutationObserver(() => {
    const input = searchRoot.querySelector<HTMLInputElement>('input')
    const message = searchRoot.querySelector<HTMLElement>('.pagefind-ui__message')
    const hasNoResults = message?.textContent?.trim().startsWith('No results') ?? false
    if (!zeroResultTracked && input?.value.trim() && hasNoResults) {
      emit('search_zero_results')
      zeroResultTracked = true
    }
  })
  observer.observe(searchRoot, { childList: true, subtree: true, characterData: true })
}
