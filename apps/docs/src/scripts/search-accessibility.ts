const siteSearch = document.querySelector('site-search')
const searchRoot = document.querySelector('#starlight__search')
const searchTrigger = siteSearch?.querySelector<HTMLElement>('[data-open-modal]')

if (searchTrigger) {
  const visibleLabel = searchTrigger.textContent?.replace(/\s+/g, ' ').trim()
  if (visibleLabel) searchTrigger.setAttribute('aria-label', visibleLabel)
}

siteSearch?.addEventListener('keydown', (event) => {
  if (!(event instanceof KeyboardEvent) || !['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const input = searchRoot?.querySelector<HTMLInputElement>('.pagefind-ui__search-input')
  const links = [...(searchRoot?.querySelectorAll<HTMLElement>('.pagefind-ui__result-link') ?? [])]
  if (!input || !links.length) return

  const activeIndex = links.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'ArrowDown') {
    links[Math.min(activeIndex + 1, links.length - 1)]?.focus()
  } else if (activeIndex <= 0) {
    input.focus()
  } else {
    links[activeIndex - 1]?.focus()
  }
  event.preventDefault()
})

if (searchRoot) {
  const announceResults = () => {
    const message = searchRoot.querySelector<HTMLElement>('.pagefind-ui__message')
    message?.setAttribute('role', 'status')
    message?.setAttribute('aria-live', 'polite')
  }
  new MutationObserver(announceResults).observe(searchRoot, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}
