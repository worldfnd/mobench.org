import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
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
} from '@/components/icons'

export const Route = createFileRoute('/')({
  component: Landing,
})

const FAQS = [
  {
    q: 'What exactly is mobench?',
    a: 'mobench (mobile-bench-rs) is an open-source Rust harness that runs your benchmarks on real iOS and Android phones, then reports wall-clock time, peak memory, and energy per device. It is built and maintained by World and ships as a single CLI installable from crates.io.',
  },
  {
    q: 'Do I need a Mac to benchmark on iOS?',
    a: 'For on-device iOS runs you need a host with Xcode command-line tools, which currently means macOS. Android runs work from macOS, Linux, or Windows via adb. You can also point mobench at a remote device farm and run everything from CI.',
  },
  {
    q: 'How does it measure energy and memory?',
    a: 'mobench reads the platform’s own instrumentation, powermetrics-style energy counters and resident-set sampling on each OS, and aggregates them alongside timing. Cold and warm runs are tracked separately so thermal throttling and JIT warm-up do not get averaged away.',
  },
  {
    q: 'Can it run in CI?',
    a: 'Yes. mobench emits reproducible JSON and CSV reports and a compact regression diff designed for pull-request comments. Wire it into GitHub Actions against a self-hosted runner with attached devices, or against a hosted device farm.',
  },
  {
    q: 'Does it work with Criterion?',
    a: 'It does. Annotate existing Criterion benches and mobench will cross-compile, deploy, and run them on-device, collecting the same statistics you already rely on plus the mobile-specific metrics. Custom harnesses are supported through a small attribute macro.',
  },
]

const FEATURES = [
  {
    n: '01',
    title: 'Real devices, not emulators',
    body: 'Runs your Criterion and custom benches on physical iOS & Android phones over USB or a device farm. The same silicon, thermal limits, and schedulers your users have.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <line x1="10" y1="18.5" x2="14" y2="18.5" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Metrics that matter on mobile',
    body: 'Wall-clock time, peak resident memory, energy and thermal headroom, plus cold vs. warm runs, captured per device and per commit, not averaged into mush.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <path d="M3 17l5-6 4 4 5-8 4 5" />
        <line x1="3" y1="21" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Rust-native workflow',
    body: (
      <>
        Drop in with Cargo, annotate your benches, and run{' '}
        <span className="font-mono text-[13px]">mobench run</span>. Get reproducible JSON/CSV
        reports and clean regression diffs straight in CI.
      </>
    ),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.6">
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    ),
  },
]

const BENCH_ROWS = [
  { name: 'iPhone 15 Pro', value: 312, width: '44.6%', warn: false },
  { name: 'Galaxy S24', value: 356, width: '50.9%', warn: false },
  { name: 'Pixel 8', value: 408, width: '58.3%', warn: false },
  { name: 'Pixel 6a', value: 690, width: '98.6%', warn: true },
]

const DEVICES = [
  'iPhone 15 Pro',
  'iPhone 14',
  'iPhone SE',
  'Pixel 8 / 8 Pro',
  'Pixel 6a',
  'Galaxy S24',
  'Galaxy A54',
  'OnePlus 12',
]

const BINDINGS = [
  {
    n: '01',
    title: 'UniFFI',
    body: "Generate idiomatic Swift and Kotlin wrappers straight from the SDK's interface definition. The recommended path for most mobile teams.",
  },
  {
    n: '02',
    title: 'Bolt FFI',
    body: "Prefer Bolt's binding workflow? mobench-sdk ships a Bolt-compatible surface for projects already standardized on it.",
  },
  {
    n: '03',
    title: 'Native FFI',
    body: 'Need full control? Link the C header directly and hand-write your own native FFI bindings against the stable ABI.',
  },
]

const SECTION = 'mx-auto max-w-[1280px] px-10'
const EYEBROW =
  'font-mono text-[11.5px] tracking-[0.1em] uppercase text-green mb-4'
const H2 =
  'text-[clamp(30px,3.6vw,46px)] leading-[1.04] tracking-[-0.04em] font-semibold m-0'

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
    <div className="overflow-hidden bg-cream text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,12,0.09)] bg-[rgba(244,239,221,0.78)] backdrop-blur-[14px]">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-10">
          <a href="#top" className="no-underline">
            <Wordmark tag="v0.3" />
          </a>
          <nav className="hidden items-center gap-[30px] text-sm text-muted md:flex">
            <a href="#features" className="no-underline text-inherit hover:text-ink">Features</a>
            <a href="#benchmarks" className="no-underline text-inherit hover:text-ink">Benchmarks</a>
            <a href="#devices" className="no-underline text-inherit hover:text-ink">Devices</a>
            <a href="#faq" className="no-underline text-inherit hover:text-ink">FAQ</a>
            <Link to="/docs" className="no-underline text-inherit hover:text-ink">Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.16)] px-[13px] py-2 text-[13px] text-ink no-underline sm:flex hover:border-green/50"
            >
              <GithubIcon />
              <span>GitHub</span>
              <span className="font-mono text-faint">1.2k</span>
            </a>
            <Button asChild size="sm" className="px-4 py-[9px] text-[13px]">
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative mx-auto max-w-[1280px] px-10 pb-[88px] pt-24">
        <div className="pointer-events-none absolute -right-[160px] -top-[120px] h-[620px] w-[620px] rounded-full border border-green/15" />
        <div className="pointer-events-none absolute right-[120px] top-10 h-[320px] w-[320px] rounded-full border border-green/10" />

        <div className="flex flex-wrap items-center gap-16">
          <div className="relative min-w-[320px] flex-1 basis-[480px]">
            <div className="mb-[26px] inline-flex items-center gap-[9px] rounded-[30px] border border-green/30 bg-green/5 px-[11px] py-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-green">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-green" />
              Built by World · Open source
            </div>
            <h1 className="m-0 mb-6 text-[clamp(42px,5.2vw,70px)] font-semibold leading-[0.98] tracking-[-0.045em]">
              Benchmark Rust where it<br />actually runs, on{' '}
              <span className="text-green">real phones</span>.
            </h1>
            <p className="m-0 mb-[34px] max-w-[540px] text-[19px] leading-[1.5] text-muted">
              mobench runs your Rust benchmarks on physical iOS &amp; Android hardware and reports
              wall&#8209;clock time, peak memory, and energy, so you optimize for the device your
              users hold, not your CI runner.
            </p>
            <div className="flex flex-wrap items-center gap-[13px]">
              <Button asChild variant="ink" className="text-[15px]">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  View on GitHub <span className="font-mono opacity-55">{'{ }'}</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="text-[15px]">
                <a href="#quickstart">Quickstart &rarr;</a>
              </Button>
            </div>
            <div className="mt-11 flex flex-wrap gap-[26px] font-mono text-xs tracking-[0.02em] text-faint">
              <span>RUST&nbsp;NATIVE</span>
              <span className="text-[rgba(20,18,12,0.2)]">/</span>
              <span>iOS&nbsp;16+&nbsp;·&nbsp;ANDROID&nbsp;12+</span>
              <span className="text-[rgba(20,18,12,0.2)]">/</span>
              <span>MIT&nbsp;LICENSE</span>
            </div>
          </div>

          <div className="relative min-w-[340px] flex-1 basis-[420px]">
            <div className="relative animate-floaty overflow-hidden rounded-[22px] border border-[rgba(20,18,12,0.10)] bg-white shadow-[0_30px_70px_-30px_rgba(63,122,46,0.30),0_6px_18px_-8px_rgba(20,18,12,0.14)]">
              <img
                src="/assets/mobench-bench.svg"
                alt="A retro phone reading MOBENCH propped on a park bench"
                className="block h-auto w-full"
              />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-[30px] border border-[rgba(20,18,12,0.1)] bg-[rgba(255,255,255,0.86)] px-[11px] py-1.5 font-mono text-[11px] tracking-[0.04em] text-ink backdrop-blur-[6px]">
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-[#1E8A3B]" />
                BENCHED · ON A REAL BENCH
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-[30px] px-10 py-[22px]">
          <span className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-faint">
            Drop-in with the tools you already use
          </span>
          <div className="flex flex-wrap items-center gap-9 text-[15px] font-medium text-muted">
            <span>Cargo</span>
            <span>Criterion</span>
            <span>Xcode&nbsp;/&nbsp;adb</span>
            <span>GitHub&nbsp;Actions</span>
            <span>JSON&nbsp;/&nbsp;CSV</span>
          </div>
        </div>
      </section>

      {/* QUICKSTART */}
      <section id="quickstart" className={`${SECTION} py-[100px]`}>
        <div className="flex flex-wrap items-center gap-16">
          <div className="min-w-[320px] flex-1 basis-[420px]">
            <div className="mb-[18px] font-mono text-[11.5px] uppercase tracking-[0.1em] text-green">
              Get started in 60 seconds
            </div>
            <h2 className="m-0 mb-[18px] text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.04] tracking-[-0.04em]">
              Install, plug in a device, run.
            </h2>
            <p className="m-0 mb-[26px] max-w-[460px] text-[17px] leading-[1.55] text-muted">
              Install the CLI from crates.io, connect a phone over USB (or point at a device farm),
              and mobench discovers it, runs your benches, and writes a reproducible report.
            </p>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-green no-underline"
            >
              Read the full guide &rarr;
            </Link>
          </div>
          <div className="min-w-[340px] flex-1 basis-[460px]">
            <div className="overflow-hidden rounded-[14px] bg-leaf shadow-[0_24px_50px_-30px_rgba(20,18,12,0.55)]">
              <div className="flex items-center justify-between border-b border-[rgba(20,18,12,0.10)] px-4 py-3">
                <div className="flex gap-[7px]">
                  <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
                  <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
                  <span className="h-[11px] w-[11px] rounded-full bg-[#BBC6A4]" />
                </div>
                <span className="font-mono text-[11px] text-[#8A9163]">terminal</span>
                <button
                  onClick={copyCmd}
                  className="cursor-pointer rounded-md border border-[rgba(20,18,12,0.14)] bg-[rgba(20,18,12,0.05)] px-2.5 py-1 font-mono text-[11px] text-[#46502F]"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="px-5 py-[22px] font-mono text-[13.5px] leading-[2] text-code">
                <div>
                  <span className="text-[#8A9163]">$</span>{' '}
                  <span className="text-[#2E7D1B]">cargo</span> install mobench
                </div>
                <div>
                  <span className="text-[#8A9163]">$</span>{' '}
                  <span className="text-[#2E7D1B]">mobench</span> run{' '}
                  <span className="text-[#4E7A1C]">--bench</span> prove{' '}
                  <span className="text-[#4E7A1C]">--device</span> pixel-8
                </div>
                <div className="text-[#8A9163]">&nbsp;</div>
                <div className="text-[#6C7850]">  detected 1 device · android 14 · arm64</div>
                <div className="text-[#6C7850]">
                  {'  '}running prove … <span className="text-[#1E8A3B]">done</span> in 408 ms
                </div>
                <div className="text-[#6C7850]">  peak rss 118.9 MiB · energy 0.31 J</div>
                <div>
                  <span className="text-[#8A9163]">$</span>{' '}
                  <span className="text-[rgba(20,18,12,0.5)]">▍</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className={`${SECTION} py-[100px]`}>
          <div className={EYEBROW}>Core features</div>
          <h2 className={`${H2} mb-14 max-w-[720px]`}>
            Numbers you can trust, from the hardware that matters.
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.08)] bg-[rgba(20,18,12,0.08)] md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.n} className="bg-white px-[30px] pb-[38px] pt-[34px]">
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

      {/* BENCHMARKS */}
      <section id="benchmarks" className="bg-bench text-ink">
        <div className={`${SECTION} py-[104px]`}>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className={EYEBROW}>Benchmarks</div>
              <h2 className={`${H2} max-w-[640px]`}>
                See exactly how your code behaves across the device landscape.
              </h2>
            </div>
            <Link
              to="/docs"
              className="rounded-[9px] border border-[rgba(20,18,12,0.22)] px-4 py-[11px] font-mono text-xs uppercase tracking-[0.05em] text-ink no-underline"
            >
              All benchmarks &rarr;
            </Link>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { v: '312', u: ' ms', d: 'Fastest SHA-256 proving run, iPhone 15 Pro, witness generation included.' },
              { v: '118.9', u: ' MiB', d: 'Peak resident memory while proving, well within a phone-class budget.' },
              { v: '40', u: '+ devices', d: 'Tracked in the reference device farm, from flagships down to budget hardware.' },
            ].map((s) => (
              <div key={s.v} className="border-t border-[rgba(20,18,12,0.14)] pt-[18px]">
                <div className="text-[40px] font-semibold leading-none tracking-[-0.04em]">
                  {s.v}
                  <span className="text-[18px] font-normal text-faint">{s.u}</span>
                </div>
                <div className="mt-2 text-sm leading-[1.4] text-muted">{s.d}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-8 pb-[34px] pt-[30px] shadow-[0_20px_50px_-34px_rgba(20,18,12,0.35)]">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[15px] font-medium">
                SHA-256 proving · proving time by device
              </span>
              <span className="font-mono text-[11.5px] text-faint">lower is better · ms</span>
            </div>
            <div className="flex flex-col gap-5">
              {BENCH_ROWS.map((r) => (
                <div key={r.name} className="flex items-center gap-[18px]">
                  <span className="w-[130px] flex-none text-sm text-[#46402F]">{r.name}</span>
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
                      {r.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[26px] border-t border-[rgba(20,18,12,0.1)] pt-[18px] font-mono text-[10.5px] text-faint">
              Illustrative figures · median of 50 runs · device farm v0.3
            </div>
          </div>
        </div>
      </section>

      {/* DEVICES */}
      <section id="devices" className={`${SECTION} py-[100px]`}>
        <div className={EYEBROW}>Supported hardware</div>
        <h2 className={`${H2} mb-3.5 max-w-[720px]`}>
          From this year's flagship to last year's budget phone.
        </h2>
        <p className="m-0 mb-10 max-w-[600px] text-[17px] leading-[1.55] text-muted">
          mobench targets stock iOS and Android over the platform's own tooling, no jailbreak, no
          root, no custom firmware required.
        </p>
        <div className="flex max-w-[920px] flex-wrap gap-3">
          {DEVICES.map((d) => (
            <span
              key={d}
              className="rounded-[30px] border border-[rgba(20,18,12,0.16)] bg-white px-[17px] py-[9px] text-sm text-ink"
            >
              {d}
            </span>
          ))}
          <span className="rounded-[30px] border border-dashed border-[rgba(20,18,12,0.22)] px-[17px] py-[9px] font-mono text-sm text-faint">
            + 32 more
          </span>
        </div>
        <div className="mt-[30px] flex gap-[26px] font-mono text-xs text-faint">
          <span>iOS&nbsp;16+</span>
          <span className="text-[rgba(20,18,12,0.2)]">/</span>
          <span>ANDROID&nbsp;12+</span>
          <span className="text-[rgba(20,18,12,0.2)]">/</span>
          <span>arm64&nbsp;·&nbsp;x86_64</span>
        </div>
      </section>

      {/* DEVICE CLOUD */}
      <section id="cloud" className="border-y border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-16 px-10 py-[100px]">
          <div className="min-w-[320px] flex-1 basis-[420px]">
            <div className={EYEBROW}>Device cloud</div>
            <h2 className="m-0 mb-[18px] text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.04] tracking-[-0.04em]">
              No device lab? Run on <span className="whitespace-nowrap">BrowserStack</span>.
            </h2>
            <p className="m-0 mb-[26px] max-w-[480px] text-[17px] leading-[1.55] text-muted">
              mobench plugs straight into BrowserStack's real-device cloud, so you can benchmark on
              thousands of physical iOS and Android phones without owning, charging, or maintaining a
              single one. Point it at your credentials, pick devices by name, and the same
              reproducible report comes back.
            </p>
            <div className="mb-7 flex flex-wrap gap-[26px]">
              {[
                { v: '3,000+', l: 'real devices' },
                { v: 'iOS + Android', l: 'every major OS version' },
                { v: 'zero', l: 'local hardware' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[28px] font-semibold tracking-[-0.03em] text-ink">{s.v}</div>
                  <div className="mt-[3px] text-[13px] text-muted">{s.l}</div>
                </div>
              ))}
            </div>
            <a
              href={BROWSERSTACK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-green no-underline"
            >
              Explore BrowserStack &rarr;
            </a>
          </div>
          <div className="min-w-[340px] flex-1 basis-[440px]">
            <div className="overflow-hidden rounded-[14px] bg-leaf shadow-[0_24px_50px_-30px_rgba(20,18,12,0.55)]">
              <div className="flex items-center justify-between border-b border-[rgba(20,18,12,0.10)] px-4 py-3 font-mono text-[11px] text-[#6C7850]">
                <span className="flex items-center gap-2 text-[#243016]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#2E7D1B]" /> browserstack
                </span>
                <span>2 devices</span>
              </div>
              <div className="p-5 font-mono text-[13px] leading-[1.95] text-code">
                <div>
                  <span className="text-[#8A9163]">$</span>{' '}
                  <span className="text-[#2E7D1B]">mobench</span> run{' '}
                  <span className="text-[#9A6411]">--farm</span> browserstack \
                </div>
                <div>
                  {'  '}
                  <span className="text-[#9A6411]">--device</span>{' '}
                  <span className="text-[#4E7A1C]">"iPhone 15 Pro"</span>{' '}
                  <span className="text-[#9A6411]">--device</span>{' '}
                  <span className="text-[#4E7A1C]">"Pixel 8"</span>
                </div>
                <div className="text-[#6C7850]">
                  {'  '}provisioning cloud devices … <span className="text-[#1E8A3B]">ready</span>
                </div>
                <div className="text-[#6C7850]">
                  {'  '}prove  iPhone 15 Pro   <span className="text-[#1E8A3B]">312 ms</span>
                </div>
                <div className="text-[#6C7850]">
                  {'  '}prove  Pixel 8         <span className="text-[#1E8A3B]">408 ms</span>
                </div>
                <div className="text-[#6C7850]">  report → ./mobench/cloud.json</div>
              </div>
            </div>
            <div className="mt-2.5 text-right font-mono text-[10.5px] text-[#B6A988]">
              BrowserStack is a third-party service · illustrative figures
            </div>
          </div>
        </div>
      </section>

      {/* BINDINGS */}
      <section id="bindings" className={`${SECTION} py-[100px]`}>
        <div className={EYEBROW}>Language bindings</div>
        <h2 className={`${H2} mb-3.5 max-w-[760px]`}>Call mobench from Swift, Kotlin, or Rust.</h2>
        <p className="m-0 mb-12 max-w-[620px] text-[17px] leading-[1.55] text-muted">
          The <span className="font-mono text-[15px]">mobench-sdk</span> exposes a stable C ABI, so
          you can drive the same benchmarking engine from any host language using the binding
          generator you already trust.
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.08)] bg-[rgba(20,18,12,0.08)] md:grid-cols-3">
          {BINDINGS.map((b) => (
            <div key={b.n} className="bg-white px-7 pb-[34px] pt-[30px]">
              <div className="mb-4 font-mono text-xs text-[#C7C5BC]">{b.n}</div>
              <h3 className="m-0 mb-2.5 text-[20px] font-semibold tracking-[-0.02em]">{b.title}</h3>
              <p className="m-0 text-[15px] leading-[1.55] text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[rgba(20,18,12,0.08)] bg-white">
        <div className="mx-auto max-w-[900px] px-10 py-[100px]">
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
                  <span className="font-mono text-xs text-[#B6A988]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-[18px] font-medium tracking-[-0.02em] text-ink">
                    {f.q}
                  </span>
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

      {/* CTA */}
      <section className="relative overflow-hidden bg-green text-white">
        <div className="absolute -right-[120px] -top-[180px] h-[540px] w-[540px] rounded-full border border-white/20" />
        <div className="absolute -bottom-[220px] -left-[120px] h-[480px] w-[480px] rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-[1280px] px-10 py-[104px] text-center">
          <h2 className="mx-auto mb-[22px] max-w-[760px] text-[clamp(34px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Benchmark on the devices your users actually hold.
          </h2>
          <p className="mx-auto mb-9 max-w-[520px] text-[18px] leading-[1.5] text-white/80">
            Free and open source under MIT. Install the CLI and get your first real-device report in
            minutes.
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
            <Link
              to="/docs"
              className="rounded-[10px] border border-white/30 bg-white/10 px-6 py-3.5 text-[15px] font-medium text-white no-underline"
            >
              Read the docs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-footer text-[#A6A49B]">
        <div className="mx-auto max-w-[1280px] px-10 pb-10 pt-14">
          <div className="flex flex-wrap justify-between gap-10">
            <div className="max-w-[320px]">
              <div className="mb-4 flex items-center gap-[11px]">
                <span className="text-[20px] font-semibold tracking-[-0.045em] text-[#F2F1EC]">
                  mobench
                </span>
              </div>
              <p className="m-0 mb-[18px] text-sm leading-[1.55]">
                A Rust benchmarking harness for real mobile devices. Built and maintained by World.
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
            <div className="flex flex-wrap gap-16">
              <FooterCol
                title="Product"
                links={[
                  { label: 'Features', href: '#features' },
                  { label: 'Benchmarks', href: '#benchmarks' },
                  { label: 'Devices', href: '#devices' },
                ]}
              />
              <div className="flex flex-col gap-3">
                <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A9163]">
                  Resources
                </span>
                <Link to="/docs" className="text-sm text-[#A6A49B] no-underline hover:text-[#F2F1EC]">
                  Documentation
                </Link>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-sm text-[#A6A49B] no-underline hover:text-[#F2F1EC]">
                  GitHub
                </a>
                <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer" className="text-sm text-[#A6A49B] no-underline hover:text-[#F2F1EC]">
                  Issues
                </a>
              </div>
              <FooterCol
                title="World"
                links={[
                  { label: 'world.org', href: WORLD_URL, external: true },
                  { label: 'Brand', href: 'https://world.org/brand', external: true },
                ]}
              />
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-[22px] font-mono text-[11.5px] text-[#8A9163]">
            <span>© 2026 World · MIT License</span>
            <span>mobile-bench-rs · v0.3.0</span>
          </div>
        </div>
      </footer>
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
      <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A9163]">
        {title}
      </span>
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
