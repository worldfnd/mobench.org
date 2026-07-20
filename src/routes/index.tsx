import { useState, type ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { SyntaxHighlightedCode } from '@/components/code-highlight'
import { ThemeToggle } from '@/components/theme-toggle'
import { Docs, DocsActions } from './docs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  GithubIcon,
  WorldMark,
  Wordmark,
  GITHUB_URL,
  WORLD_URL,
  BROWSERSTACK_URL,
  MOBENCH_VERSION,
} from '@/components/icons'

export const Route = createFileRoute('/')({
  component: Root,
})

const DOCSRS = {
  mobench: 'https://docs.rs/mobench/latest/mobench/',
  sdk: 'https://docs.rs/mobench-sdk/latest/mobench_sdk/',
  macros: 'https://docs.rs/mobench-macros/latest/mobench_macros/',
}

const DOCS_URL = 'https://docs.mobench.org'
const WORLD_APP_URL = 'http://world.org/world-app'
const WORLD_ID_URL = 'https://docs.world.org/world-id'
const PROVEKIT_URL = 'https://provekit.org/'

const FAQS = [
  {
    q: 'What exactly is mobench?',
    a: 'mobench is the Rust CLI and SDK ecosystem for building, running, reporting, and profiling mobile benchmarks. The CLI orchestrates Android and iOS builds, local runs, BrowserStack runs, CI summaries, split-run merging, and report output.',
  },
  {
    q: 'Which crates make up the ecosystem?',
    a: 'mobench is the CLI. mobench-sdk provides the timing harness, benchmark registry, builders, code generation, types, and runner APIs. mobench-macros provides the #[benchmark] attribute, re-exported by the SDK for normal use.',
  },
  {
    q: 'Do I need to write a mobile app?',
    a: 'No. You annotate Rust functions, configure your crate for mobile FFI outputs, and let mobench generate the mobile runner projects under target/mobench. Android builds produce APK output; iOS builds produce xcframework and IPA artifacts.',
  },
  {
    q: 'Can it run without a device farm?',
    a: 'Yes. You can run locally with --local-only while developing, run on attached Android or iOS devices when your host is configured, or send Android runs to BrowserStack App Automate with device names from your run matrix.',
  },
  {
    q: 'What should benchmark functions look like?',
    a: 'Simple #[benchmark] functions are public, take no parameters, return (), and should black_box computed results. Benchmarks with setup can use #[benchmark(setup = setup_fn)] and receive a reference to the setup value, while setup time is excluded.',
  },
]

const FEATURES = [
  {
    n: '01',
    title: 'CLI orchestration',
    body: 'Use the installed mobench CLI to build Android or iOS artifacts, execute locally or on BrowserStack, prepare credential-free mobile bundles, and render stable reports.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <path d="M4 7h16M7 12h7M7 17h10" />
        <rect x="3" y="4" width="18" height="16" rx="3" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'SDK runtime and builders',
    body: 'Use the SDK timing harness, benchmark registry, runner APIs, Android/iOS builders, codegen templates, and shared result types directly when you need programmatic control.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Macro-driven discovery',
    body: (
      <>
        Mark functions with <span className="font-mono text-[13px]">#[benchmark]</span>. The macro
        preserves the function, registers it through inventory, captures its fully-qualified name, and
        supports untimed setup.
      </>
    ),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <path d="M7 8l-4 4 4 4" />
        <path d="M17 8l4 4-4 4" />
        <path d="M14 4l-4 16" />
      </svg>
    ),
  },
]

const CLI_COMMANDS = [
  ['init', 'Create a benchmark project config'],
  ['build', 'Build Android APKs or iOS artifacts'],
  ['run', 'Execute locally or on BrowserStack devices'],
  ['ci run', 'Write summary.json, summary.md, and results.csv'],
  ['ci merge-split-runs', 'Merge one-sample jobs into standard CI outputs'],
  ['report', 'Render markdown and sticky PR comments'],
]

const SDK_MODULES = [
  ['timing', 'Core timing infrastructure, always available'],
  ['registry', 'Runtime discovery for #[benchmark] functions'],
  ['runner', 'BenchmarkBuilder, BenchSpec, and run_benchmark'],
  ['builders', 'AndroidBuilder and IosBuilder automation'],
  ['codegen', 'Mobile project and runner template generation'],
  ['types', 'Common config, result, report, and error types'],
]

const BENCH_ROWS = [
  { name: 'Galaxy S24', label: '312 ms', width: '45%', warn: false },
  { name: 'Pixel 8', label: '408 ms', width: '59%', warn: false },
  { name: 'Pixel 6a', label: '690 ms', width: '100%', warn: true },
]

const REQUIREMENTS = [
  'Android NDK + ANDROID_NDK_HOME',
  'cargo-ndk for Android builds',
  'Xcode command-line tools for iOS',
  'Rust mobile targets',
  'inventory for benchmark registration',
  'BrowserStack credentials for cloud runs',
]

const SECTION = 'mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10'
const EYEBROW = 'font-mono text-[11.5px] tracking-[0.1em] uppercase text-green mb-4'
const H2 = 'text-[clamp(30px,3.6vw,46px)] leading-[1.04] tracking-[-0.04em] font-semibold m-0'

type ToolLogoName = 'android' | 'apple' | 'browserstack'

const TOOL_LOGOS: Record<ToolLogoName, { src: string; alt: string }> = {
  android: { src: '/assets/logo-android.svg', alt: 'Android' },
  apple: { src: '/assets/logo-apple.svg', alt: 'Apple' },
  browserstack: { src: '/assets/logo-browserstack.svg', alt: 'BrowserStack' },
}

function ToolLogo({ logo }: { logo: ToolLogoName }) {
  const asset = TOOL_LOGOS[logo]
  return <img src={asset.src} alt="" aria-hidden="true" className="h-[18px] w-[18px] flex-none object-contain xl:h-6 xl:w-6" />
}

function ToolItem({ logo, children }: { logo: ToolLogoName; children: ReactNode }) {
 return (
 <span className="inline-flex items-center gap-2 whitespace-nowrap">
 <ToolLogo logo={logo} />
 <span>{children}</span>
 </span>
 )
}

function landingPageMarkdown() {
 const page = document.querySelector('[data-landing-page]')
 const clone = page?.cloneNode(true) as HTMLElement | undefined
 clone?.querySelectorAll('[data-docs-actions]').forEach((element) => element.remove())
 const pageText = clone?.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? 'mobench'
 return `# mobench\n\n${pageText}`
}

function Root() {
  const isDocsHost = typeof window !== 'undefined' && window.location.hostname === 'docs.mobench.org'
  return isDocsHost ? <Docs /> : <Landing />
}

function Landing() {
  const [copied, setCopied] = useState(false)

const copyCmd = () => {
    try {
      navigator.clipboard?.writeText('cargo install mobench')
    } catch {
      /* noop */
    }
    setCopied(true)
  window.setTimeout(() => setCopied(false), 1600)
}

  return (
    <div className="overflow-hidden bg-cream text-ink" data-landing-page>
      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,12,0.09)] bg-[var(--mb-header-bg)] backdrop-blur-[14px]">
        <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:h-[68px] sm:px-7 lg:px-10 xl:h-[84px] xl:max-w-[min(1680px,calc(100vw-96px))]">
          <a href="#top" className="no-underline">
            <Wordmark tag={MOBENCH_VERSION} />
          </a>
        <nav className="hidden items-center gap-[30px] text-sm text-muted lg:flex xl:gap-10 xl:text-[17px]">
            <a href="#why" className="no-underline text-inherit hover:text-ink">
              Why
            </a>
            <a href="#features" className="no-underline text-inherit hover:text-ink">
              Features
            </a>
            <a href="#sdk" className="no-underline text-inherit hover:text-ink">
              SDK
            </a>
            <a href="#workflow" className="no-underline text-inherit hover:text-ink">
              Workflow
            </a>
            <a href="#faq" className="no-underline text-inherit hover:text-ink">
              FAQ
            </a>
            <a href={DOCS_URL} className="no-underline text-inherit hover:text-ink">
              Docs
            </a>
        </nav>
        <div className="flex items-center gap-3 xl:gap-4">
          <DocsActions getMarkdown={landingPageMarkdown} />
          <ThemeToggle />
          <a
            href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
          className="hidden items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.16)] px-[13px] py-2 text-[13px] text-ink no-underline sm:flex hover:border-green/50 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-5 xl:text-[17px]"
            >
          <GithubIcon className="h-[15px] w-[15px] xl:h-5 xl:w-5" />
              <span>GitHub</span>
            </a>
        <Button asChild size="sm" className="hidden px-4 py-[9px] text-[13px] sm:inline-flex xl:h-12 xl:rounded-xl xl:px-6 xl:text-[17px]">
              <a href={DOCS_URL}>Read docs</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:min-h-[calc(100svh-152px)]">
        <section id="top" className="relative mx-auto flex w-full max-w-[1280px] flex-1 items-center px-5 py-14 sm:px-7 sm:py-20 lg:px-10 lg:py-14 xl:max-w-[min(1680px,calc(100vw-96px))] xl:gap-20 xl:py-14 2xl:py-14">
          <div className="flex w-full flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-16 xl:gap-[clamp(72px,6vw,124px)]">
          <div className="relative min-w-0 flex-1 basis-[480px] xl:basis-[min(44vw,720px)]">
            <h1 className="m-0 mb-6 text-[clamp(32px,9vw,70px)] font-semibold leading-[1.03] tracking-[-0.045em] sm:leading-[0.98] xl:text-[clamp(70px,4.9vw,96px)]">
              Benchmark{' '}
              <span className="inline-flex items-baseline gap-[0.16em] whitespace-nowrap">
                Rust
                <img src="/assets/logo-ferris.svg" alt="Ferris" className="relative top-[0.1em] h-[1em] w-auto object-contain" />
              </span>
              <br className="sm:hidden" /> where it
              <br className="hidden sm:block" />{' '}
              actually <br className="sm:hidden" />runs, on <span className="text-green">mobile devices</span>.
            </h1>
            <p className="m-0 mb-[34px] max-w-[570px] text-[16px] leading-[1.58] text-muted sm:text-[19px] sm:leading-[1.5] xl:max-w-[720px] xl:text-[clamp(19px,1.15vw,24px)]">
              mobench builds Android and iOS benchmark runners, executes Rust benchmarks locally or on
              BrowserStack devices, and writes CI-friendly reports from the same crate code you already ship.
            </p>
          <div className="flex flex-wrap items-center gap-[13px] xl:gap-5">
            <Button asChild variant="ink" className="text-[15px] xl:h-[64px] xl:rounded-[14px] xl:px-8 xl:text-[20px]">
                <a href={DOCS_URL}>Start with the docs</a>
              </Button>
            <Button asChild variant="outline" className="text-[15px] xl:h-[64px] xl:rounded-[14px] xl:px-8 xl:text-[20px]">
                <a href={DOCSRS.mobench} target="_blank" rel="noreferrer">
                  API reference
                </a>
              </Button>
            </div>
          <div className="mt-9 flex flex-wrap gap-x-[18px] gap-y-2 font-mono text-[11.5px] tracking-[0.02em] text-faint sm:mt-11 sm:gap-[26px] sm:text-xs xl:mt-14 xl:gap-x-11 xl:text-[17px]">
              <span>mobench CLI</span>
              <span className="text-[rgba(20,18,12,0.2)]">/</span>
              <span>mobench-sdk</span>
              <span className="text-[rgba(20,18,12,0.2)]">/</span>
              <span>#[benchmark]</span>
            </div>
          </div>

          <div className="relative min-w-0 flex-1 basis-[420px] xl:basis-[min(42vw,720px)]">
            <div className="relative animate-floaty overflow-hidden rounded-[22px] border border-[rgba(20,18,12,0.10)] bg-white shadow-[0_40px_80px_-48px_rgba(20,18,12,0.55)]">
              <img
                src="/assets/mobench-bench.png"
                alt="A large mobile phone on a park bench showing mobench"
                className="block h-auto w-full"
              />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-[30px] border border-[rgba(20,18,12,0.14)] bg-[rgba(255,255,255,0.92)] px-[11px] py-1.5 font-mono text-[11px] tracking-[0.04em] text-[#33271a] shadow-[0_10px_24px_-18px_rgba(20,18,12,0.8)] backdrop-blur-[6px]">
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-[#1E8A3B]" />
                BENCHED ON MOBILE
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-[18px] px-5 py-[18px] sm:gap-[30px] sm:px-7 sm:py-[22px] lg:px-10 xl:min-h-[92px] xl:max-w-[min(1680px,calc(100vw-96px))] xl:py-0">
          <span className="font-mono text-[11.5px] uppercase tracking-[0.08em] leading-none text-faint xl:text-[15px]">
            Drop-in with tools you already use
          </span>
          <div className="flex flex-wrap items-center gap-9 font-mono text-[11.5px] uppercase tracking-[0.08em] leading-none text-muted xl:gap-12 xl:text-[15px]">
            <span>inventory</span>
            <ToolItem logo="android">Android NDK</ToolItem>
            <ToolItem logo="apple">Xcode</ToolItem>
            <ToolItem logo="browserstack">BrowserStack</ToolItem>
            <span>JSON / CSV / Markdown</span>
          </div>
        </div>
      </section>
      </div>

      <section id="why" className="border-b border-[rgba(20,18,12,0.08)] bg-cream">
        <div className={`${SECTION} grid gap-9 pt-10 pb-16 md:grid-cols-[0.85fr_1.15fr] md:pt-12 md:pb-[96px]`}>
          <div>
            <div className={EYEBROW}>Why mobench exists</div>
            <h2 className={`${H2} max-w-[560px]`}>
              Real mobile Rust performance has to represent real users.
            </h2>
          </div>
          <div className="space-y-6 text-[17px] leading-[1.62] text-muted">
            <p className="m-0">
              mobench was built from an internal need to benchmark intense Rust workloads in mobile environments that look like the real device mix of{' '}
              <a href={WORLD_APP_URL} target="_blank" rel="noreferrer" className="font-medium text-green underline decoration-green/25 underline-offset-4 hover:decoration-green/60">
                World App
              </a>{' '}
              users, not only the newest flagship phones.
            </p>
            <p className="m-0">
              The target matrix includes flagship devices, medium-tier devices, low-end devices, and even 32-bit devices from 10 years ago, so teams can build confidence across the 95%-99% coverage band that matters for{' '}
              <a href={PROVEKIT_URL} target="_blank" rel="noreferrer" className="font-medium text-green underline decoration-green/25 underline-offset-4 hover:decoration-green/60">
                ProveKit
              </a>
              , the cryptography library powering{' '}
              <a href={WORLD_ID_URL} target="_blank" rel="noreferrer" className="font-medium text-green underline decoration-green/25 underline-offset-4 hover:decoration-green/60">
                World ID
              </a>
              .
            </p>
            <div className="grid gap-3 pt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink sm:grid-cols-4">
              <span className="border-t border-[rgba(20,18,12,0.14)] pt-3">Flagship</span>
              <span className="border-t border-[rgba(20,18,12,0.14)] pt-3">Medium tier</span>
              <span className="border-t border-[rgba(20,18,12,0.14)] pt-3">Low end</span>
              <span className="border-t border-[rgba(20,18,12,0.14)] pt-3">Legacy 32-bit</span>
            </div>
          </div>
        </div>
      </section>

      <section id="quickstart" className={`${SECTION} py-16 md:py-[100px]`}>
        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="min-w-0 flex-1 basis-[420px]">
            <div className="mb-[18px] font-mono text-[11.5px] uppercase tracking-[0.1em] text-green">
              Quick start
            </div>
            <h2 className="m-0 mb-[18px] text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.04] tracking-[-0.04em]">
              Install the CLI, annotate a function, run a device matrix.
            </h2>
            <p className="m-0 mb-[26px] max-w-[500px] text-[17px] leading-[1.55] text-muted">
              Add the SDK and inventory to your crate, expose mobile FFI outputs, mark benchmark functions,
              then let mobench build and run the generated mobile apps.
            </p>
            <a href={DOCS_URL} className="inline-flex items-center gap-2 text-[15px] font-medium text-green no-underline">
              Read the full guide -&gt;
            </a>
          </div>
          <div className="min-w-0 flex-1 basis-[460px]">
            <Terminal title="terminal" action={copied ? 'Copied' : 'Copy'} onAction={copyCmd}>
              <Line cmd="cargo install mobench" />
              <Line cmd='mobench init --target android --output bench-config.toml' />
              <Line cmd="mobench build --target android" />
              <Line cmd='mobench run --target android --function my_crate::hash_benchmark --iterations 100 --warmup 10 --devices "Google Pixel 7-13.0" --release' />
              <div className="text-[#6C7850]">summary.json + summary.md + results.csv ready</div>
            </Terminal>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className={`${SECTION} py-16 md:py-[100px]`}>
          <div className={EYEBROW}>Core features</div>
          <h2 className={`${H2} mb-14 max-w-[720px]`}>
            A mobile benchmark stack, not just another timing loop.
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.08)] bg-[rgba(20,18,12,0.08)] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.n} className="bg-white px-5 pb-7 pt-7 sm:px-[30px] sm:pb-[38px] sm:pt-[34px]">
                <div className="mb-[26px] flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-green/25 bg-green/5">
                    {f.icon}
                  </div>
                  <span className="font-mono text-xs text-[#C7C5BC]">{f.n}</span>
                </div>
                <h3 className="m-0 mb-3 text-[21px] font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="m-0 text-[15px] leading-[1.55] text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-bench text-ink">
        <div className={`${SECTION} py-16 md:py-[104px]`}>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className={EYEBROW}>Command surface</div>
              <h2 className={`${H2} max-w-[660px]`}>
                From project init to pull-request report, every step is scriptable.
              </h2>
            </div>
            <a
              href={DOCS_URL}
              className="rounded-[9px] border border-[rgba(20,18,12,0.22)] px-4 py-[11px] font-mono text-xs uppercase tracking-[0.05em] text-ink no-underline"
            >
              CLI reference -&gt;
            </a>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CLI_COMMANDS.map(([cmd, desc]) => (
              <div key={cmd} className="rounded-xl border border-[rgba(20,18,12,0.10)] bg-white px-5 py-5">
                <div className="font-mono text-[13px] text-green">mobench {cmd}</div>
                <div className="mt-2 text-sm leading-[1.5] text-muted">{desc}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-5 pb-7 pt-6 shadow-[0_20px_50px_-34px_rgba(20,18,12,0.35)] sm:px-8 sm:pb-[34px] sm:pt-[30px]">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[15px] font-medium">Example device comparison</span>
              <span className="font-mono text-[11.5px] text-faint">median duration · lower is better</span>
            </div>
            <div className="flex flex-col gap-5">
              {BENCH_ROWS.map((r) => (
              <div key={r.name} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[18px]">
                <span className="w-full flex-none text-sm text-[#46402F] sm:w-[130px]">{r.name}</span>
                  <div className="h-[30px] flex-1 rounded-md bg-[#E7EBDD]">
                    <div
                      className="flex h-full items-center justify-end rounded-md pr-3 font-mono text-[12.5px] text-white"
                      style={{
                        width: r.width,
                        background: r.warn
                          ? 'linear-gradient(90deg,#C2702E,#DD9042)'
                          : 'linear-gradient(90deg,#356B26,#5E9C36)',
                      }}
                    >
                      {r.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[26px] border-t border-[rgba(20,18,12,0.1)] pt-[18px] font-mono text-[10.5px] text-faint">
              Illustrative figures · same benchmark, same warmup and measured iteration settings
            </div>
          </div>
        </div>
      </section>

      <section id="sdk" className={`${SECTION} py-16 md:py-[100px]`}>
        <div className={EYEBROW}>mobench-sdk</div>
        <h2 className={`${H2} mb-3.5 max-w-[760px]`}>
          Use the Rust API directly when the CLI is not enough.
        </h2>
        <p className="m-0 mb-12 max-w-[690px] text-[17px] leading-[1.55] text-muted">
          The SDK packages the timing harness, generated mobile runners, benchmark registry, builders,
          codegen, and core types used by the CLI. Start with the full default feature set, or trim mobile
          binaries down with runner-only.
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.08)] bg-[rgba(20,18,12,0.08)] md:grid-cols-2 lg:grid-cols-3">
          {SDK_MODULES.map(([name, desc], index) => (
            <div key={name} className="bg-white px-7 pb-[34px] pt-[30px]">
              <div className="mb-4 font-mono text-xs text-[#C7C5BC]">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="m-0 mb-2.5 text-[20px] font-semibold tracking-[-0.02em]">{name}</h3>
              <p className="m-0 text-[15px] leading-[1.55] text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cloud" className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-stretch gap-10 px-5 py-16 sm:px-7 md:py-[100px] lg:flex-row lg:items-center lg:gap-16 lg:px-10">
          <div className="min-w-0 flex-1 basis-[420px]">
            <div className={EYEBROW}>Device cloud</div>
            <h2 className={`${H2} mb-[18px] max-w-[580px]`}>
              BrowserStack runs use the same CLI flow.
            </h2>
            <p className="m-0 mb-[26px] max-w-[520px] text-[17px] leading-[1.55] text-muted">
              Run long Android and iOS benchmarks with bounded completion timeouts, runner heartbeats, and
              early native-worker failure diagnostics while credentials stay isolated from pull-request builds.
            </p>
            <a
              href={BROWSERSTACK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-green no-underline"
            >
              Explore BrowserStack -&gt;
            </a>
          </div>
          <div className="min-w-0 flex-1 basis-[440px]">
            <Terminal title="browserstack">
              <Line cmd='export BROWSERSTACK_USERNAME="..."' />
              <Line cmd='export BROWSERSTACK_ACCESS_KEY="..."' />
              <Line cmd='mobench run --target android --function hash_benchmark --devices "Google Pixel 7-13.0" --release' />
              <div className="text-[#6C7850]">uploading APK ... ready</div>
              <div className="text-[#6C7850]">collecting results ... summary extracted</div>
            </Terminal>
          </div>
        </div>
      </section>

      <section id="requirements" className={`${SECTION} py-16 md:py-[100px]`}>
        <div className={EYEBROW}>Platform setup</div>
        <h2 className={`${H2} mb-3.5 max-w-[760px]`}>Know exactly what has to be installed.</h2>
        <p className="m-0 mb-10 max-w-[620px] text-[17px] leading-[1.55] text-muted">
          mobench keeps generated mobile projects inside target/mobench, but the host machine still needs
          the platform toolchains for the targets you choose.
        </p>
        <div className="flex max-w-[940px] flex-wrap gap-3">
          {REQUIREMENTS.map((requirement) => (
            <span
              key={requirement}
              className="rounded-[30px] border border-[rgba(20,18,12,0.16)] bg-white px-[17px] py-[9px] text-sm text-ink"
            >
              {requirement}
            </span>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto max-w-[900px] px-5 py-16 sm:px-7 md:py-[100px] lg:px-10">
          <div className="mb-4 text-center font-mono text-[11.5px] uppercase tracking-[0.1em] text-green">
            FAQ
          </div>
          <h2 className="m-0 mb-12 text-center text-[clamp(28px,3.4vw,42px)] font-semibold leading-[1.05] tracking-[-0.04em]">
            Questions, answered.
          </h2>
          <Accordion type="single" collapsible className="border-t border-[rgba(20,18,12,0.10)]">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>
                  <span className="font-mono text-xs text-[#B6A988]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-[18px] font-medium tracking-[-0.02em] text-ink">{f.q}</span>
                  <span className="text-[22px] leading-none text-green transition-transform group-data-[state=open]:rotate-45">
                    +
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-w-[680px] text-base leading-[1.6] text-muted">{f.a}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="relative overflow-hidden bg-green text-cream">
        <div className="absolute -right-[120px] -top-[180px] h-[540px] w-[540px] rounded-full border border-cream/20" />
        <div className="absolute -bottom-[220px] -left-[120px] h-[480px] w-[480px] rounded-full border border-cream/10" />
        <div className="relative mx-auto max-w-[1280px] px-5 py-16 text-center sm:px-7 md:py-[104px] lg:px-10">
          <h2 className="mx-auto mb-[22px] max-w-[760px] text-[clamp(34px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Ship Rust performance with mobile evidence.
          </h2>
          <p className="mx-auto mb-9 max-w-[560px] text-[18px] leading-[1.5] text-cream/80">
            Install the CLI, add the SDK, and run your first benchmark through the same build and reporting
            pipeline used by the full mobench stack.
          </p>
          <div className="flex flex-wrap justify-center gap-[13px]">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-[10px] bg-white px-6 py-3.5 text-[15px] font-semibold text-green no-underline"
            >
              View on GitHub
            </a>
            <a
              href={DOCS_URL}
              className="rounded-[10px] border border-cream/30 bg-white/10 px-6 py-3.5 text-[15px] font-medium text-cream no-underline"
            >
              Read docs -&gt;
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-footer text-[#A6A49B]">
      <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-14 sm:px-7 lg:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:flex-wrap">
            <div className="max-w-[340px]">
              <div className="mb-4 flex items-center gap-[11px]">
                <span className="text-[20px] font-semibold tracking-[-0.045em] text-[#F2F1EC]">mobench</span>
              </div>
              <p className="m-0 mb-[18px] text-sm leading-[1.55]">
                Rust mobile benchmarking CLI, SDK, builders, runner, and procedural macros. Built and
                maintained by World.
              </p>
              <a
                href={WORLD_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[13px] text-[#F2F1EC] no-underline"
              >
                <WorldMark width={19} height={19} />
                Built by World
              </a>
            </div>
        <div className="grid w-full grid-cols-1 gap-9 sm:grid-cols-3 md:w-auto md:gap-16">
              <FooterCol
                title="Product"
                links={[
                  { label: 'Features', href: '#features' },
                  { label: 'SDK', href: '#sdk' },
                  { label: 'Workflow', href: '#workflow' },
                ]}
              />
              <FooterCol
                title="Reference"
                links={[
                  { label: 'Documentation', href: DOCS_URL, external: true },
                  { label: 'mobench', href: DOCSRS.mobench, external: true },
                  { label: 'mobench-sdk', href: DOCSRS.sdk, external: true },
                  { label: 'mobench-macros', href: DOCSRS.macros, external: true },
                ]}
              />
              <FooterCol
                title="World"
                links={[
                  { label: 'world.org', href: WORLD_URL, external: true },
                  { label: 'GitHub', href: GITHUB_URL, external: true },
                  { label: 'Issues', href: `${GITHUB_URL}/issues`, external: true },
                ]}
              />
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-[22px] font-mono text-[11.5px] text-[#8A9163]">
            <span>2026 World Foundation · MIT License</span>
            <span>mobile-bench-rs · latest docs.rs {MOBENCH_VERSION}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Terminal({
  title,
  action,
  onAction,
  children,
}: {
  title: string
  action?: string
  onAction?: () => void
  children: ReactNode
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[14px] bg-leaf shadow-[0_24px_50px_-30px_rgba(20,18,12,0.55)]">
      <div className="flex items-center justify-between border-b border-[rgba(20,18,12,0.10)] px-4 py-3">
        <div className="flex gap-[7px]">
          <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
        </div>
        <span className="font-mono text-[11px] text-[#8A9163]">{title}</span>
        {action ? (
          <button
            onClick={onAction}
            className="cursor-pointer rounded-md border border-[rgba(20,18,12,0.14)] bg-[rgba(20,18,12,0.05)] px-2.5 py-1 font-mono text-[11px] text-[#46502F]"
          >
            {action}
          </button>
        ) : (
          <span className="w-[46px]" />
        )}
      </div>
      <SyntaxHighlightedCode className="overflow-x-auto px-4 py-[18px] font-mono text-[12.5px] leading-[1.9] text-code sm:px-5 sm:py-[22px] sm:text-[13.5px] sm:leading-[2]">
        {children}
      </SyntaxHighlightedCode>
    </div>
  )
}

function Line({ cmd }: { cmd: string }) {
  return (
    <div>
      <span className="text-[#8A9163]">$</span> <span className="text-[#2E7D1B]">{cmd}</span>
    </div>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A9163]">{title}</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="text-sm text-[#A6A49B] no-underline hover:text-[#F2F1EC]"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}
