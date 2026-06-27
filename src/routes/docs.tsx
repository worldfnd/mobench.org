import { useState, type ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { GithubIcon, WorldMark, GITHUB_URL, WORLD_URL } from '@/components/icons'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/docs')({
  component: Docs,
})

type PageId =
  | 'home'
  | 'intro'
  | 'install'
  | 'quick'
  | 'write'
  | 'ffi'
  | 'cli'
  | 'packages'

interface PageDef {
  id: PageId
  label: string
  group: string
  toc: [string, string][]
}

const PAGES: PageDef[] = [
  { id: 'home', label: 'Overview', group: 'Introduction', toc: [['Get started', 'gs'], ['Guides', 'gd'], ['Reference', 'rf'], ['Quickstart', 'qs'], ['Quick links', 'ql']] },
  { id: 'intro', label: 'What is mobench', group: 'Introduction', toc: [['Why benchmark on real devices', 'why'], ['How it works', 'how']] },
  { id: 'install', label: 'Installation', group: 'Getting started', toc: [['Requirements', 'requirements'], ['Install the CLI', 'install'], ['Verify the install', 'verify']] },
  { id: 'quick', label: 'Quickstart', group: 'Getting started', toc: [['1 · Connect a device', 'connect'], ['2 · Mark a benchmark', 'annotate'], ['3 · Run it', 'run'], ['4 · Read the report', 'read']] },
  { id: 'write', label: 'Writing benchmarks', group: 'Guides', toc: [['The basic shape', 'basic'], ['Parameters', 'params']] },
  { id: 'ffi', label: 'FFI bindings', group: 'Guides', toc: [['Why bindings', 'whyffi'], ['UniFFI', 'uniffi'], ['Bolt FFI', 'bolt'], ['Native FFI', 'nativeffi']] },
  { id: 'cli', label: 'CLI reference', group: 'Reference', toc: [['mobench run', 'run'], ['Other commands', 'cmds']] },
  { id: 'packages', label: 'Packages & API', group: 'Reference', toc: [['The three crates', 'crates'], ['mobench', 'p-mobench'], ['mobench-sdk', 'p-sdk'], ['mobench-macros', 'p-macros'], ['Full API on docs.rs', 'docsrs']] },
]

const DOCSRS = {
  mobench: 'https://docs.rs/mobench/latest/mobench/',
  sdk: 'https://docs.rs/mobench-sdk/latest/mobench_sdk/',
  macros: 'https://docs.rs/mobench-macros/latest/mobench_macros/',
}

/* ---------- small presentational helpers ---------- */

function Mono({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[5px] bg-[rgba(20,18,12,0.06)] px-1.5 py-px font-mono text-[14px]">
      {children}
    </span>
  )
}

function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="m-0 mb-[18px] text-[50px] font-semibold leading-[1.03] tracking-[-0.045em]">
      {children}
    </h1>
  )
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-11 text-[21px] leading-[1.6] text-muted">{children}</p>
  )
}

function H2({ id, children, tight }: { id: string; children: ReactNode; tight?: boolean }) {
  return (
    <h2
      id={id}
      className={cn(
        'text-[30px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]',
        tight ? 'mb-[18px] mt-2' : 'mb-[18px] mt-[60px]',
      )}
    >
      {children}
    </h2>
  )
}

function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('m-0 mb-3.5 text-[17.5px] leading-[1.78] text-ink-soft', className)}>
      {children}
    </p>
  )
}

function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl bg-leaf px-5 py-[18px] font-mono text-[13.5px] leading-[1.9] text-code',
        className,
      )}
    >
      {children}
    </div>
  )
}

function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="my-7 flex gap-3.5 rounded-xl border border-green/20 bg-green/5 px-5 py-[18px]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.8" className="mt-px flex-none">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <circle cx="12" cy="8" r="0.6" fill="#3F7A2E" />
      </svg>
      <p className="m-0 text-[14.5px] leading-[1.6] text-ink-soft">{children}</p>
    </div>
  )
}

function WarnCallout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3.5 rounded-xl border border-[rgba(196,140,30,0.32)] bg-[#F6EFDD] px-5 py-[18px]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B07A12" strokeWidth="1.8" className="mt-px flex-none">
        <path d="M12 3l9 16H3z" />
        <line x1="12" y1="10" x2="12" y2="14" />
      </svg>
      <p className="m-0 text-[14.5px] leading-[1.6] text-[#6B5314]">{children}</p>
    </div>
  )
}

const C = {
  dollar: 'text-[#8A9163]',
  cmd: 'text-[#2E7D1B]',
  flag: 'text-[#9A6411]',
  out: 'text-[#6C7850]',
  ok: 'text-[#1E8A3B]',
  bad: 'text-[#C2521D]',
  kw: 'text-[#8A3DB0]',
  str: 'text-[#4E7A1C]',
  fn: 'text-[#1C7898]',
  num: 'text-[#F78C6C]',
}

/* ---------- card used on the hub ---------- */
function HubCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-[7px] rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-6 py-6 text-left font-sans transition-all hover:-translate-y-[3px] hover:border-green/50 hover:shadow-[0_16px_36px_-24px_rgba(20,18,12,0.45)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink">{title}</span>
        <span className="text-[18px] text-green">&rarr;</span>
      </div>
      <span className="text-[14.5px] leading-[1.5] text-muted">{desc}</span>
    </button>
  )
}

function LinkCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-[7px] rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-6 py-[22px] no-underline transition-all hover:-translate-y-[3px] hover:border-green/50 hover:shadow-[0_16px_36px_-24px_rgba(20,18,12,0.45)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold text-ink">{title}</span>
        <span className="text-[15px] text-faint">&#8599;</span>
      </div>
      <span className="text-sm leading-[1.5] text-muted">{desc}</span>
    </a>
  )
}

/* ---------- main ---------- */

function Docs() {
  const [page, setPage] = useState<PageId>('home')
  const [qtab, setQtab] = useState(0)

  const idx = PAGES.findIndex((p) => p.id === page)
  const active = PAGES[idx]
  const prev = PAGES[idx - 1]
  const next = PAGES[idx + 1]

  const go = (id: PageId) => {
    setPage(id)
    document.querySelector('main.mb-scroll')?.scrollTo({ top: 0 })
  }

  const groups: string[] = []
  PAGES.forEach((p) => {
    if (!groups.includes(p.group)) groups.push(p.group)
  })

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,12,0.09)] bg-[rgba(244,239,221,0.82)] backdrop-blur-[14px]">
        <div className="flex h-[60px] items-center justify-between gap-6 px-7">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-ink">
            <span className="text-[19px] font-semibold tracking-[-0.045em]">mobench</span>
            <span className="rounded-[5px] border border-[rgba(20,18,12,0.16)] px-1.5 py-0.5 font-mono text-[10.5px] text-faint">
              docs
            </span>
          </Link>
          <div className="hidden max-w-[420px] flex-1 items-center gap-[9px] rounded-[9px] border border-[rgba(20,18,12,0.14)] bg-white px-3 py-2 text-faint md:flex">
            <Search size={15} />
            <span className="flex-1 text-[13.5px]">Search the docs</span>
            <span className="rounded-[5px] border border-[rgba(20,18,12,0.14)] px-1.5 py-px font-mono text-[11px]">
              ⌘K
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13.5px] text-muted">
            <Link to="/" className="no-underline text-inherit">Home</Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-[7px] rounded-lg border border-[rgba(20,18,12,0.16)] px-3 py-[7px] text-ink no-underline"
            >
              <GithubIcon width={14} height={14} />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* 3 COLUMN */}
      <div className="mx-auto flex max-w-[1600px] items-start">
        {/* SIDEBAR */}
        <aside className="mb-scroll sticky top-[60px] h-[calc(100vh-60px)] w-[282px] flex-none overflow-y-auto border-r border-[rgba(20,18,12,0.08)] py-10 pl-[34px] pr-[22px]">
          {groups.map((g) => (
            <div key={g} className="mb-[26px]">
              <div className="mb-3 pl-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest">
                {g}
              </div>
              {PAGES.filter((p) => p.group === g).map((p) => {
                const isActive = p.id === page
                return (
                  <button
                    key={p.id}
                    onClick={() => go(p.id)}
                    className={cn(
                      'mb-[3px] block w-full cursor-pointer rounded-[9px] px-3.5 py-[9px] text-left text-[14.5px] leading-[1.35]',
                      isActive
                        ? 'bg-green/10 font-medium text-green shadow-[inset_2px_0_0_#3F7A2E]'
                        : 'font-normal text-muted hover:text-ink',
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          ))}
          <div className="mt-[30px] border-t border-[rgba(20,18,12,0.08)] pt-[22px]">
            <a href={DOCSRS.mobench} target="_blank" rel="noreferrer" className="block px-3 py-1.5 text-[13px] font-medium text-green no-underline">
              API reference on docs.rs &#8599;
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="block px-3 py-1.5 text-[13px] text-faint no-underline">
              Changelog &rarr;
            </a>
            <a href={WORLD_URL} target="_blank" rel="noreferrer" className="flex items-center gap-[7px] px-3 py-1.5 text-[13px] text-faint no-underline">
              <WorldMark width={16} height={16} /> Built by World
            </a>
          </div>
        </aside>

        {/* MAIN */}
        <main className="mb-scroll flex h-[calc(100vh-60px)] min-w-0 flex-1 justify-center overflow-y-auto px-12 pb-[130px] pt-14">
          <article className="w-full max-w-[880px]">
            {page !== 'home' && (
              <div className="mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-green">
                {active.group}
              </div>
            )}

            {page === 'home' && <HomePage go={go} qtab={qtab} setQtab={setQtab} />}
            {page === 'intro' && <IntroPage />}
            {page === 'install' && <InstallPage />}
            {page === 'quick' && <QuickPage />}
            {page === 'write' && <WritePage />}
            {page === 'ffi' && <FfiPage />}
            {page === 'cli' && <CliPage />}
            {page === 'packages' && <PackagesPage />}

            {/* prev / next */}
            <div className="mt-16 flex justify-between gap-4 border-t border-[rgba(20,18,12,0.1)] pt-7">
              {prev ? (
                <button
                  onClick={() => go(prev.id)}
                  className="flex-1 cursor-pointer rounded-xl border border-[rgba(20,18,12,0.12)] bg-white px-[18px] py-4 text-left font-sans"
                >
                  <span className="mb-[5px] block font-mono text-[11px] text-faint">&larr; PREVIOUS</span>
                  <span className="text-[15px] font-medium text-ink">{prev.label}</span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <button
                  onClick={() => go(next.id)}
                  className="flex-1 cursor-pointer rounded-xl border border-[rgba(20,18,12,0.12)] bg-white px-[18px] py-4 text-right font-sans"
                >
                  <span className="mb-[5px] block font-mono text-[11px] text-faint">NEXT &rarr;</span>
                  <span className="text-[15px] font-medium text-ink">{next.label}</span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          </article>
        </main>

        {/* RIGHT TOC */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[218px] flex-none overflow-y-auto px-7 pb-12 pl-[18px] pt-[60px] xl:block">
          <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest">
            On this page
          </div>
          <div className="flex flex-col gap-[11px] border-l border-[rgba(20,18,12,0.1)] pl-4">
            {active.toc.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="text-[13px] leading-[1.4] text-muted no-underline hover:text-green">
                {label}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ============ PAGES ============ */

function HomePage({
  go,
  qtab,
  setQtab,
}: {
  go: (id: PageId) => void
  qtab: number
  setQtab: (n: number) => void
}) {
  const qLabels = ['Install', 'Annotate', 'Run', 'Report']
  return (
    <div>
      <button
        onClick={() => go('quick')}
        className="mb-[34px] inline-flex cursor-pointer items-center gap-3 rounded-[40px] border border-green/20 bg-green/[0.07] py-2 pl-4 pr-2 font-sans transition-all hover:border-green/50 hover:bg-green/10"
      >
        <span className="rounded-[30px] bg-green px-[9px] py-[3px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-white">
          New
        </span>
        <span className="text-[14.5px] text-ink-soft">
          mobench v0.3 benchmarks on real devices &amp; BrowserStack
        </span>
        <span className="pr-2 text-[14px] font-medium text-green">Get started &rarr;</span>
      </button>

      <h1 className="m-0 mb-[22px] text-[52px] font-semibold leading-[1.02] tracking-[-0.045em]">
        mobench documentation
      </h1>
      <p className="m-0 mb-6 max-w-[720px] text-[21px] leading-[1.6] text-muted">
        mobench is an open-source Rust harness that benchmarks your code on real iOS and Android
        phones, reporting wall-clock time, peak memory, and energy. Everything you need to install
        it, write benches, run on devices, and read results lives here.
      </p>
      <div className="mb-3 flex flex-wrap gap-3">
        <button
          onClick={() => go('install')}
          className="cursor-pointer rounded-[10px] bg-green px-5 py-3 font-sans text-[15px] font-medium text-white transition-colors hover:bg-green-dark"
        >
          Install mobench
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[10px] border border-[rgba(20,18,12,0.16)] bg-white px-5 py-3 text-[15px] font-medium text-ink no-underline"
        >
          GitHub repo
        </a>
      </div>

      <h2 id="gs" className="mb-5 mt-[60px] text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        Get started
      </h2>
      <div className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-4">
        <HubCard title="What is mobench" desc="Why on-device benchmarking matters and how a run works end to end." onClick={() => go('intro')} />
        <HubCard title="Installation" desc="Install the CLI from crates.io and verify your host toolchain." onClick={() => go('install')} />
        <HubCard title="Quickstart" desc="From a fresh checkout to your first real-device report in a minute." onClick={() => go('quick')} />
      </div>

      <h2 id="gd" className="mb-5 mt-14 text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        Guides
      </h2>
      <div className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-4">
        <HubCard title="Writing benchmarks" desc="Annotate functions with #[mobench] and tune samples, warmup, and cold runs." onClick={() => go('write')} />
        <HubCard title="FFI bindings" desc="Drive the engine from Swift or Kotlin with UniFFI, Bolt FFI, or native FFI." onClick={() => go('ffi')} />
      </div>

      <h2 id="rf" className="mb-5 mt-14 text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        Reference
      </h2>
      <div className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-4">
        <HubCard title="CLI reference" desc="Every mobench subcommand and flag, from run to doctor to farm." onClick={() => go('cli')} />
        <HubCard title="Packages & API" desc="The three crates, plus the full rustdoc API hosted on docs.rs." onClick={() => go('packages')} />
      </div>

      <h2 id="qs" className="mb-4 mt-14 text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        Quickstart
      </h2>
      <p className="m-0 mb-5 text-[17.5px] leading-[1.7] text-ink-soft">
        Install the CLI, mark a function as a benchmark, run it on a device, and read the report.
      </p>
      <div className="overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.10)] shadow-[0_18px_44px_-34px_rgba(20,18,12,0.4)]">
        <div className="flex gap-1 border-b border-[rgba(20,18,12,0.08)] bg-[#EFE9D5] p-[9px]">
          {qLabels.map((label, i) => (
            <button
              key={label}
              onClick={() => setQtab(i)}
              className={cn(
                'cursor-pointer rounded-lg px-4 py-2 font-sans text-[13.5px]',
                qtab === i ? 'bg-ink font-medium text-white' : 'bg-transparent font-normal text-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto bg-leaf px-6 py-6 font-mono text-[14px] leading-[1.95] text-code">
          {qtab === 0 && (
            <div>
              <div><span className={C.dollar}>$</span> <span className={C.cmd}>cargo</span> install mobench</div>
              <div className={C.out}>  installed mobench v0.3.0</div>
            </div>
          )}
          {qtab === 1 && (
            <div>
              <div><span className={C.kw}>use</span> mobench::mobench;</div>
              <div>&nbsp;</div>
              <div><span className={C.fn}>#[mobench]</span></div>
              <div><span className={C.kw}>fn</span> <span className={C.fn}>prove</span>(b: &amp;<span className={C.flag}>mut</span> Bencher) {'{'}</div>
              <div>&nbsp;&nbsp;b.iter(|| prover.prove(&amp;circuit));</div>
              <div>{'}'}</div>
            </div>
          )}
          {qtab === 2 && (
            <div>
              <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> run <span className={C.flag}>--bench</span> prove <span className={C.flag}>--device</span> pixel-8</div>
              <div className={C.out}>  prove  <span className={C.ok}>408 ms</span>  rss 118.9 MiB  energy 0.31 J</div>
            </div>
          )}
          {qtab === 3 && (
            <div>
              <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> report <span className={C.flag}>--diff</span> baseline.json</div>
              <div className={C.out}>  prove   408 ms  <span className={C.bad}>+4.2%</span>  vs 391 ms</div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3.5 flex gap-[18px]">
        <a href={DOCSRS.sdk} target="_blank" rel="noreferrer" className="text-sm font-medium text-green no-underline">
          Swift &amp; Kotlin via FFI &rarr;
        </a>
        <button onClick={() => go('quick')} className="cursor-pointer p-0 font-sans text-sm font-medium text-green">
          Full quickstart &rarr;
        </button>
      </div>

      <h2 id="ql" className="mb-5 mt-14 text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        Quick links
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-4">
        <LinkCard title="GitHub" desc="Source, issues, and releases for mobile-bench-rs." href={GITHUB_URL} />
        <LinkCard title="API on docs.rs" desc="Full rustdoc for mobench, mobench-sdk, and mobench-macros." href={DOCSRS.mobench} />
        <LinkCard title="BrowserStack" desc="Run benches on a real-device cloud, no local hardware." href="https://www.browserstack.com/" />
      </div>
    </div>
  )
}

function IntroPage() {
  return (
    <div>
      <H1>Introduction</H1>
      <Lead>
        mobench is an open-source Rust harness that runs your benchmarks on real iOS and Android
        phones, then reports wall-clock time, peak memory, and energy for each device. It is built
        and maintained by World.
      </Lead>

      <H2 id="why">Why benchmark on real devices</H2>
      <P>
        Emulators and CI runners tell you how fast your code is on a data-center CPU with no thermal
        ceiling. Your users run it on a phone with a shared memory bus, an aggressive scheduler, and
        a battery that throttles under load. Those are different machines, and the gap is often where
        regressions hide.
      </P>
      <P>
        mobench closes that gap by deploying your benches to physical hardware and measuring what
        actually happens there, including cold starts, thermal throttling, and memory pressure that a
        desktop run never surfaces.
      </P>
      <InfoCallout>
        mobench grew out of World's work on client-side proving, where a few hundred milliseconds on
        a mid-range Android phone is the difference between a feature shipping and not. The metrics it
        captures reflect that priority.
      </InfoCallout>

      <H2 id="how">How it works</H2>
      <P>
        A single run moves through four stages, all driven by the <Mono>mobench</Mono> CLI:
      </P>
      <div className="mb-7 flex flex-col gap-2.5">
        {[
          ['01', 'Discover', ', finds attached devices over USB or a configured device farm.'],
          ['02', 'Build', ', cross-compiles your benches for each target architecture.'],
          ['03', 'Run', ', deploys, executes warm and cold runs, and samples timing, memory, and energy.'],
          ['04', 'Report', ', writes JSON and CSV, plus a regression diff against a baseline.'],
        ].map(([n, b, rest]) => (
          <div key={n} className="flex items-baseline gap-3.5">
            <span className="font-mono text-xs text-green">{n}</span>
            <span className="text-[17px] leading-[1.66] text-ink-soft">
              <b className="font-semibold text-ink">{b}</b>
              {rest}
            </span>
          </div>
        ))}
      </div>
      <Code className="text-[13px] leading-[1.9]">
        <div className={C.out}># a report entry</div>
        <div>{'{ '}<span className={C.cmd}>"device"</span>: <span className={C.flag}>"pixel-8"</span>, <span className={C.cmd}>"bench"</span>: <span className={C.flag}>"prove"</span>,</div>
        <div>&nbsp;&nbsp;<span className={C.cmd}>"time_ms"</span>: 408, <span className={C.cmd}>"peak_rss_mib"</span>: 118.9,</div>
        <div>&nbsp;&nbsp;<span className={C.cmd}>"energy_j"</span>: 0.31, <span className={C.cmd}>"runs"</span>: 50 {'}'}</div>
      </Code>
    </div>
  )
}

function InstallPage() {
  return (
    <div>
      <H1>Installation</H1>
      <Lead>
        mobench ships as a single CLI binary published to crates.io. Most users install it with Cargo
        in one command.
      </Lead>

      <H2 id="requirements" tight>Requirements</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Rust 1.76 or newer with <Mono>cargo</Mono> on your PATH.</li>
        <li>For Android targets: Android platform-tools (<Mono>adb</Mono>) on macOS, Linux, or Windows.</li>
        <li>For iOS targets: macOS with Xcode command-line tools.</li>
      </ul>

      <H2 id="install">Install the CLI</H2>
      <Code className="mb-[18px]">
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>cargo</span> install mobench</div>
      </Code>
      <P>Prefer a pinned release? Pass an explicit version:</P>
      <Code className="mb-7">
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>cargo</span> install mobench <span className={C.flag}>--version</span> 0.3.0</div>
      </Code>

      <H2 id="verify">Verify the install</H2>
      <P>Confirm the binary is on your PATH and check connected hardware with the built-in doctor:</P>
      <Code className="mb-7">
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> --version</div>
        <div className={C.out}>mobench 0.3.0</div>
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> doctor</div>
        <div className={C.out}>  cargo 1.79 <span className={C.ok}>ok</span> · adb 35.0 <span className={C.ok}>ok</span> · xcode 15.4 <span className={C.ok}>ok</span></div>
      </Code>

      <WarnCallout>
        iOS benchmarking requires macOS, Apple's toolchain only runs there. Android works from any
        host. If you have neither device locally, point mobench at a remote farm (see{' '}
        <b className="font-semibold">Running on devices</b>).
      </WarnCallout>
    </div>
  )
}

function QuickPage() {
  return (
    <div>
      <H1>Quickstart</H1>
      <Lead>
        From a fresh checkout to your first real-device report in about a minute. This assumes you
        have already installed the CLI.
      </Lead>

      <H2 id="connect" tight>1 · Connect a device</H2>
      <P>Plug in a phone over USB and enable developer mode, then list what mobench can see:</P>
      <Code className="mb-7">
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> devices</div>
        <div className={C.out}>  pixel-8     android 14  arm64  <span className={C.ok}>ready</span></div>
        <div className={C.out}>  iphone-15p  ios 17.5    arm64  <span className={C.ok}>ready</span></div>
      </Code>

      <H2 id="annotate">2 · Mark a benchmark</H2>
      <P>
        Annotate any function with <Mono>#[mobench]</Mono>. Existing Criterion benches work unchanged.
      </P>
      <Code className="mb-7 text-[13px] leading-[1.85]">
        <div><span className={C.kw}>use</span> mobench::mobench;</div>
        <div>&nbsp;</div>
        <div><span className={C.cmd}>#[mobench]</span></div>
        <div><span className={C.kw}>fn</span> <span className={C.cmd}>prove</span>(b: &amp;<span className={C.flag}>mut</span> Bencher) {'{'}</div>
        <div>&nbsp;&nbsp;<span className={C.kw}>let</span> circuit = load_circuit();</div>
        <div>&nbsp;&nbsp;b.iter(|| prover.prove(&amp;circuit));</div>
        <div>{'}'}</div>
      </Code>

      <H2 id="run">3 · Run it</H2>
      <Code className="mb-7">
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> run <span className={C.flag}>--bench</span> prove <span className={C.flag}>--device</span> pixel-8</div>
        <div className={C.out}>  building prove (arm64) … done</div>
        <div className={C.out}>  deploying to pixel-8 … done</div>
        <div className={C.out}>  prove  <span className={C.ok}>408 ms</span>  rss 118.9 MiB  energy 0.31 J</div>
        <div className={C.out}>  report → ./mobench/2026-06-27.json</div>
      </Code>

      <H2 id="read">4 · Read the report</H2>
      <P>Compare against a saved baseline to see regressions at a glance:</P>
      <Code>
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>mobench</span> report <span className={C.flag}>--diff</span> baseline.json</div>
        <div className={C.out}>  prove   408 ms  <span className={C.bad}>+4.2%</span>  vs 391 ms</div>
        <div className={C.out}>  verify   12 ms  <span className={C.ok}>-1.1%</span>  vs 12 ms</div>
      </Code>
    </div>
  )
}

function WritePage() {
  return (
    <div>
      <H1>Writing benchmarks</H1>
      <Lead>
        A mobench benchmark is an ordinary Rust function. The attribute macro handles
        cross-compilation, deployment, and measurement so your code stays focused on the work being
        timed.
      </Lead>

      <H2 id="basic" tight>The basic shape</H2>
      <P>
        Wrap the work you care about in <Mono>b.iter</Mono>. Setup outside the closure is excluded
        from timing.
      </P>
      <Code className="mb-7 text-[13px] leading-[1.85]">
        <div><span className={C.cmd}>#[mobench(samples = 50, warmup = 5)]</span></div>
        <div><span className={C.kw}>fn</span> <span className={C.cmd}>hash</span>(b: &amp;<span className={C.flag}>mut</span> Bencher) {'{'}</div>
        <div>&nbsp;&nbsp;<span className={C.kw}>let</span> input = random_bytes(<span className={C.num}>1</span> &lt;&lt; <span className={C.num}>20</span>);  <span className={C.out}>// excluded</span></div>
        <div>&nbsp;&nbsp;b.iter(|| sha256(&amp;input));        <span className={C.out}>// timed</span></div>
        <div>{'}'}</div>
      </Code>

      <H2 id="params">Parameters</H2>
      <div className="mb-7 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.1)]">
        <div className="flex bg-[#EDE6D2] px-[18px] py-3 font-mono text-[11.5px] uppercase tracking-[0.04em] text-faint">
          <span className="w-[130px] flex-none">Key</span>
          <span className="w-[90px] flex-none">Default</span>
          <span>Meaning</span>
        </div>
        {[
          ['samples', '50', 'Timed iterations recorded per device.'],
          ['warmup', '5', 'Untimed runs to settle caches and clocks.'],
          ['cold', 'false', 'Relaunch the process between samples.'],
        ].map(([k, d, m]) => (
          <div key={k} className="flex border-t border-[rgba(20,18,12,0.08)] px-[18px] py-[13px] text-[14.5px] text-ink-soft">
            <span className="w-[130px] flex-none font-mono text-[13px] text-green">{k}</span>
            <span className="w-[90px] flex-none font-mono text-[13px]">{d}</span>
            <span>{m}</span>
          </div>
        ))}
      </div>

      <InfoCallout>
        Use <span className="font-mono text-[13px]">cold = true</span> for cryptographic setup or
        model-loading work, where the first run is what your users feel.
      </InfoCallout>
    </div>
  )
}

function CliPage() {
  return (
    <div>
      <H1>CLI reference</H1>
      <Lead>
        Every mobench subcommand at a glance. Run <Mono>mobench help &lt;cmd&gt;</Mono> for full
        flags.
      </Lead>

      <H2 id="run" tight>mobench run</H2>
      <P>Build, deploy, and execute benchmarks on one or more devices.</P>
      <div className="mb-8 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.1)]">
        <div className="flex bg-leaf px-[18px] py-3 font-mono text-[13px] text-code">
          <span className={C.dollar}>$&nbsp;</span>mobench run <span className={C.flag}>&nbsp;[flags]</span>
        </div>
        {[
          ['--bench <name>', 'Run a single named benchmark.'],
          ['--device <id>', 'Target one device; repeatable.'],
          ['--out <path>', 'Report destination (default ./mobench).'],
        ].map(([flag, desc]) => (
          <div key={flag} className="flex border-t border-[rgba(20,18,12,0.08)] px-[18px] py-[13px] text-[14.5px] text-ink-soft">
            <span className="w-[150px] flex-none font-mono text-[13px] text-green">{flag}</span>
            <span>{desc}</span>
          </div>
        ))}
      </div>

      <H2 id="cmds">Other commands</H2>
      <div className="flex flex-col overflow-hidden rounded-xl border border-[rgba(20,18,12,0.1)]">
        {[
          ['devices', 'List discoverable devices and their status.'],
          ['report', 'Render or diff an existing report.'],
          ['doctor', 'Check the host toolchain and connections.'],
          ['farm', 'Configure and authenticate against a device farm.'],
        ].map(([cmd, desc], i) => (
          <div
            key={cmd}
            className={cn(
              'flex px-[18px] py-[15px] text-[15px] text-ink-soft',
              i > 0 && 'border-t border-[rgba(20,18,12,0.08)]',
            )}
          >
            <span className="w-[150px] flex-none font-mono text-[13.5px] text-green">{cmd}</span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FfiPage() {
  return (
    <div>
      <H1>FFI bindings</H1>
      <Lead>
        mobench's measurement engine lives in <span className="font-mono text-[15px]">mobench-sdk</span>,
        which exposes a stable C ABI. You can drive the same engine from Swift, Kotlin, or any host
        language using whichever binding generator your team prefers: UniFFI, Bolt FFI, or
        hand-written native FFI.
      </Lead>

      <H2 id="whyffi" tight>Why bindings</H2>
      <P>
        On-device benchmarks often need to call into your app's own code, which may be written in
        Swift or Kotlin rather than Rust. Bindings bridge the SDK to that code without reimplementing
        the harness, and all three options compile against the same stable ABI, so you can switch
        generators without touching the engine.
      </P>

      <H2 id="uniffi">UniFFI</H2>
      <P>
        The recommended path for most mobile teams. Enable the <Mono>uniffi</Mono> feature and
        generate idiomatic Swift and Kotlin wrappers from the SDK's interface definition.
      </P>
      <Code className="mb-7 text-[13px]">
        <div className={C.out}># Cargo.toml</div>
        <div>mobench-sdk = {'{'} version = <span className={C.str}>"0.3"</span>, features = [<span className={C.str}>"uniffi"</span>] {'}'}</div>
        <div className={C.out}>&nbsp;</div>
        <div><span className={C.dollar}>$</span> <span className={C.cmd}>uniffi-bindgen</span> generate src/mobench.udl <span className={C.flag}>--language</span> swift</div>
      </Code>

      <H2 id="bolt">Bolt FFI</H2>
      <P>
        Already standardized on Bolt? mobench-sdk ships a Bolt-compatible surface behind the{' '}
        <Mono>bolt-ffi</Mono> feature, so it slots into your existing binding workflow.
      </P>
      <Code className="mb-7 text-[13px]">
        <div className={C.out}># Cargo.toml</div>
        <div>mobench-sdk = {'{'} version = <span className={C.str}>"0.3"</span>, features = [<span className={C.str}>"bolt-ffi"</span>] {'}'}</div>
      </Code>

      <H2 id="nativeffi">Native FFI</H2>
      <P>
        Need full control? Link the generated C header directly and hand-write your own native FFI
        against the stable ABI.
      </P>
      <Code className="mb-7 text-[13px] leading-[1.85]">
        <div><span className={C.kw}>#include</span> <span className={C.str}>"mobench_sdk.h"</span></div>
        <div>&nbsp;</div>
        <div>MobenchConfig cfg = mobench_config_default();</div>
        <div>mobench_run(&amp;cfg);  <span className={C.out}>// same engine, your ABI</span></div>
      </Code>

      <InfoCallout>
        All three generators target the identical C ABI exported by{' '}
        <b className="font-semibold">mobench-sdk</b>. Pick one per platform, or mix them across an
        organization, without forking the engine.
      </InfoCallout>
    </div>
  )
}

function PackagesPage() {
  return (
    <div>
      <H1>Packages &amp; API</H1>
      <p className="m-0 mb-7 text-[21px] leading-[1.6] text-muted">
        mobench is published to crates.io as three crates. Most users depend on only one. Full
        rustdoc for every public item is hosted on docs.rs.
      </p>

      <a
        href={DOCSRS.mobench}
        target="_blank"
        rel="noreferrer"
        className="mb-10 inline-flex items-center gap-[9px] rounded-[10px] bg-green px-5 py-3 text-sm font-medium text-white no-underline"
      >
        View the full API on docs.rs <span className="text-base">&#8599;</span>
      </a>

      <H2 id="crates" tight>The three crates</H2>
      <div className="mb-6 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.1)]">
        {[
          ['mobench', 'The CLI and run orchestration. The binary you install.'],
          ['mobench-sdk', 'The measurement engine and FFI surface (UniFFI / Bolt / native).'],
          ['mobench-macros', null],
        ].map(([name, desc], i) => (
          <div
            key={name as string}
            className={cn(
              'flex px-[18px] py-3.5 text-[14.5px] text-ink-soft',
              i < 2 && 'border-b border-[rgba(20,18,12,0.08)]',
            )}
          >
            <span className="w-[170px] flex-none font-mono text-[13.5px] text-green">{name}</span>
            <span>
              {desc ?? (
                <>
                  The <span className="font-mono text-[13px]">#[mobench]</span> attribute macro.
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      <h2 id="p-mobench" className="mb-4 mt-[52px] text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        mobench
      </h2>
      <P>
        The user-facing binary crate. It implements device discovery, cross-compilation, deployment,
        the run loop, and report writing, and exposes the <Mono>mobench</Mono> command described in
        the CLI reference. Depend on it only if you are embedding the orchestrator.
      </P>
      <DocsLink href={DOCSRS.mobench}>docs.rs/mobench</DocsLink>

      <h2 id="p-sdk" className="mb-4 mt-[52px] text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        mobench-sdk
      </h2>
      <P>
        The portable measurement engine: samplers for wall-clock time, peak resident memory, and
        energy, plus the stable C ABI consumed by the bindings. This is what you link when calling
        mobench from Swift, Kotlin, or another language. See{' '}
        <b className="font-semibold">FFI bindings</b> for the integration paths.
      </P>
      <DocsLink href={DOCSRS.sdk}>docs.rs/mobench-sdk</DocsLink>

      <h2 id="p-macros" className="mb-4 mt-[52px] text-[26px] font-semibold tracking-[-0.03em] [scroll-margin-top:90px]">
        mobench-macros
      </h2>
      <P>
        The procedural macro crate behind the <Mono>#[mobench]</Mono> attribute. It expands annotated
        functions into registered benchmarks the engine can discover and run. You rarely depend on it
        directly; it is re-exported by the SDK.
      </P>
      <DocsLink href={DOCSRS.macros}>docs.rs/mobench-macros</DocsLink>

      <H2 id="docsrs">Full API on docs.rs</H2>
      <P>
        Every public type, trait, and function is documented on docs.rs and rebuilt on each release.
        Use it as the authoritative reference for signatures and feature flags.
      </P>
      <div className="flex flex-wrap gap-3">
        {[
          ['mobench', DOCSRS.mobench],
          ['mobench-sdk', DOCSRS.sdk],
          ['mobench-macros', DOCSRS.macros],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-[10px] border border-[rgba(20,18,12,0.14)] px-4 py-[11px] font-mono text-[13px] text-ink no-underline"
          >
            {label} &#8599;
          </a>
        ))}
      </div>
    </div>
  )
}

function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-[7px] text-sm font-medium text-green no-underline"
    >
      {children} <span>&#8599;</span>
    </a>
  )
}
