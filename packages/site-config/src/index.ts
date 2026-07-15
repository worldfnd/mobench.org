import pin from '@mobench/truth/pin'

export const site = {
  marketingUrl: 'https://mobench.org',
  docsUrl: 'https://docs.mobench.org',
  repositoryUrl: 'https://github.com/worldcoin/mobile-bench-rs',
  websiteRepositoryUrl: 'https://github.com/worldfnd/mobench.org',
  release: pin.release,
  crateVersion: pin.version,
} as const

export const supportedPlatforms = ['android', 'ios'] as const

export const analyticsEvents = [
  'quickstart_opened',
  'install_copied',
  'github_opened',
  'search_result_opened',
  'search_zero_results',
] as const

export type AnalyticsEvent = (typeof analyticsEvents)[number]
