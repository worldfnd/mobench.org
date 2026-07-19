import { isValidElement, useEffect, useMemo, useRef, useState, type ComponentType, type MouseEvent, type ReactNode, type SVGProps } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Compass,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCode2,
  FileJson,
  Layers,
  ListChecks,
  Maximize2,
  MessageCircle,
  Network,
  PackageCheck,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Terminal,
  TestTube2,
  Workflow,
  Wrench,
  X,
} from 'lucide-react'
import { SyntaxHighlightedCode } from '@/components/code-highlight'
import { ThemeToggle } from '@/components/theme-toggle'
import { MOBENCH_VERSION } from '@/components/icons'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/docs')({
  component: Docs,
})

type Icon = ComponentType<SVGProps<SVGSVGElement>>

type PageId =
  | 'overview'
  | 'quickstart'
  | 'install'
  | 'concepts'
  | 'authoring'
  | 'setup-teardown'
  | 'sdk'
  | 'build'
 | 'local-devices'
 | 'browserstack'
 | 'app-automate'
 | 'profiling'
  | 'reports'
  | 'cli-reference'
  | 'schemas'
  | 'examples'
  | 'diagrams'
  | 'current-spec'
 | 'codebase'
  | 'testing'
  | 'public-api'
  | 'troubleshooting'

type PageDef = {
  id: PageId
  label: string
  group: string
  description: string
  icon: Icon
  toc: string[]
}

type Section = {
title: string
body?: ReactNode[]
bullets?: ReactNode[]
image?: {
 src: string
 alt: string
 caption?: string
}
codeVariants?: readonly {
 id: string
 label: string
 language: string
 value: string
}[]
code?: {
language: string
value: string
}
}

const DOCSRS = {
  mobench: 'https://docs.rs/mobench/latest/mobench/',
  sdk: 'https://docs.rs/mobench-sdk/latest/mobench_sdk/',
  macros: 'https://docs.rs/mobench-macros/latest/mobench_macros/',
}

const LANDING_URL = 'https://mobench.org'
const GITHUB_REPO = 'https://github.com/worldcoin/mobile-bench-rs'
const DEEPWIKI_URL = 'https://deepwiki.com/worldcoin/mobile-bench-rs'
const DEEPWIKI_OVERVIEW_URL = 'https://deepwiki.com/worldcoin/mobile-bench-rs/1-overview'
const EXTERNAL_DOCS = {
  rust: 'https://www.rust-lang.org/tools/install',
  browserstack: 'https://www.browserstack.com/',
  appAutomate: 'https://www.browserstack.com/app-automate',
  appAutomateApi: 'https://www.browserstack.com/docs/app-automate/api-reference/introduction',
  appAutomateEspresso: 'https://www.browserstack.com/docs/app-automate/espresso/getting-started',
  appAutomateXcuitest: 'https://www.browserstack.com/docs/app-automate/xcuitest',
  espresso: 'https://developer.android.com/training/testing/espresso',
  xctest: 'https://developer.apple.com/documentation/xctest',
  uniffi: 'https://github.com/mozilla/uniffi-rs',
  boltffi: 'https://github.com/boltffi/boltffi',
  androidStudio: 'https://developer.android.com/studio',
  android: 'https://developer.android.com/',
  xcode: 'https://developer.apple.com/xcode/',
 ios: 'https://developer.apple.com/ios/',
 worldApp: 'http://world.org/world-app',
 worldId: 'https://docs.world.org/world-id',
 provekit: 'https://provekit.org/',
} as const

type BrandLogoName = 'rust' | 'browserstack' | 'androidStudio' | 'android' | 'xcode' | 'ios'

const BRAND_LOGOS: Record<BrandLogoName, { src: string; alt: string }> = {
  rust: { src: '/assets/logo-rust.svg', alt: 'Rust' },
  browserstack: { src: '/assets/logo-browserstack.svg', alt: 'BrowserStack' },
  androidStudio: { src: '/assets/logo-android-studio.svg', alt: 'Android Studio' },
  android: { src: '/assets/logo-android.svg', alt: 'Android' },
  xcode: { src: '/assets/logo-xcode.svg', alt: 'Xcode' },
  ios: { src: '/assets/logo-apple.svg', alt: 'Apple' },
}

const INSTALL_COMMANDS = [
 {
 id: 'mac',
 label: 'Mac',
 language: 'bash',
 value: `# macOS without Homebrew
# Xcode/iOS support is macOS-only and may require App Store sign-in.
xcode-select --install || true
open "macappstore://apps.apple.com/app/xcode/id497799835"

# Android Studio installs the Android SDK, emulator, and SDK manager UI.
open "https://developer.android.com/studio"

# Rust and mobench.
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
. "$HOME/.cargo/env"
cargo install mobench

# After Android Studio installs Platform Tools, reopen the terminal and verify.
adb version
mobench --version`,
 },
 {
 id: 'brew',
 label: 'Brew',
 language: 'bash',
 value: `# macOS with Homebrew
if ! command -v brew >/dev/null 2>&1; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

brew install android-platform-tools
brew install --cask android-studio
xcode-select --install || true
open "macappstore://apps.apple.com/app/xcode/id497799835"

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
. "$HOME/.cargo/env"
cargo install mobench

adb version
mobench --version`,
 },
 {
 id: 'windows',
 label: 'Windows',
 language: 'powershell',
 value: `# Windows PowerShell
winget install -e --id Rustlang.Rustup
winget install -e --id Google.PlatformTools
winget install -e --id Google.AndroidStudio

# Open a new PowerShell after winget finishes so PATH refreshes.
cargo install mobench

adb version
mobench --version`,
 },
 {
 id: 'linux',
 label: 'Linux',
 language: 'bash',
 value: `# Linux: Debian/Ubuntu, Fedora, or Arch
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y curl build-essential pkg-config libssl-dev unzip adb
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y curl gcc gcc-c++ make openssl-devel unzip android-tools
elif command -v pacman >/dev/null 2>&1; then
  sudo pacman -Syu --needed curl base-devel openssl unzip android-tools
else
  echo "Install curl, compiler toolchain, OpenSSL headers, unzip, and Android platform-tools for your distro."
fi

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
. "$HOME/.cargo/env"
cargo install mobench

adb version
mobench --version`,
 },
] as const

const PAGES: PageDef[] = [
  {
    id: 'overview',
    label: 'Overview',
    group: 'Start',
    description: 'mobench is a Rust mobile benchmarking toolkit for Android and iOS, with a CLI, SDK runtime, macro-based benchmarks, generated mobile runners, CI reports, and profiling artifacts.',
    icon: BookOpen,
    toc: ['Why mobench exists', 'What mobench provides', 'How pieces fit', 'Where to go next'],
  },
  {
    id: 'quickstart',
    label: 'Quickstart',
    group: 'Start',
    description: 'Install the CLI, register a benchmark, build mobile runners, and run locally, on emulators or simulators, or on BrowserStack.',
    icon: Rocket,
    toc: ['Command path', 'Local targets', 'First benchmark'],
  },
  {
    id: 'install',
    label: 'Installation',
    group: 'Start',
    description: 'Set up the Rust workspace, mobile toolchains, BrowserStack credentials when needed, and the project configuration file.',
    icon: PackageCheck,
    toc: ['Copy-paste install', 'Rust and CLI', 'Android and iOS', 'BrowserStack credentials'],
  },
  {
    id: 'concepts',
    label: 'Concepts',
    group: 'Start',
    description: 'Understand benchmark definitions, generated runners, local and hosted providers, reports, schemas, and profiling output.',
    icon: Compass,
    toc: ['Product surfaces', 'Crates', 'Artifact flow'],
  },
  {
    id: 'authoring',
    label: 'Writing benchmarks',
    group: 'Authoring',
    description: 'Use the benchmark macro, setup inputs, teardown functions, and registry discovery rules to expose Rust functions to mobench.',
    icon: Code2,
    toc: ['Macro shape', 'Discovery', 'Best practices'],
  },
  {
    id: 'setup-teardown',
    label: 'Setup & teardown',
    group: 'Authoring',
    description: 'Keep expensive initialization and cleanup outside measured samples while still giving every iteration the input shape it needs.',
    icon: Wrench,
    toc: ['Setup modes', 'Teardown', 'Compatibility'],
  },
  {
    id: 'sdk',
    label: 'SDK integration',
    group: 'Guides',
    description: 'Add mobench-sdk to a crate, configure runner backends, export native C ABI when needed, and use public runtime types.',
    icon: FileCode2,
 toc: ['Dependencies', 'Runtime APIs', 'Choosing an FFI backend', 'Native C ABI'],
  },
  {
    id: 'build',
    label: 'Build artifacts',
    group: 'Guides',
    description: 'Generate Android and iOS runner projects, understand runner backends, and verify outputs under target/mobench.',
    icon: Terminal,
    toc: ['Prerequisites', 'Build commands', 'Outputs'],
  },
  {
    id: 'local-devices',
    label: 'Local devices',
    group: 'Guides',
    description: 'Run against connected phones, Android emulators via Android Studio and ADB, and iOS simulators or connected devices via Xcode.',
    icon: Smartphone,
    toc: ['Android', 'iOS', 'Host-only smoke runs'],
  },
  {
    id: 'browserstack',
    label: 'BrowserStack CI',
    group: 'Guides',
    description: 'Use hosted real devices, matrix resolution, split-sample merging, PR reporting, artifact fetching, and normalized resource metrics.',
    icon: Cloud,
    toc: ['Credentials', 'Device resolution', 'CI contract', 'Split-sample merge'],
  },
  {
    id: 'app-automate',
    label: 'App Automate setup',
    group: 'Guides',
    description: 'Set up BrowserStack App Automate for mobench Android Espresso and iOS XCUITest runs, including API uploads, build execution, devices, trial limits, and pricing expectations.',
    icon: Layers,
    toc: ['Account and pricing', 'Espresso on Android', 'XCUITest on iOS', 'API lifecycle', 'Devices'],
  },

  {
    id: 'profiling',
    label: 'Profiling',
    group: 'Guides',
    description: 'Run local native profiling, produce trace events, semantic phase summaries, flamegraphs, and profile diffs.',
    icon: Activity,
    toc: ['Capability matrix', 'Artifacts', 'Flamegraph viewer', 'Phases'],
  },
  {
    id: 'reports',
    label: 'Outputs & reports',
    group: 'Reference',
    description: 'Understand summary JSON, Markdown summaries, CSV rows, split-run outputs, BrowserStack artifacts, PR comments, and profiling bundles.',
    icon: BarChart3,
    toc: ['Output layout', 'Split-run outputs', 'Report helpers', 'Fixtures'],
  },
  {
    id: 'cli-reference',
    label: 'CLI man pages',
    group: 'Reference',
    description: 'Exhaustive command reference for mobench: commands, subcommands, flags, expected inputs, outputs, defaults, and common examples.',
    icon: Terminal,
    toc: ['Command model', 'Benchmark runs', 'Build and project setup', 'CI commands', 'Device and config helpers', 'Reports and profiling', 'Outputs and contracts'],
  },
  {
    id: 'schemas',
    label: 'Schemas',
    group: 'Reference',
    description: 'Machine-readable contracts for CI metadata, benchmark summaries, trace events, and fixture payloads.',
    icon: FileJson,
    toc: ['CI contract', 'Summary', 'Trace events'],
  },
  {
    id: 'examples',
    label: 'Examples explained',
    group: 'Reference',
    description: 'What the basic benchmark and native C ABI / FFI examples demonstrate, and how their fixture outputs map to reports.',
    icon: Boxes,
    toc: ['Basic benchmark', 'FFI benchmark', 'Fixture outputs'],
  },
  {
    id: 'diagrams',
    label: 'Diagrams',
    group: 'Reference',
    description: 'Architecture, benchmark lifecycle, BrowserStack CI, profiling artifacts, and SDK versus CLI responsibility diagrams.',
    icon: Workflow,
    toc: ['Crate architecture', 'Benchmark lifecycle', 'Provider flow'],
  },
  {
    id: 'current-spec',
    label: 'Current behavior',
    group: 'Specs',
    description: 'Current behavior and API contract for release 0.1.46: CLI, config, runners, public APIs, schemas, and compatibility boundaries.',
    icon: ListChecks,
    toc: ['Scope', 'Contracts', 'Compatibility'],
  },
  {
    id: 'codebase',
    label: 'Codebase architecture',
    group: 'Codebase',
    description: 'Workspace layout, runtime layers, generated templates, integrations, stack, and ownership boundaries.',
    icon: Network,
    toc: ['Workspace', 'Runtime layers', 'Integrations'],
  },
  {
    id: 'testing',
    label: 'Testing strategy',
    group: 'Codebase',
    description: 'Host tests, CLI smoke checks, split-run merge validation, CI contract checks, BrowserStack smoke tests, and profiling checks.',
    icon: TestTube2,
    toc: ['Test taxonomy', 'CI checks', 'Profiling checks'],
  },
  {
    id: 'public-api',
    label: 'Public API',
    group: 'Codebase',
    description: 'Published crates, feature flags, serialized contracts, error boundaries, semver policy, MSRV, and release readiness.',
    icon: ShieldCheck,
    toc: ['Crates', 'Feature flags', 'Release checks'],
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    group: 'Help',
    description: 'Common setup, build, discovery, BrowserStack, profiling, schema, and result-quality issues.',
    icon: AlertTriangle,
    toc: ['Setup', 'Runs', 'Reports'],
  },
]

const DOCS_PAGE_ALIASES: Partial<Record<string, PageId>> = {
  docs: 'overview',
  overview: 'overview',
  home: 'overview',
  installation: 'install',
  install: 'install',
  authoring: 'authoring',
  writing: 'authoring',
  'writing-benchmarks': 'authoring',
  'setup-and-teardown': 'setup-teardown',
  'sdk-integration': 'sdk',
  'build-artifacts': 'build',
  'local-devices': 'local-devices',
  'browserstack-ci': 'browserstack',
  browserstack: 'browserstack',
  'app-automate-setup': 'app-automate',
  'outputs-and-reports': 'reports',
  'cli-man-pages': 'cli-reference',
  reference: 'cli-reference',
}

export function docsPathForPage(id: PageId) {
  return id === 'overview' ? '/docs' : `/${id}`
}

export function getDocsPageBySlug(slug: string | undefined) {
  const normalized = (slug ?? 'docs').toLowerCase().replace(/^\/+|\/+$/g, '')
  const aliased = DOCS_PAGE_ALIASES[normalized]
  const id = aliased ?? (PAGES.some((page) => page.id === normalized) ? normalized as PageId : null)
  return id ? PAGES.find((page) => page.id === id) ?? null : null
}

const CONTENT: Record<PageId, Section[]> = {
 overview: [
 {
 title: 'Why mobench exists',
 body: [
 <>mobench came from an internal need to benchmark intense Rust workloads in mobile environments representative of real <InlineLink href={EXTERNAL_DOCS.worldApp}>World App</InlineLink> users. That means runs cannot only target flagship phones; the matrix also needs medium-tier devices, low-end devices, and even older 32-bit devices that may still be in circulation roughly a decade later.</>,
 <>The practical goal was confidence across the device range that matters for <InlineLink href={EXTERNAL_DOCS.provekit}>ProveKit</InlineLink>, the cryptography library that powers <InlineLink href={EXTERNAL_DOCS.worldId}>World ID</InlineLink>. mobench helps teams measure whether heavy cryptographic paths hold up for the 95%-99% of users whose real phones define production performance, thermal behavior, and reliability.</>,
 ],
 },
 {
 title: 'What mobench provides',
      body: [
 <><InlineLink href={GITHUB_REPO}>mobench</InlineLink> keeps benchmark definitions in Rust and runs them in places mobile code actually pays its costs: Android iOS runners, host-only smoke runs, connected local devices, emulators simulators, <InlineLink href={EXTERNAL_DOCS.browserstack}>BrowserStack</InlineLink> devices, profiling flows.</>,
      ],
      bullets: [
 <>A <InlineLink href={DOCSRS.mobench}><code>mobench</code> CLI</InlineLink> for build, run, CI, reporting, <InlineLink href={EXTERNAL_DOCS.browserstack}>BrowserStack</InlineLink>, device resolution, profiling commands.</>,
 <>A <InlineLink href={DOCSRS.sdk}><code>mobench-sdk</code></InlineLink> runtime with timing, registry, runner builders, mobile builders, profiling helpers, <InlineLink href={EXTERNAL_DOCS.uniffi}>UniFFI</InlineLink> compatibility, <InlineLink href={EXTERNAL_DOCS.boltffi}>BoltFFI</InlineLink> support, and native C ABI support.</>,
 <>A <InlineLink href={DOCSRS.macros}><code>mobench-macros</code></InlineLink> crate registers <code>#[benchmark]</code> functions through inventory.</>,
        <>Stable output artifacts: JSON summaries, Markdown summaries, CSV rows, optional plots, profiling manifests, trace-event JSON, and flamegraph bundles.</>,
      ],
    },
    {
      title: 'How the pieces fit',
      body: [
        <>The CLI resolves project configuration, builds generated Android or iOS runner projects, invokes a local or hosted provider, fetches artifacts, and writes normalized reports. The SDK owns benchmark execution, timing, registry lookup, setup and teardown handling, runner reports, and public types.</>,
      ],
      code: {
        language: 'text',
        value: `benchmark crate
  -> mobench-sdk registry and timing
  -> generated Android / iOS runner
  -> local device, emulator, simulator, host-only, or BrowserStack provider
  -> summary.json, summary.md, results.csv, plots, profile artifacts`,
      },
    },
    {
      title: 'Where to go next',
      bullets: [
        <>Start with Quickstart for the smallest working path.</>,
        <>Use Local devices when you want connected phones, Android Studio emulators, ADB, Xcode simulators, or connected iOS devices.</>,
        <>Use BrowserStack CI for hosted real-device runs and PR reporting.</>,
        <>Use Outputs, Schemas, and Examples when wiring downstream tooling.</>,
      ],
    },
    {
      title: 'External AI documentation',
      body: [
        <>
          DeepWiki by Cognition indexes the upstream repository into an external technical wiki that can be used as AI-readable context for Devin and other coding assistants. Use it when you want repo-wide navigation, source-linked explanations, or a fast second view beside these authored docs.
        </>,
      ],
      bullets: [
        <>
          <a href={DEEPWIKI_OVERVIEW_URL} target="_blank" rel="noreferrer" className="font-medium text-green underline decoration-green/30 underline-offset-4">DeepWiki overview</a> summarizes purpose, crate architecture, generated runner flow, reporting, and native profiling.
        </>,
        <>
          <a href={DEEPWIKI_URL} target="_blank" rel="noreferrer" className="font-medium text-green underline decoration-green/30 underline-offset-4">DeepWiki index</a> exposes the topic map for system architecture, CLI, SDK, macros, BrowserStack, templates, profiling, CI, examples, dependencies, and glossary pages.
        </>,
        <>The “Copy page” action copies this authored page or sends it to an assistant; pair that with DeepWiki when you want an AI to answer from both local docs and source-indexed context.</>,
      ],
    },
  ],
  quickstart: [
    {
      title: 'Command path',
      body: [
        <>The fast path is install, initialize config, check prerequisites, build a target runner, then run locally or through a provider.</>,
      ],
      code: {
        language: 'bash',
        value: `cargo install mobench
mobench init
mobench doctor
mobench build --target android --release
mobench run --local --function fibonacci_30 --iterations 100 --warmup 10
mobench ci run --target android --browserstack --output target/mobench/ci`,
      },
    },
    {
      title: 'Local targets',
      body: [
        <>Local does not only mean a physical phone. Android can run through connected devices or Android emulators managed by Android Studio and ADB. iOS can run through Xcode-managed simulators or connected iOS devices. BrowserStack is the hosted-device path, useful for shared CI and reproducible remote devices.</>,
      ],
    },
    {
      title: 'First benchmark',
      code: {
        language: 'rust',
        value: `use mobench_sdk::benchmark;

#[benchmark]
pub fn fibonacci_30() {
    let result = fibonacci(30);
    std::hint::black_box(result);
}

fn setup_data() -> Vec<u8> {
    vec![42; 1024 * 1024]
}

#[benchmark(setup = setup_data)]
pub fn checksum(data: &Vec<u8>) {
    let sum: u64 = data.iter().map(|byte| *byte as u64).sum();
    std::hint::black_box(sum);
}`,
      },
    },
  ],
  install: [
    {
      title: 'Copy-paste install',
      body: [
        <>Use the matching section for your operating system to install ADB/platform tools, Android Studio, Rust, and mobench. Xcode and iOS simulator support are macOS-only; the command opens Apple installers where an interactive sign-in is required.</>,
      ],
 codeVariants: INSTALL_COMMANDS,
    },
    {
      title: 'Rust and CLI',
      bullets: [
 <>Install <BrandLink href={EXTERNAL_DOCS.rust} logo="rust">Rust</BrandLink> with <code>rustup</code>. Use Rust 2024-compatible toolchains; current workspace release line is <code>0.1.46</code> and documented MSRV is Rust 1.85.</>,
 <>Install CLI <code>cargo install mobench</code> or build from repository when developing mobench itself.</>,
 <>Add <code>mobench-sdk</code>, <code>inventory</code>, and required crate types to benchmark crates.</>,
 ],
 code: {
 language: 'toml',
 value: `[dependencies]
mobench-sdk = "0.1.46"
inventory = "0.3"

[lib]
crate-type = ["cdylib", "staticlib", "lib"]`,
 },
 },
 {
 title: 'Android and iOS',
 bullets: [
 <><BrandLink href={EXTERNAL_DOCS.androidStudio} logo="androidStudio">Android Studio</BrandLink> is the normal route for installing <BrandLink href={EXTERNAL_DOCS.android} logo="android">Android</BrandLink> SDKs, managing emulators, and exposing devices through ADB.</>,
 <><BrandLink href={EXTERNAL_DOCS.xcode} logo="xcode">Xcode</BrandLink> provides command-line tools, simulators, signing, and connected-device support for <BrandLink href={EXTERNAL_DOCS.ios} logo="ios">iOS</BrandLink> generated runner projects.</>,
 <>Use <code>mobench check --target android</code> and <code>mobench check --target ios</code> before chasing build failures.</>,
 ],
 },
 {
 title: 'BrowserStack credentials',
 body: [
 <><BrandLink href={EXTERNAL_DOCS.browserstack} logo="browserstack">BrowserStack</BrandLink> is optional local development, but required hosted real-device CI jobs. mobench uses <BrandLink href={EXTERNAL_DOCS.appAutomate} logo="browserstack">App Automate</BrandLink> when runs need BrowserStack Android <BrandLink href={EXTERNAL_DOCS.espresso} logo="android">Espresso</BrandLink> or iOS <BrandLink href={EXTERNAL_DOCS.xctest} logo="ios">XCUITest</BrandLink> execution.</>,
 ],
 code: {
 language: 'bash',
 value: `export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
export BROWSERSTACK_PROJECT="mobile-benchmarks"`,
 },
 },
 ],
  concepts: [
    {
      title: 'Product surfaces',
      bullets: [
        <>Benchmark execution builds mobile artifacts, runs benchmarks host-only, locally, or on BrowserStack, and writes report artifacts.</>,
        <>Local native profiling runs capture plans and produces normalized profile manifests, flamegraph artifacts, semantic phase summaries, and diffs.</>,
      ],
    },
    {
      title: 'Crates',
      bullets: [
        <><code>mobench</code>: CLI, BrowserStack client, CI and reporting entry points, and programmatic command types.</>,
        <><code>mobench-sdk</code>: timing harness, benchmark registry, generated runner support, mobile builders, profiling helpers, UniFFI, and native C ABI.</>,
        <><code>mobench-macros</code>: the <code>#[benchmark]</code> proc macro.</>,
      ],
    },
    {
      title: 'Artifact flow',
      body: [
        <>Runs produce normalized artifacts under <code>target/mobench/</code>. BrowserStack fetches also place raw provider artifacts under a BrowserStack output root. Profiling creates trace events and flamegraph-ready bundles.</>,
      ],
    },
  ],
  authoring: [
    {
      title: 'Macro shape',
      body: [
        <>Simple benchmark functions take no parameters, return <code>()</code>, and should use <code>std::hint::black_box</code> for values the optimizer might otherwise erase.</>,
      ],
      code: {
        language: 'rust',
        value: `use mobench_sdk::benchmark;

#[benchmark]
pub fn checksum_bench() {
    let data = [1u8; 1024];
    let sum: u64 = data.iter().map(|b| *b as u64).sum();
    std::hint::black_box(sum);
}`,
      },
    },
    {
      title: 'Discovery',
      bullets: [
        <>Benchmarks are registered at compile time through <code>inventory</code>.</>,
        <>Generated runners discover registered functions through SDK registry APIs.</>,
        <>Macro validation rejects unsupported signatures early, including parameters on simple benchmarks or non-unit returns.</>,
      ],
    },
    {
      title: 'Best practices',
      bullets: [
        <>Keep input generation outside measured work unless the input generation is itself what you are benchmarking.</>,
        <>Use per-iteration setup for mutable or consumed input.</>,
        <>Prefer stable iterations and warmup settings in config so CI reports are comparable.</>,
      ],
    },
  ],
  'setup-teardown': [
    {
      title: 'Setup modes',
      body: [
        <>Setup runs before measured samples and passes the setup value into the benchmark. Per-iteration setup runs before each measured iteration and is useful for mutable input.</>,
      ],
      code: {
        language: 'rust',
        value: `fn create_input() -> Vec<u8> {
    vec![42; 1024 * 1024]
}

#[benchmark(setup = create_input)]
pub fn process_data(data: &Vec<u8>) {
    std::hint::black_box(data.iter().sum::<u8>());
}

fn unsorted_vec() -> Vec<i32> {
    (0..1000).rev().collect()
}

#[benchmark(setup = unsorted_vec, per_iteration)]
pub fn sort_vec(mut data: Vec<i32>) {
    data.sort();
    std::hint::black_box(data);
}`,
      },
    },
    {
      title: 'Teardown',
      body: [
        <>Teardown receives setup state after measured execution and is intended for cleanup such as temporary files, handles, connections, or test data. Teardown itself is outside the measured sample.</>,
      ],
      code: {
        language: 'rust',
        value: `#[benchmark(setup = setup_temp_file, teardown = cleanup_temp_file)]
pub fn parse_file(input: &TempFile) {
    parse(input.path());
}`,
      },
    },
    {
      title: 'Compatibility',
      bullets: [
        <>Simple benchmarks keep their existing behavior.</>,
        <>Setup benchmarks accept one input compatible with the setup return type.</>,
        <>Native runner paths serialize specs and reports through the same public contracts.</>,
      ],
    },
  ],
  sdk: [
    {
      title: 'Dependencies',
      body: [
        <>Use the full SDK for normal benchmark crates. Runtime-only registry crates can use narrower feature flags.</>,
      ],
      code: {
        language: 'toml',
        value: `[dependencies]
mobench-sdk = "0.1.46"
inventory = "0.3"

# Narrow registry-only form:
mobench-sdk = { version = "0.1.46", default-features = false, features = ["registry"] }`,
      },
    },
    {
      title: 'Runtime APIs',
      bullets: [
        <><code>BenchSpec</code> names the benchmark and sets measured iterations and warmup iterations.</>,
        <><code>BenchSample</code> records wall-clock duration plus optional CPU and memory measurements.</>,
        <><code>BenchReport</code> contains samples, statistics helpers, semantic phases, and timeline spans.</>,
        <><code>Target</code>, <code>FfiBackend</code>, builders, and runner report types shape generated runner behavior.</>,
 ],
 },
 {
 title: 'Choosing an FFI backend',
 body: [
 <>If you need generated bindings, choose between <InlineLink href={EXTERNAL_DOCS.boltffi}>BoltFFI</InlineLink> and <InlineLink href={EXTERNAL_DOCS.uniffi}>UniFFI</InlineLink> based on maturity versus overhead.</>,
 <>The practical recommendation for performance-sensitive mobile benchmarks is still to write native FFI bindings for the benchmark boundary. AI agents make those bindings much easier to build, test, review, and maintain, and native bindings keep benchmark overhead explicit instead of hiding it inside a general-purpose binding layer.</>,
 ],
 bullets: [
 <><strong>BoltFFI</strong>: fast, newer, and designed for smaller overhead than UniFFI, but not as mature yet.</>,
 <><strong>UniFFI</strong>: more mature and battle-tested, but usually carries larger binding overhead.</>,
 <><strong>Native FFI</strong>: recommended for serious benchmark paths because Android/iOS callers can use the narrow ABI the benchmark actually needs.</>,
 <>In 0.1.46, <code>ci prepare --ffi-backend</code> accepts <code>uniffi</code>, <code>native-c-abi</code>, or <code>boltffi</code>. The CLI value wins over <code>project.ffi_backend</code> in <code>mobench.toml</code>; if neither is set, UniFFI remains the default.</>,
 <>Native C ABI and BoltFFI preparation skip the UniFFI generator. UniFFI preparation resolves its lockfile from the Cargo workspace containing the benchmark crate.</>,
 ],
 },
 {
 title: 'Native C ABI',
 body: [
        <>The native C ABI lets generated runners call the benchmark crate directly without UniFFI bindings in the measured path.</>,
      ],
      code: {
        language: 'rust',
        value: `mobench_sdk::export_native_c_abi!();

// Exports:
// mobench_run_benchmark_json(spec_ptr, spec_len, out) -> i32
// mobench_free_buf(buf)
// mobench_last_error_message() -> *const c_char`,
      },
    },
  ],
  build: [
    {
      title: 'Prerequisites',
      bullets: [
        <>Android: install SDK tooling, make ADB available, and create emulator profiles in Android Studio when simulator-style local runs are needed.</>,
        <>iOS: install Xcode command-line tools and use Xcode to manage simulators, signing, and connected devices.</>,
        <>Run <code>mobench check</code> for target-specific diagnostics before build commands.</>,
      ],
    },
    {
      title: 'Build commands',
      code: {
        language: 'bash',
        value: `mobench check --target android
mobench check --target ios
mobench build --target android --progress
mobench build --target ios --progress
mobench build --target both --release`,
      },
    },
    {
      title: 'Outputs',
      bullets: [
        <>Android builds produce generated projects, APK or test APK artifacts, native libraries, and runner metadata.</>,
        <>iOS builds produce generated Xcode projects, simulator and device slices, test bundles, and runner metadata.</>,
        <>Outputs default to <code>target/mobench/</code>; release builds are smaller and better suited for uploads.</>,
      ],
    },
  ],
  'local-devices': [
    {
      title: 'Android',
      bullets: [
        <>Use physical phones through ADB when you need device-specific CPU, memory, thermal, or ABI behavior.</>,
        <>Use Android Studio emulators for fast local iteration, SDK compatibility checks, and repeatable development smoke runs.</>,
        <>ADB is the local control layer for listing devices, installing generated APKs, and running generated Android test harnesses.</>,
      ],
      code: {
        language: 'bash',
        value: `adb devices
mobench build --target android
mobench run --target android --local --function my_crate::checksum_bench`,
      },
    },
    {
      title: 'iOS',
      bullets: [
        <>Use Xcode simulators for local iteration without requiring a physical iPhone.</>,
        <>Use connected iOS devices when hardware behavior, signing, device OS version, or performance fidelity matters.</>,
 <>Xcode owns simulator runtimes, device trust, signing, <BrandLink href={EXTERNAL_DOCS.xctest} logo="ios">XCUITest</BrandLink> execution generated iOS harnesses.</>,
      ],
    },
    {
      title: 'Host-only smoke runs',
      body: [
        <>Host-only runs are useful for verifying benchmark discovery and report wiring without building mobile artifacts. They are not a replacement for measuring mobile FFI and scheduler behavior.</>,
      ],
      code: {
        language: 'bash',
        value: `mobench run \\
  --target android \\
  --function my_bench_crate::checksum_bench \\
  --local-only \\
  --iterations 100 \\
  --warmup 10`,
      },
    },
  ],
  browserstack: [
  {
    title: 'Credentials',
    body: [
      <><BrandLink href={EXTERNAL_DOCS.browserstack} logo="browserstack">BrowserStack</BrandLink> credentials can come from environment variables or local configuration. For mobench CI, they enable <BrandLink href={EXTERNAL_DOCS.appAutomate} logo="browserstack">App Automate</BrandLink> hosted real-device runs. Keep credentials out of committed files.</>,
    ],
    code: {
      language: 'bash',
      value: `export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
export BROWSERSTACK_PROJECT="mobile-benchmarks"`,
    },
  },
  {
    title: 'Secure reusable workflow (0.1.44–0.1.46)',
    body: [
      <>The 0.1.44 workflow split pull-request execution into secretless preparation, trusted prebuilt-only BrowserStack execution, and isolated reporting. Untrusted PR code never runs with BrowserStack credentials or a write-capable repository token.</>,
    ],
    bullets: [
      <>Version 0.1.45 added a repository-relative <code>prepare_script</code>, platform-specific <code>functions_ios</code> and <code>functions_android</code>, and structured device arrays. The prepare hook runs with <code>MOBENCH_CI_PREPARE=1</code> only in the secretless job.</>,
      <>Version 0.1.46 added <code>rust_toolchain</code> (default <code>stable</code>) and typed <code>ffi_backend</code> selection. Caller targets are installed only for the requested toolchain in secretless preparation; the trusted control plane stays independently pinned.</>,
      <>Every requested function/device pair must produce exactly one result. Missing, unexpected, ambiguous, or duplicate shards fail closed after diagnostic artifacts are collected.</>,
      <>Pin the workflow to its immutable revision, pass BrowserStack secrets explicitly, and never use <code>secrets: inherit</code>.</>,
    ],
    code: {
      language: 'yaml',
      value: `jobs:
  mobench:
    uses: worldcoin/mobile-bench-rs/.github/workflows/reusable-bench.yml@1ac54adaf2bd97c6ca303705e1e0471257716f48
    with:
      pr_number: \${{ github.event.pull_request.number }}
      head_sha: \${{ github.event.pull_request.head.sha }}
      crate_path: crates/benchmarks
      functions: '["benchmarks::critical_path"]'
      functions_ios: '["benchmarks::ios_critical_path"]'
      prepare_script: .github/scripts/prepare-mobench.sh
      rust_toolchain: nightly-2026-03-04
      ffi_backend: native-c-abi
      android_devices: '[{"device":"Google Pixel 7","os_version":"13.0"}]'
      platform: both
    secrets:
      BROWSERSTACK_USERNAME: \${{ secrets.BROWSERSTACK_USERNAME }}
      BROWSERSTACK_ACCESS_KEY: \${{ secrets.BROWSERSTACK_ACCESS_KEY }}`,
    },
  },
  {
    title: 'Device resolution',
    bullets: [
      <>Use explicit <BrandLink href="https://www.browserstack.com/list-of-browsers-and-platforms/app_automate" logo="browserstack">BrowserStack App Automate devices</BrandLink> for one-off runs.</>,
      <>Use matrix files and tags when CI jobs need stable cross-device coverage.</>,
      <>Resolution commands help validate BrowserStack availability before running expensive hosted-device jobs.</>,
    ],
    code: {
      language: 'bash',
      value: `mobench devices --platform android
mobench devices resolve --platform android --device-matrix .github/mobench-devices.yml
mobench ci run --target android --device-matrix .github/mobench-devices.yml --fetch`,
    },
  },
  {
    title: 'CI contract',
    bullets: [
      <>CI runs write <code>summary.json</code>, <code>summary.md</code>, and <code>results.csv</code>.</>,
      <>PR reporting can post sticky summaries and compare baselines.</>,
      <>Fetch commands retrieve raw BrowserStack artifacts after hosted runs.</>,
      <>Use <BrandLink href={EXTERNAL_DOCS.appAutomateApi} logo="browserstack">App Automate REST API docs</BrandLink> when wiring custom artifact fetchers or provider debugging.</>,
    ],
  },
  {
    title: 'Split-sample merge',
    body: [
      <>For long or fragile BrowserStack lanes, run each measured sample as a separate <code>ci run</code> job, store the outputs as <code>sample-*/summary.json</code>, then merge them back into the standard CI contract.</>,
    ],
    bullets: [
      <>Every input must contain exactly one device, one benchmark, and one measured sample.</>,
      <>The command validates the requested function, device, target consistency, and exact measured sample count.</>,
      <>Merged timing statistics, raw <code>samples_ns</code>, and resource columns are recomputed for downstream reports, plots, comparisons, and PR comments.</>,
    ],
    code: {
      language: 'bash',
      value: `mobench ci merge-split-runs \\
  --samples-dir target/mobench/ci/android/sample_fns__fibonacci/device/split \\
  --output-dir target/mobench/ci/android/sample_fns__fibonacci/device \\
  --function sample_fns::fibonacci \\
  --device "Google Pixel 7-13.0" \\
  --iterations 5 \\
  --warmup 1`,
    },
  },
],
'app-automate': [
  {
    title: 'Account and pricing',
    body: [
 <><BrandLink href={EXTERNAL_DOCS.appAutomate} logo="browserstack">BrowserStack App Automate</BrandLink> is hosted real-device automation product mobench uses generated <BrandLink href={EXTERNAL_DOCS.android} logo="android">Android</BrandLink> <BrandLink href={EXTERNAL_DOCS.espresso} logo="android">Espresso</BrandLink> and <BrandLink href={EXTERNAL_DOCS.ios} logo="ios">iOS</BrandLink> <BrandLink href={EXTERNAL_DOCS.xctest} logo="ios">XCUITest</BrandLink> harnesses instead local devices.</>,
      <>Create a BrowserStack account, then copy username and access key into CI secrets or local environment variables. Pricing and trial limits change over time, so use BrowserStack's own product and pricing pages as the source of truth.</>,
    ],
    bullets: [
      <>Product page: <BrandLink href={EXTERNAL_DOCS.appAutomate} logo="browserstack">BrowserStack App Automate</BrandLink>.</>,
      <>Pricing page: <BrandLink href="https://www.browserstack.com/pricing" logo="browserstack">BrowserStack pricing</BrandLink>.</>,
      <>Trial FAQ: <BrandLink href="https://www.browserstack.com/support/faq/plans-pricing/plans/what-do-i-get-with-a-free-trial" logo="browserstack">trial entitlements</BrandLink>.</>,
    ],
    code: {
      language: 'bash',
      value: `export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
export BROWSERSTACK_PROJECT="mobench"`,
    },
  },
  {
    title: 'Espresso on Android',
    body: [
 <><BrandLink href={EXTERNAL_DOCS.espresso} logo="android">Espresso</BrandLink> is Google's <BrandLink href={EXTERNAL_DOCS.android} logo="android">Android</BrandLink> UI testing framework. In mobench, generated Android runner packaged application under test plus Android instrumentation test APK. <BrandLink href={EXTERNAL_DOCS.appAutomateEspresso} logo="browserstack">BrowserStack Espresso App Automate</BrandLink> receives both files, runs suite on real Android devices, exposes status, logs, video, device logs, artifacts through App Automate dashboard API.</>,
    ],
    bullets: [
      <>Upload app as <code>.apk</code> or <code>.aab</code> to <code>POST /app-automate/espresso/v2/app</code>.</>,
      <>Upload Espresso test suite APK to <code>POST /app-automate/espresso/v2/test-suite</code>.</>,
      <>Start execution with <code>POST /app-automate/espresso/v2/build</code>, passing <code>app</code>, <code>testSuite</code>, and Android devices.</>,
    ],
    code: {
      language: 'bash',
      value: `# Upload Android app
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/espresso/v2/app" \\
  -F "file=@target/mobench/android/app-release.apk" \\
  -F "custom_id=mobench-android-app"

# Upload Espresso test APK
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/espresso/v2/test-suite" \\
  -F "file=@target/mobench/android/app-release-androidTest.apk" \\
  -F "custom_id=mobench-android-tests"

# Start an Espresso build
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/espresso/v2/build" \\
  -H "Content-Type: application/json" \\
  -d '{"app":"mobench-android-app","testSuite":"mobench-android-tests","project":"mobench","devices":["Google Pixel 7-13.0"]}'`,
    },
  },
  {
    title: 'XCUITest on iOS',
    body: [
 <><BrandLink href={EXTERNAL_DOCS.xctest} logo="ios">XCUITest</BrandLink> is Apple's UI testing framework for <BrandLink href={EXTERNAL_DOCS.ios} logo="ios">iOS</BrandLink> apps built with <BrandLink href={EXTERNAL_DOCS.xcode} logo="xcode">Xcode</BrandLink>. In mobench, generated iOS runner is built into installable app XCUITest bundle archive. <BrandLink href={EXTERNAL_DOCS.appAutomateXcuitest} logo="browserstack">BrowserStack XCUITest App Automate</BrandLink> runs suite on real iOS devices returns build IDs plus per-session logs media.</>,
    ],
    bullets: [
      <>Upload iOS app as an <code>.ipa</code> to <code>POST /app-automate/xcuitest/v2/app</code>.</>,
      <>Upload XCUITest suite as <code>.zip</code> to <code>POST /app-automate/xcuitest/v2/test-suite</code>.</>,
      <>Start execution with <code>POST /app-automate/xcuitest/v2/build</code>, passing <code>app</code>, <code>testSuite</code>, and iOS devices.</>,
    ],
    code: {
      language: 'bash',
      value: `# Upload iOS app
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/xcuitest/v2/app" \\
  -F "file=@target/mobench/ios/MobenchRunner.ipa" \\
  -F "custom_id=mobench-ios-app"

# Upload XCUITest bundle
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/xcuitest/v2/test-suite" \\
  -F "file=@target/mobench/ios/MobenchRunnerUITests.zip" \\
  -F "custom_id=mobench-ios-tests"

# Start an XCUITest build
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X POST "https://api-cloud.browserstack.com/app-automate/xcuitest/v2/build" \\
  -H "Content-Type: application/json" \\
  -d '{"app":"mobench-ios-app","testSuite":"mobench-ios-tests","project":"mobench","devices":["iPhone 14-16"]}'`,
    },
  },
  {
    title: 'API lifecycle',
    body: [
      <>The <BrandLink href={EXTERNAL_DOCS.appAutomateApi} logo="browserstack">App Automate REST API</BrandLink> uses JSON over the base URL <code>https://api-cloud.browserstack.com/</code>. The usual CI lifecycle uploads app and test-suite artifacts, creates a build, polls build or session status, fetches logs and media, then normalizes results into mobench summaries.</>,
    ],
    bullets: [
      <>Authentication uses BrowserStack username and access key over basic auth.</>,
      <>Uploads return <code>bs://...</code> URLs and optional <code>custom_id</code> aliases. Use custom IDs in CI when scripts should refer to the latest uploaded app or test suite without rewriting every build request.</>,
      <>A build represents execution of a framework-specific test suite on one or more devices; BrowserStack returns <code>build_id</code> for status and artifact lookup.</>,
      <>CI should avoid upload loops and respect BrowserStack API limits.</>,
    ],
    code: {
      language: 'bash',
      value: `curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X GET "https://api-cloud.browserstack.com/app-automate/devices.json"

curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X GET "https://api-cloud.browserstack.com/app-automate/espresso/v2/builds"

curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \\
  -X GET "https://api-cloud.browserstack.com/app-automate/xcuitest/v2/builds"`,
    },
  },
  {
    title: 'Devices',
    body: [
      <>BrowserStack App Automate runs on physical devices hosted by BrowserStack, not emulators or simulators. Pick exact names and OS versions from <BrandLink href="https://www.browserstack.com/list-of-browsers-and-platforms/app_automate" logo="browserstack">BrowserStack App Automate devices</BrandLink>, then keep CI matrices small enough for your plan's parallel capacity.</>,
    ],
    bullets: [
      <>Use <code>GET /app-automate/devices.json</code> when generating or validating mobench device matrices.</>,
      <>The device API response includes OS, OS version, device name, real-device flag, tier, and limit fields.</>,
    ],
  },
],
profiling: [
  {
    title: 'Capability matrix',
    bullets: [
      <>Local native profiling is the supported path for native stack capture and flamegraph-style artifacts.</>,
      <>BrowserStack benchmark runs can still report timing and resource metrics, but native stack capture and flamegraph generation are local capabilities.</>,
      <>Profile commands use the same target, device, matrix, and function concepts as benchmark runs.</>,
    ],
  },
  {
    title: 'Artifacts',
    body: [
      <>Each profiling session writes a run-specific directory under <code>target/mobench/profile/&lt;run-id&gt;/</code> and refreshes convenience copies under <code>target/mobench/profile/</code>.</>,
    ],
    bullets: [
      <><code>profile.json</code>: normalized manifest with capture metadata, native capture records, semantic phases, and viewer hints.</>,
      <><code>summary.md</code>: human-readable profile summary.</>,
      <><code>artifacts/processed/stacks.folded</code>: folded stack input used for flamegraph rendering.</>,
      <><code>artifacts/processed/native-report.txt</code>: backend-specific native profiling report.</>,
      <><code>artifacts/processed/flamegraph.full.svg</code>: full-process static flamegraph.</>,
      <><code>artifacts/processed/flamegraph.focused.svg</code>: benchmark-focused static flamegraph.</>,
      <><code>artifacts/processed/flamegraph.html</code>: interactive viewer with mode switching, timeline, search, selection, and legend controls.</>,
      <><code>artifacts/semantic/phases.json</code>: semantic phase data when benchmarks emit phase markers.</>,
    ],
    code: {
      language: 'bash',
      value: `mobench profile run \\
  --target android \\
  --function sample_fns::fibonacci \\
  --provider local \\
  --backend android-native \\
  --trace-events-output target/mobench/profile/trace-events.json

mobench profile summarize \\
  --profile target/mobench/profile/profile.json

mobench profile diff \\
  --baseline target/mobench/profile/baseline/profile.json \\
  --candidate target/mobench/profile/candidate/profile.json \\
  --normalize`,
    },
  },
  {
    title: 'Flamegraph viewer',
    body: [
      <>Open <code>artifacts/processed/flamegraph.html</code> after <code>profile run</code> or <code>profile diff</code> to inspect the interactive flamegraph. The viewer combines the full-process stack view, a benchmark-focused view, optional harness timeline spans, source-link metadata when symbolization can recover it, and a right-side self-time frame list.</>,
      <>For differential profiles, red means a frame is hotter in the candidate profile and blue means it is hotter in the baseline. Frame widths follow candidate sample counts, so the widest red frames are usually the first places to inspect.</>,
    ],
    bullets: [
      <><strong>Benchmark Only</strong>: focus the flamegraph on frames below mobench benchmark anchors, hiding unrelated process/runtime work.</>,
      <><strong>Full Process</strong>: show all sampled stacks captured by the backend, useful for spotting runtime, FFI, allocator, or harness overhead.</>,
      <><strong>Timeline</strong>: show chronological harness spans such as warmup, measured benchmark iterations, teardown, and exact harness duration.</>,
      <><strong>Back</strong>, <strong>Forward</strong>, and <strong>Reset</strong>: navigate zoom history and return to the full root.</>,
      <><strong>Fullscreen</strong>: expand the viewer when frame labels or deep stacks need more room.</>,
      <><strong>Legend</strong>: explain color semantics, differential heat, and sample-width meaning.</>,
      <><strong>Search</strong>: find frames by function/module text, then zoom or inspect matching stacks.</>,
      <><strong>Self time</strong>: use the right rail to inspect the highest self-sample frames; click a frame in the graph to update selection details.</>,
    ],
 image: {
 src: '/assets/flamegraph-viewer.png',
 alt: 'Screenshot of the mobench flamegraph viewer showing benchmark-only and full-process modes, timeline spans, search controls, and the self-time frame list.',
 caption: 'The generated flamegraph viewer lets you switch between benchmark-only and full-process views, inspect timeline spans, search stack frames, and use the self-time rail to find hot functions.',
 },
    code: {
      language: 'bash',
      value: `# Open the latest interactive viewer after profile run.
open target/mobench/profile/artifacts/processed/flamegraph.html

# Open a specific run's viewer.
open target/mobench/profile/<run-id>/artifacts/processed/flamegraph.html

# Open a differential viewer after profile diff.
open target/mobench/profile/diff/artifacts/processed/flamegraph.html`,
    },
  },
  {
    title: 'Phases',
    body: [
      <>Semantic phases label meaningful periods inside benchmark execution so trace-event summaries and the viewer timeline can distinguish setup, warmup, measured iterations, teardown, and runner overhead.</>,
    ],
    code: {
      language: 'rust',
      value: `use mobench_sdk::{benchmark, profile_phase};

#[benchmark]
pub fn prove_and_verify() {
    let proof = profile_phase("prove", || prove());
    profile_phase("verify", || verify(&proof));
}`,
    },
  },
],
  reports: [
    {
      title: 'Output layout',
      bullets: [
        <><code>summary.json</code>: normalized machine-readable summary.</>,
        <><code>summary.md</code>: human-readable run summary for CI and PR comments.</>,
        <><code>results.csv</code>: rows for spreadsheet and dashboard ingestion.</>,
        <>Optional plot SVGs and profiling bundles live beside run outputs when requested.</>,
      ],
    },
    {
      title: 'Split-run outputs',
      bullets: [
        <>Mobench can merge <code>sample-*/summary.json</code> inputs from one-sample CI jobs into the same <code>summary.json</code>, <code>summary.md</code>, and <code>results.csv</code> contract.</>,
        <>The merged JSON preserves raw samples, recomputes min, max, mean, median, and p95 timing statistics, and combines available resource measurements.</>,
        <>Existing report, plot, comparison, and PR-comment tooling can consume merged output without a separate format adapter.</>,
      ],
    },
    {
      title: 'Report helpers',
      code: {
        language: 'bash',
        value: `mobench summary target/mobench/results.json
mobench summary --format json target/mobench/results.json
mobench summary --format csv target/mobench/results.json
mobench report summarize --summary target/mobench/ci/summary.json
mobench report github --pr 123 --summary target/mobench/ci/summary.json`,
      },
    },
    {
      title: 'Fixtures',
      body: [
        <>The repository examples include basic, FFI, and profiling fixtures so downstream tooling can validate summary and trace-event parsing without running device jobs.</>,
      ],
    },
  ],
  'cli-reference': [
    {
      title: 'Command model',
      body: [
        <>Install with <code>cargo install mobench</code>, then invoke the canonical <code>mobench</code> executable directly. Release 0.1.46 does not install a <code>cargo-mobench</code> binary, so <code>cargo mobench</code> is not a supported command form.</>,
        <>Commands share the same global flags and most commands resolve project layout from explicit flags, config files, Cargo metadata, or workspace defaults.</>,
      ],
      bullets: [
        <><code>--dry-run</code>: print the actions that would run without mutating files, invoking providers, or publishing reports.</>,
        <><code>-v</code> / <code>--verbose</code>: print verbose command output and invoked tool commands.</>,
        <><code>--yes</code>: assume yes for overwrite prompts.</>,
        <><code>--non-interactive</code>: disable prompts and fail instead of asking.</>,
        <>Common targets: <code>android</code>, <code>ios</code>, or <code>both</code> where supported. BrowserStack run targets use <code>android</code> or <code>ios</code>.</>,
        <>Common output formats: <code>text</code>, <code>json</code>, <code>csv</code>, <code>table</code>, <code>markdown</code>, depending on command.</>,
      ],
      code: {
        language: 'text',
        value: `mobench [GLOBAL OPTIONS] <COMMAND>

Global options:
  --dry-run            Print what would be done without doing it.
  -v, --verbose        Print verbose command/tool output.
  --yes               Assume yes for overwrite prompts.
  --non-interactive   Disable prompts and fail instead.
  -h, --help          Print command help.
  -V, --version       Print version.

Top-level commands:
  run, init, plan, config, doctor, ci, fetch, compare, init-sdk, build,
  package-ipa, package-xcuitest, list, verify, summary, devices, fixture,
  report, profile, check`,
      },
    },
    {
      title: 'Benchmark runs',
      body: [
        <>Use <code>run</code> for a one-off benchmark execution and <code>ci run</code> for the stable CI contract. Both can build mobile artifacts, run host-only smoke tests, target BrowserStack devices, fetch artifacts, compare baselines, and write machine-readable outputs.</>,
      ],
      code: {
        language: 'text',
        value: `mobench run
Purpose:
  Build, package, execute, and optionally fetch benchmark results for a single run.

Usage:
  mobench run [OPTIONS]

Inputs and flags:
  --target <android|ios>                 Platform to run.
  --function <PATH>                      Fully-qualified Rust benchmark function.
  --project-root <DIR>                   Root containing mobench.toml or Cargo workspace.
  --crate-path <DIR>                     Benchmark crate containing Cargo.toml.
  --iterations <N>                       Measured iterations. Default: command/config dependent.
  --warmup <N>                           Warmup iterations. Default: command/config dependent.
  --devices <DEVICE>                     BrowserStack device label; repeatable.
  --device-matrix <FILE>                 YAML device matrix.
  --device-tags <TAG[,TAG...]>           Device matrix tags; repeatable.
  --config <FILE>                        Run config file.
  --output <FILE>                        JSON report path.
  --summary-csv                          Write CSV summary beside JSON.
  --ci                                   Enable CI behavior: summaries, JUnit, regression exits.
  --baseline <path|url|artifact:path>    Baseline summary source.
  --regression-threshold-pct <PCT>       Regression threshold. Default: 5.
  --junit <FILE>                         JUnit XML output path.
  --local-only                           Skip mobile builds and run host harness only.
  --release                              Release mobile build; recommended for BrowserStack.
  --ios-app <FILE>                       Existing .ipa or zipped .app for BrowserStack XCUITest.
  --ios-test-suite <FILE>                Existing XCUITest .zip or .ipa.
  --ios-deployment-target <VERSION>      Generated iOS app/test deployment target.
  --ios-runner <swiftui|uikit-legacy>    Generated iOS runner template.
  --android-benchmark-timeout-secs <N>   Android harness watchdog timeout.
  --android-heartbeat-interval-secs <N>  Android harness heartbeat interval.
  --fetch                                Fetch BrowserStack artifacts after run.
  --fetch-output-dir <DIR>               Default: target/browserstack.
  --fetch-poll-interval-secs <N>         Default: 5.
  --fetch-timeout-secs <N>               Default: 300.
  --progress                             Simplified step-by-step progress.

Outputs:
  JSON report at --output when provided.
  Optional CSV when --summary-csv is set.
  Optional JUnit XML when --junit is set.
  BrowserStack raw artifacts under --fetch-output-dir when --fetch is set.
  Provider logs, status, and normalized benchmark summaries.

Examples:
  mobench run --target android --function sample_fns::fibonacci --local-only
  mobench run --target android --function sample_fns::fibonacci --devices "Google Pixel 7-13.0" --release --fetch

mobench ci run
Purpose:
  Run the stable CI contract for one or more benchmark functions.

Usage:
  mobench ci run --target <android|ios|both> [OPTIONS]

Additional CI flags:
  --functions <A,B>                      Multiple benchmark functions; comma-separated.
  --output-dir <DIR>                     CI contract output directory. Default: target/mobench/ci.
  --requested-by <USER>                  Metadata: actor/user that requested run.
  --pr-number <N>                        Metadata: pull request number.
  --request-command <COMMAND>            Metadata: original command.
  --mobench-ref <REF>                    Metadata: mobench git ref/sha.
  --plots <auto|off|require>             Plot behavior. Default: auto.

Outputs:
  target/mobench/ci/summary.json         Machine-readable CI summary.
  target/mobench/ci/summary.md           Markdown summary for logs or PR comments.
  target/mobench/ci/results.csv          Tabular result rows.
  Optional JUnit XML, plots, fetched BrowserStack artifacts.

Examples:
  mobench ci run --target android --function sample_fns::fibonacci --local-only
  mobench ci run --target both --functions sample_fns::fibonacci,sample_fns::sort --device-tags smoke --release --fetch`,
      },
    },
    {
      title: 'Build and project setup',
      body: [
        <>These commands create config files, project templates, generated mobile runners, packaging artifacts, and validation reports before a benchmark run.</>,
      ],
      code: {
        language: 'text',
        value: `mobench init
Purpose:
  Scaffold a base run config.
Usage:
  mobench init [--output <FILE>] [--target <android|ios>]
Defaults:
  --output bench-config.toml
  --target android
Outputs:
  A TOML config file suitable for run/ci workflows.

mobench plan
Purpose:
  Generate a sample BrowserStack device matrix.
Usage:
  mobench plan [--output <FILE>]
Default:
  --output device-matrix.yaml
Outputs:
  YAML device matrix with platform/profile entries.

mobench init-sdk
Purpose:
  Generate an SDK benchmark project template.
Usage:
  mobench init-sdk --target <android|ios|both> [--project-name <NAME>] [--output-dir <DIR>] [--examples]
Defaults:
  --project-name bench-project
  --output-dir .
Outputs:
  Cargo project files, mobile integration scaffolding, optional example benchmarks.

mobench build
Purpose:
  Build generated Android/iOS benchmark artifacts from a resolved benchmark crate.
Usage:
  mobench build --target <android|ios|both> [OPTIONS]
Flags:
  --release                              Release build.
  --project-root <DIR>                   Root containing mobench.toml or Cargo workspace.
  --output-dir <DIR>                     Default: target/mobench.
  --crate-path <DIR>                     Benchmark crate; default auto-detects bench-mobile/ or crates/{crate}.
  --ios-deployment-target <VERSION>      Generated iOS deployment target.
  --ios-runner <swiftui|uikit-legacy>    Generated iOS runner template.
  --progress                             Simplified progress output.
Outputs:
  Android Gradle runner, APK/test APKs, native libs, bench_spec.json.
  iOS Xcode runner, xcframework/native libs, app/test artifacts.

mobench package-ipa
Purpose:
  Package generated iOS app as an IPA for distribution testing or BrowserStack.
Usage:
  mobench package-ipa [--scheme <SCHEME>] [--method <adhoc|development>] [--project-root <DIR>] [--crate-path <DIR>] [--output-dir <DIR>]
Defaults:
  --scheme BenchRunner
  --method adhoc
  --output-dir target/mobench
Outputs:
  IPA or zipped app artifact under the iOS output directory.

mobench package-xcuitest
Purpose:
  Package generated XCUITest runner for BrowserStack upload.
Usage:
  mobench package-xcuitest [--scheme <SCHEME>] [--project-root <DIR>] [--crate-path <DIR>] [--output-dir <DIR>]
Defaults:
  --scheme BenchRunner
  --output-dir target/mobench
Outputs:
  target/mobench/ios/BenchRunnerUITests.zip by default.

mobench check
Purpose:
  Validate prerequisites before mobile builds.
Usage:
  mobench check --target <android|ios|both> [--format <text|json>]
Checks:
  Android: ANDROID_NDK_HOME, cargo-ndk, Android Rust targets.
  iOS: Xcode, xcodegen, iOS Rust targets.
  Both: cargo, rustup.
Outputs:
  Text diagnostics or JSON diagnostics.

mobench doctor
Purpose:
  Validate local and CI configuration, including optional BrowserStack credentials.
Usage:
  mobench doctor [--target <android|ios|both>] [--config <FILE>] [--device-matrix <FILE>] [--device-tags <TAG[,TAG...]>] [--browserstack [true|false]] [--format <text|json>]
Defaults:
  --target both
  --browserstack true
  --format text
Outputs:
  Human-readable or JSON preflight diagnostics.`,
      },
    },
    {
      title: 'CI commands',
      body: [
        <>CI helpers scaffold workflows, prepare untrusted mobile packages, execute verified prebuilt bundles, summarize offline results, and create GitHub Check Runs. Use <code>ci run</code> for a conventional benchmark job; use <code>ci prepare</code> and <code>ci run-prebuilt</code> to preserve the pull-request credential boundary.</>,
      ],
      code: {
        language: 'text',
        value: `mobench ci init
Purpose:
  Generate a GitHub Actions workflow and local action wrapper.
Usage:
  mobench ci init [--workflow <FILE>] [--action-dir <DIR>]
Defaults:
  --workflow .github/workflows/mobile-bench.yml
  --action-dir .github/actions/mobench
Outputs:
  Workflow YAML and local composite/action files.

mobench ci prepare
Purpose:
  Build and package caller-owned code without BrowserStack credentials.
Usage:
  mobench ci prepare --target <android|ios> --source-sha <SHA> [--ffi-backend <uniffi|native-c-abi|boltffi>] [--crate-path <DIR>] [--functions <JSON>] [--release] [--output-dir <DIR>] [--manifest <FILE>]
Defaults:
  --ffi-backend resolves from mobench.toml, then defaults to uniffi.
  --output-dir target/mobench/prebuilt
  --manifest target/mobench/prebuilt/manifest.json
Outputs:
  A manifest and enumerated prebuilt mobile packages for trusted validation.

mobench ci run-prebuilt
Purpose:
  Upload and run a validated prebuilt bundle without invoking caller build tooling.
Usage:
  mobench ci run-prebuilt --manifest <FILE> --expected-source-sha <SHA> --expected-platform <android|ios> --expected-functions <JSON> --devices <DEVICE> --output-dir <DIR>
Security:
  Run only after validating manifest paths, sizes, digests, platform, source SHA, functions, iterations, and warmup.

mobench ci summarize
Purpose:
  Summarize benchmark results and optional BrowserStack metrics.
Usage:
  mobench ci summarize [--build-id <ID>] [--results-dir <DIR>] [--output-format <table|markdown|json>] [--output-file <FILE>] [--platform <android|ios>]
Defaults:
  --output-format table
Inputs:
  --results-dir should contain summary.json/CSV results.
  --build-id enriches with BrowserStack device metrics when paired with --results-dir.
Outputs:
  Terminal table, Markdown, or JSON summary; optional output file.

mobench ci merge-split-runs
Purpose:
  Merge one-measured-sample CI summaries into the standard CI output contract.
Usage:
  mobench ci merge-split-runs --samples-dir <DIR> --output-dir <DIR> --function <PATH> --device <LABEL> --iterations <N> [--warmup <N>]
Defaults:
  --warmup 0
Inputs:
  sample-*/summary.json files containing one device, one benchmark, and one measured sample each.
Outputs:
  <output-dir>/summary.json, <output-dir>/summary.md, and <output-dir>/results.csv.
Example:
  mobench ci merge-split-runs --samples-dir target/mobench/ci/split --output-dir target/mobench/ci/merged --function sample_fns::fibonacci --device "Google Pixel 7-13.0" --iterations 5 --warmup 1

mobench ci check-run
Purpose:
  Create a GitHub Check Run from benchmark results.
Usage:
  mobench ci check-run (--results <FILE> | --results-dir <DIR>) --repo <OWNER/REPO> --sha <SHA> --token <TOKEN> [OPTIONS]
Flags:
  --name <NAME>                          Check Run display name. Default: Mobench.
  --baseline <FILE>                      Optional baseline summary for regression detection.
  --regression-threshold-pct <PCT>       Regression threshold. Default: 5.
  --annotation-path <PATH>               Annotation path. Default: src/lib.rs.
Inputs:
  summary.json files from mobench run/ci run.
Outputs:
  GitHub Check Run with conclusion, summary, and annotations.`,
      },
    },
    {
      title: 'Device and config helpers',
      body: [
        <>These commands inspect BrowserStack devices, resolve deterministic device profiles, validate configuration files, list benchmark functions, verify fixtures, and compare summaries.</>,
      ],
      code: {
        language: 'text',
        value: `mobench config validate
Purpose:
  Validate bench-config.toml and referenced matrix/settings.
Usage:
  mobench config validate [--config <FILE>] [--format <text|json>]
Defaults:
  --config bench-config.toml
  --format text
Outputs:
  Config validation diagnostics.

mobench devices
Purpose:
  List or validate BrowserStack App Automate devices.
Usage:
  mobench devices [--platform <android|ios>] [--json] [--validate <DEVICE>]...
Inputs:
  BrowserStack credentials from environment/config.
Outputs:
  Device list in text or JSON, plus validation status for requested device specs.

mobench devices resolve
Purpose:
  Resolve devices from config/device matrix deterministically for CI.
Usage:
  mobench devices resolve --platform <android|ios> [--profile <PROFILE>] [--config <FILE>] [--device-matrix <FILE>] [--format <text|json>]
Inputs:
  Device matrix YAML and optional profile/tag.
Outputs:
  Resolved device names for run/ci run.

mobench list
Purpose:
  List discovered benchmark functions.
Usage:
  mobench list [--project-root <DIR>] [--crate-path <DIR>]
Outputs:
  Fully-qualified benchmark function names discovered through the registry.

mobench verify
Purpose:
  Verify registry, spec, artifacts, and optional smoke test.
Usage:
  mobench verify [--project-root <DIR>] [--crate-path <DIR>] [--target <android|ios|both>] [--spec-path <FILE>] [--check-artifacts] [--smoke-test] [--function <PATH>] [--output-dir <DIR>]
Outputs:
  Validation result for benchmark registration, bench_spec.json, generated artifacts, and host smoke execution.

mobench compare
Purpose:
  Compare two JSON summaries for regressions.
Usage:
  mobench compare --baseline <FILE> --candidate <FILE> [--output <FILE>]
Outputs:
  Terminal comparison and optional Markdown report.

mobench fetch
Purpose:
  Fetch BrowserStack build/session artifacts after a run.
Usage:
  mobench fetch --target <android|ios> --build-id <ID> [--output-dir <DIR>] [--wait] [--poll-interval-secs <N>] [--timeout-secs <N>]
Defaults:
  --output-dir target/browserstack
  --poll-interval-secs 10
  --timeout-secs 1800
Outputs:
  Build/session JSON, device logs, instrumentation logs, videos or video URLs, and other safe BrowserStack artifacts.`,
      },
    },
    {
      title: 'Fixture helpers',
      body: [
        <>Fixture commands support reproducible CI examples and checked-in contract validation.</>,
      ],
      code: {
        language: 'text',
        value: `mobench fixture init
Purpose:
  Create starter fixture files for CI runs.
Usage:
  mobench fixture init [--config <FILE>] [--device-matrix <FILE>] [--force]
Defaults:
  --config bench-config.toml
  --device-matrix device-matrix.yaml
Outputs:
  Starter config and matrix fixtures. --force overwrites existing files.

mobench fixture build
Purpose:
  Build fixture artifacts using existing build commands.
Usage:
  mobench fixture build [--target <android|ios|both>] [--release] [--output-dir <DIR>] [--crate-path <DIR>] [--progress]
Default:
  --target both
Outputs:
  Generated mobile fixture artifacts under output directory.

mobench fixture verify
Purpose:
  Verify fixture files and optional profile filtering.
Usage:
  mobench fixture verify [--config <FILE>] [--device-matrix <FILE>] [--target <android|ios|both>] [--profile <PROFILE>] [--format <text|json>]
Defaults:
  --config bench-config.toml
  --target both
  --format text
Outputs:
  Fixture validation diagnostics.

mobench fixture verify-plots
Purpose:
  Render and verify checked-in plot fixtures.
Usage:
  mobench fixture verify-plots <basic|ffi> [--output-dir <DIR>]
Outputs:
  Rendered plot artifacts under target/mobench/plot-fixtures by default.

mobench fixture cache-key
Purpose:
  Compute deterministic fixture cache key from config/toolchain inputs.
Usage:
  mobench fixture cache-key [--config <FILE>] [--device-matrix <FILE>] [--target <android|ios|both>] [--profile <PROFILE>] [--format <text|json>]
Defaults:
  --config bench-config.toml
  --target both
  --format text
Outputs:
  Cache key text or JSON for CI caches.`,
      },
    },
    {
      title: 'Reports and profiling',
      body: [
        <>Report commands render run summaries and GitHub PR comments. Profile commands create native profiling manifests, flamegraphs, summaries, and profile diffs; profiling is separate from timing-focused benchmark runs.</>,
      ],
      code: {
        language: 'text',
        value: `mobench summary
Purpose:
  Display summary statistics from a benchmark report JSON file.
Usage:
  mobench summary [--format <text|json|csv>] <REPORT>
Inputs:
  <REPORT> is a benchmark report JSON file.
Outputs:
  Average/min/max/median, sample count, device, OS version in selected format.

mobench report summarize
Purpose:
  Generate Markdown from standardized CI summary JSON.
Usage:
  mobench report summarize [--summary <FILE>] [--output <FILE>] [--plots <auto|off|require>]
Defaults:
  --summary target/mobench/ci/summary.json
  --plots auto
Outputs:
  Markdown to stdout or --output.

mobench report github
Purpose:
  Generate or publish a sticky GitHub PR comment.
Usage:
  mobench report github [--pr <N>] [--summary <FILE>] [--marker <MARKER>] [--publish] [--output <FILE>]
Defaults:
  --summary target/mobench/ci/summary.json
  --marker <!-- mobench-report -->
Inputs:
  GITHUB_TOKEN when --publish is set.
Outputs:
  Comment body file, stdout, or published PR comment.

mobench profile run
Purpose:
  Plan or execute native profiling capture.
Usage:
  mobench profile run --target <android|ios> --function <PATH> [OPTIONS]
Flags:
  --crate-path <DIR>                     Benchmark crate path.
  --config <FILE>                        Optional config file.
  --output-dir <DIR>                     Default: target/mobench/profile.
  --trace-events-output <FILE>           Machine-readable trace/event JSON path.
  --device <DEVICE>                      Explicit device name; requires --os-version.
  --os-version <VERSION>                 Device OS version.
  --profile <PROFILE>                    Device profile/tag.
  --device-matrix <FILE>                 Matrix for profile/config resolution.
  --provider <local|browserstack>        Default: local.
  --backend <auto|android-native|ios-instruments|rust-tracing> Default: auto.
  --format <native|processed|both>       Default: both.
  --warmup-mode <cold|warm>              Local native capture warmup mode.
Outputs:
  profile.json, summary.md, raw artifacts, processed folded stacks, native report, flamegraph SVG/HTML, optional trace events.

mobench profile summarize
Purpose:
  Render Markdown or JSON from a normalized profile manifest.
Usage:
  mobench profile summarize [--profile <FILE>] [--output <FILE>] [--output-format <markdown|json>]
Defaults:
  --profile target/mobench/profile/profile.json
  --output-format markdown
Outputs:
  Profile summary to stdout or file.

mobench profile diff
Purpose:
  Generate differential flamegraph bundle from two profile manifests.
Usage:
  mobench profile diff --baseline <FILE> --candidate <FILE> [--output-dir <DIR>] [--normalize]
Default:
  --output-dir target/mobench/profile/diff
Outputs:
  profile-diff.json, summary.md, differential folded stacks, differential flamegraph SVG/HTML.`,
      },
    },
    {
      title: 'Outputs and contracts',
      body: [
        <>Command outputs are intentionally boring and parseable. Treat JSON summaries, CI contracts, profile manifests, trace events, CSV rows, and Markdown reports as integration boundaries for dashboards and automation.</>,
      ],
      bullets: [
        <><code>target/mobench/</code>: default generated artifact root for mobile runners and run outputs.</>,
        <><code>target/mobench/ci/summary.json</code>: stable CI machine-readable summary.</>,
        <><code>target/mobench/ci/summary.md</code>: human-readable Markdown summary.</>,
        <><code>target/mobench/ci/results.csv</code>: tabular benchmark rows.</>,
        <><code>target/browserstack/</code>: default BrowserStack fetch output.</>,
        <><code>target/mobench/profile/profile.json</code>: latest normalized profile manifest.</>,
        <><code>target/mobench/profile/summary.md</code>: latest profile summary.</>,
        <><code>target/mobench/profile/&lt;run-id&gt;/</code>: per-profile-run raw and processed artifact bundle.</>,
      ],
      code: {
        language: 'text',
        value: `Configuration resolution precedence:
  1. Explicit CLI flags such as --project-root and --crate-path.
  2. Explicit --config.
  3. Discovered mobench.toml.
  4. Cargo workspace metadata.
  5. Git root.
  6. Legacy bench-mobile/ fallback.

Device resolution:
  --devices                    Direct device labels.
  --device-matrix + --device-tags
                               Matrix-driven selection for runs.
  devices resolve              Deterministic preview of matrix/profile selection.
  profile run --device/--os-version
                               One explicit profiling target.
  profile run --profile        Reuse matrix/profile resolution.

Regression behavior:
  --baseline path              Local baseline summary.
  --baseline url               Remote baseline summary.
  --baseline artifact:path     CI artifact-style source.
  --regression-threshold-pct   Percent threshold before regression failure.

Publish behavior:
  report github --output       Write comment body only.
  report github --publish      Publish with GITHUB_TOKEN.
  ci check-run                 Create a GitHub Check Run for a commit SHA.`,
      },
    },
  ],
  schemas: [
    {
      title: 'CI contract',
      bullets: [
        <>Root object contains <code>ci</code>.</>,
        <><code>metadata</code> includes requester, request command, optional PR number, optional mobench ref, and mobench version.</>,
        <><code>outputs</code> includes paths for summary JSON, summary Markdown, and results CSV.</>,
      ],
    },
    {
      title: 'Summary',
      bullets: [
        <>Summary payloads include generated timestamps, target, function, iteration counts, warmup counts, device list, and per-device summaries.</>,
        <>Samples include wall-clock duration and optional CPU and memory columns when providers expose them.</>,
      ],
    },
    {
      title: 'Trace events',
      bullets: [
        <>Trace events include source metadata, total duration, lanes, events, frames, semantic phases, and optional iteration indexes.</>,
        <>The schema supports local and BrowserStack origins while keeping profiler-specific details normalized.</>,
      ],
    },
  ],
  examples: [
    {
      title: 'Basic benchmark',
      body: [
        <>The basic example shows the minimum SDK integration: Cargo metadata, build script, exported library functions, and <code>#[benchmark]</code> functions discoverable by mobench.</>,
      ],
    },
    {
      title: 'FFI benchmark',
      body: [
        <>The FFI example keeps UniFFI-compatible records and errors for app integration while also demonstrating native C ABI exports for generated runners that need to avoid binding overhead in the measured path.</>,
      ],
      code: {
        language: 'rust',
        value: `#[uniffi::export]
pub fn run_app_function(input: AppInput) -> Result<AppOutput, AppError> {
    // Normal app-facing API.
}

mobench_sdk::export_native_c_abi!();

#[benchmark]
pub fn benchmark_app_path() {
    // Benchmark path discovered by mobench.
}`,
      },
    },
    {
      title: 'Fixture outputs',
      bullets: [
        <>Basic summary fixture: small normalized report useful for parser tests.</>,
        <>FFI summary fixture: verifies generated runner and ABI-backed report shape.</>,
        <>Profile trace fixture: verifies trace-event consumers and timeline rendering.</>,
      ],
    },
  ],
  diagrams: [
    {
      title: 'Workspace responsibility map',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  repo["mobile-bench-rs workspace"]
  repo --> cli["mobench CLI"]
  repo --> sdk["mobench-sdk"]
  repo --> macros["mobench-macros"]
  repo --> templates["embedded mobile templates"]
  repo --> examples["basic + FFI examples"]

  cli --> config["config + device matrix"]
  cli --> providers["local + BrowserStack providers"]
  cli --> reporting["summary / CSV / Markdown reports"]

  sdk --> registry["inventory benchmark registry"]
  sdk --> timing["timing harness + statistics"]
  sdk --> builders["AndroidBuilder / IosBuilder"]
  sdk --> abi["UniFFI + native C ABI runners"]
  sdk --> profiling["native profiling helpers"]

  macros --> registry
  templates --> builders
  examples --> registry
  builders --> providers
  providers --> reporting
  profiling --> reporting`,
      },
    },
    {
      title: 'Benchmark execution sequence',
      code: {
        language: 'mermaid',
        value: `sequenceDiagram
  participant Dev as Benchmark crate
  participant Macro as mobench-macros
  participant SDK as mobench-sdk
  participant CLI as mobench CLI
  participant Runner as Generated mobile runner
  participant Provider as Local or BrowserStack provider
  participant Report as Report artifacts

  Dev->>Macro: annotate #[benchmark]
  Macro->>SDK: submit BenchmarkDescriptor via inventory
  CLI->>SDK: discover benchmarks and resolve BenchSpec
  CLI->>SDK: generate Android or iOS runner project
  SDK->>Runner: embed native library and runner harness
  CLI->>Provider: install/upload and start test execution
  Provider->>Runner: invoke benchmark entrypoint
  Runner->>SDK: execute warmup and measured iterations
  SDK-->>Runner: RunnerReport JSON
  Provider-->>CLI: logs, raw artifacts, status
  CLI->>Report: write summary.json, summary.md, results.csv`,
      },
    },
    {
      title: 'Generated runner contract',
      body: [
        <>Generated runners should only depend on public SDK contracts: benchmark discovery, <code>BenchSpec</code> input, native runner entrypoints, and serialized <code>RunnerReport</code> output. This keeps mobile templates, BrowserStack fetches, local runs, and downstream CI reports aligned.</>,
      ],
      code: {
        language: 'mermaid',
        value: `flowchart LR
  spec["BenchSpec JSON"] --> abi["native C ABI or UniFFI boundary"]
  abi --> registry["registry lookup"]
  registry --> timing["warmup + measured iterations"]
  timing --> samples["BenchSample rows"]
  samples --> runnerReport["RunnerReport JSON"]
  runnerReport --> cli["CLI normalization"]
  cli --> summary["summary.json"]
  cli --> markdown["summary.md"]
  cli --> csv["results.csv"]`,
      },
    },
  ],
  'current-spec': [
    {
      title: 'Release evolution: 0.1.44–0.1.46',
      bullets: [
        <>0.1.44 established the hardened reusable-workflow boundary: untrusted pull-request code is built without secrets, trusted jobs consume only validated prebuilt artifacts, and reporting is isolated.</>,
        <>0.1.45 added safe caller preparation hooks, per-platform function lists, structured Android/iOS device arrays, and complete function/device result enforcement while preserving compatibility fallbacks.</>,
        <>0.1.46 added caller-pinned Rust toolchains, typed UniFFI/native C ABI/BoltFFI preparation, Cargo-workspace-aware UniFFI lockfile resolution, and unnecessary-generator avoidance for native backends.</>,
      ],
    },
    {
      title: 'Scope',
      bullets: [
        <>Release line documented by the current spec is <code>0.1.46</code>.</>,
        <>The spec covers benchmark authoring, setup and teardown, SDK runtime API, native C ABI, generated runners, config files, CLI behavior, reports, BrowserStack, profiling, schemas, and compatibility boundaries.</>,
        <>Historical design proposals are excluded from the current behavior contract.</>,
      ],
    },
    {
      title: 'Contracts',
      bullets: [
        <>Input to the native C ABI is JSON-serialized <code>BenchSpec</code>.</>,
        <>Output from runner boundaries is JSON-serialized <code>RunnerReport</code>.</>,
        <>Report and CI payloads are intentionally schema-backed so downstream tools can parse them safely.</>,
        <>Split-run merging validates one-sample inputs and emits the same standard CI output paths and schemas as a normal CI run.</>,
      ],
    },
    {
      title: 'Compatibility',
      bullets: [
        <>The serialized contracts are public API.</>,
        <>The default generated FFI backend remains UniFFI; <code>boltffi</code> and <code>native-c-abi</code> are typed alternatives in 0.1.46.</>,
        <>Existing workflow callers remain compatible when the 0.1.45 and 0.1.46 inputs are omitted: platform-specific functions fall back to <code>functions</code>, structured devices fall back to legacy device/profile inputs, and <code>rust_toolchain</code> defaults to <code>stable</code>.</>,
        <>Semver changes should protect benchmark authors and CI consumers from silent output drift.</>,
      ],
    },
  ],
  codebase: [
    {
      title: 'Workspace',
      bullets: [
        <><RepoPath path="crates/mobench" />: CLI library and binaries.</>,
        <><RepoPath path="crates/mobench-sdk" />: SDK runtime and builders.</>,
        <><RepoPath path="crates/mobench-macros" />: benchmark proc macro.</>,
        <><RepoPath path="examples/basic-benchmark" /> and <RepoPath path="examples/ffi-benchmark" />: integration examples.</>,
      ],
    },
    {
      title: 'Runtime layers',
      bullets: [
        <>CLI orchestration resolves config, builds artifacts, selects providers, fetches artifacts, and writes reports.</>,
        <>SDK builders create Android and iOS generated runner projects.</>,
        <>Generated runners bridge mobile test frameworks into Rust benchmark execution.</>,
      ],
    },
    {
      title: 'Integrations',
      bullets: [
        <>BrowserStack for hosted real Android and iOS devices.</>,
        <>Generated runner backends for UniFFI, native C ABI, and BoltFFI.</>,
        <>GitHub Actions for CI runs, sticky PR comments, and artifact contracts.</>,
        <>Local native profiling for trace-event and flamegraph artifacts.</>,
      ],
    },
  ],
  testing: [
    {
      title: 'Test taxonomy',
      bullets: [
        <>Host-side Rust tests verify SDK, macros, CLI parsing, report generation, fixtures, and profile transforms.</>,
        <>CLI smoke checks verify command wiring and prerequisite diagnostics.</>,
        <>Fixture validation protects JSON schemas and stable downstream payloads.</>,
      ],
    },
    {
      title: 'CI checks',
      code: {
        language: 'bash',
        value: `cargo test --workspace
mobench check --target android
mobench check --target ios
mobench ci run --target android --local-only --output target/mobench/ci
mobench ci merge-split-runs --help`,
      },
    },
    {
      title: 'Profiling checks',
      bullets: [
        <>Profile smoke tests should validate trace-event output, semantic phases, profile summaries, and diff normalization.</>,
        <>BrowserStack smoke tests should be scoped because hosted-device runs are slower and provider-dependent.</>,
      ],
    },
  ],
  'public-api': [
    {
      title: 'Crates',
      bullets: [
        <><code>mobench-sdk</code> exposes benchmark macros, runtime types, builders, runner support, profiling helpers, and ABI helpers.</>,
        <><code>mobench</code> exposes CLI orchestration types such as <code>RunRequest</code>, <code>RunResult</code>, <code>DeviceSelection</code>, and <code>Report</code>.</>,
        <><code>mobench-macros</code> exposes <code>#[benchmark]</code>.</>,
      ],
    },
    {
      title: 'Feature flags',
      bullets: [
        <>Default SDK features support normal benchmark authoring.</>,
        <>Registry-only usage supports narrower runtime crates.</>,
        <>FFI backend selection belongs in project config so generated runners and crates agree.</>,
      ],
    },
    {
      title: 'Release checks',
      code: {
        language: 'bash',
        value: `cargo test --workspace
cargo publish --dry-run -p mobench-sdk
cargo publish --dry-run -p mobench-macros
cargo publish --dry-run -p mobench`,
      },
    },
  ],
  troubleshooting: [
    {
      title: 'Setup',
      bullets: [
        <>If Android builds fail, run target checks and verify Android SDK, ADB, emulator images, and package identifiers.</>,
        <>If iOS builds fail, verify Xcode command-line tools, simulator runtimes, signing mode, and deployment target.</>,
        <>If BrowserStack runs fail before execution, verify credentials and device resolution first.</>,
      ],
    },
    {
      title: 'Runs',
      bullets: [
        <>If benchmarks are missing, check macro imports, crate features, inventory registration, and generated runner config.</>,
        <>If local device runs do not start, list devices through ADB or Xcode first and confirm the runner artifact was built for that target.</>,
        <>If results are noisy, increase iterations and warmup, reduce background work, and prefer stable devices for baselines.</>,
      ],
    },
    {
      title: 'Reports',
      bullets: [
        <>If downstream parsing fails, validate against the summary, CI contract, and trace-events schemas.</>,
        <>If BrowserStack artifacts are missing, use fetch commands and inspect provider job identifiers.</>,
        <>If profile diffs look wrong, confirm both profiles use comparable function, target, device, and normalization settings.</>,
      ],
    },
  ],
}

const EXTRA_CONTENT: Partial<Record<PageId, Section[]>> = {
  overview: [
    {
      title: 'System map',
      body: [
        <>At a high level, mobench keeps the benchmark source in your Rust crate and moves only the runner shell across execution environments. That keeps benchmark ownership close to product code while still exercising mobile packaging, mobile test frameworks, and device-specific runtime behavior.</>,
      ],
      code: {
        language: 'mermaid',
        value: `flowchart LR
  crate["Rust benchmark crate"] --> macro["#[benchmark] macro"]
  macro --> registry["inventory registry"]
  registry --> sdk["mobench-sdk runtime"]
  sdk --> cli["mobench CLI"]
  cli --> android["Generated Android runner"]
  cli --> ios["Generated iOS runner"]
  android --> localA["ADB device or emulator"]
  ios --> localI["Xcode device or simulator"]
  android --> browserstack["BrowserStack App Automate"]
  ios --> browserstack
  browserstack --> reports["summary.json / summary.md / results.csv"]
  localA --> reports
  localI --> reports`,
      },
    },
    {
      title: 'Mental model',
      body: [
        <>Think of mobench as three contracts. The authoring contract is Rust functions plus macro metadata. The runner contract is generated Android and iOS code that can invoke those functions consistently. The reporting contract is stable JSON, Markdown, CSV, and profiling artifacts that CI and dashboards can consume.</>,
      ],
    },
  ],
  quickstart: [
    {
      title: 'First run walkthrough',
      body: [
        <>Use a host-only smoke run before a device run. It proves that the benchmark crate compiles, the macro registered your function, and the report writer can produce output. Once that passes, switch to local mobile or BrowserStack to measure the real mobile execution path.</>,
      ],
      code: {
        language: 'bash',
        value: `# 1. Confirm benchmark discovery.
mobench list --crate-path crates/my-bench-crate

# 2. Smoke-test the run/report path without mobile packaging.
mobench run \\
  --target android \\
  --function my_bench_crate::checksum_bench \\
  --crate-path crates/my-bench-crate \\
  --local-only \\
  --iterations 20 \\
  --warmup 5 \\
  --output target/mobench/smoke/results.json

# 3. Move to a real provider once discovery is known-good.
mobench build --target android --release
mobench ci run --target android --browserstack --output target/mobench/ci`,
      },
    },
    {
      title: 'Quickstart flow',
      code: {
        language: 'mermaid',
        value: `flowchart TD
  install["Install CLI"] --> init["mobench init"]
  init --> write["Write #[benchmark] function"]
  write --> list["mobench list"]
  list --> smoke["Host-only smoke run"]
  smoke --> build["Build generated mobile runner"]
  build --> choose{"Choose provider"}
  choose --> local["Local device / emulator / simulator"]
  choose --> bs["BrowserStack App Automate"]
  local --> report["Inspect summary + CSV"]
  bs --> report`,
      },
    },
  ],
  install: [
    {
      title: 'Project configuration',
      body: [
        <>A repository-level <code>mobench.toml</code> lets the CLI resolve the benchmark crate, generated runner backend, mobile identifiers, default benchmark function, and default iteration settings without repeating flags in every command.</>,
      ],
      code: {
        language: 'toml',
        value: `[project]
crate = "my-bench-crate"
library_name = "my_bench_crate"
ffi_backend = "native-c-abi" # "uniffi" is the compatibility default

[android]
package = "com.example.mobench"
min_sdk = 24
target_sdk = 35

[ios]
bundle_id = "com.example.mobench"
deployment_target = "16.0"

[benchmarks]
default_function = "my_bench_crate::checksum_bench"
default_iterations = 100
default_warmup = 10`,
      },
    },
    {
      title: 'Environment checklist',
      code: {
        language: 'bash',
        value: `rustc --version
mobench --version
adb devices
xcrun simctl list devices available
mobench check --target android
mobench check --target ios`,
      },
    },
  ],
  concepts: [
    {
      title: 'Crate boundary diagram',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  subgraph Author["Benchmark author crate"]
    fn["#[benchmark] functions"]
    cfg["mobench.toml"]
  end
  subgraph SDK["mobench-sdk"]
    timing["timing + samples"]
    registry["registry + runner report"]
    abi["UniFFI / native C ABI / BoltFFI"]
  end
  subgraph CLI["mobench CLI"]
    build["build"]
    run["run / ci run"]
    report["summary / report / fetch"]
  end
  fn --> registry
  cfg --> build
  registry --> timing
  timing --> report
  abi --> build
  build --> run
  run --> report`,
      },
    },
    {
      title: 'Choosing the right execution mode',
      bullets: [
        <>Use <code>--local-only</code> when you are validating discovery and report shape.</>,
        <>Use Android emulators or iOS simulators when you need fast local iteration on generated runners.</>,
        <>Use connected devices when hardware behavior matters and you can manage the device locally.</>,
        <>Use BrowserStack when CI needs remote real devices, artifacts, and repeatable shared coverage.</>,
      ],
    },
  ],
  authoring: [
    {
      title: 'Benchmark anatomy',
      body: [
        <>A good benchmark has a stable name, a narrow measured body, setup outside measured samples, and explicit black-boxing of values that must stay observable to the optimizer.</>,
      ],
      code: {
        language: 'rust',
        value: `use mobench_sdk::benchmark;

fn build_payload() -> Vec<u8> {
    include_bytes!("../fixtures/payload.bin").repeat(32)
}

#[benchmark(setup = build_payload)]
pub fn decode_payload(payload: &Vec<u8>) {
    let decoded = my_codec::decode(payload).expect("fixture should decode");
    std::hint::black_box(decoded);
}`,
      },
    },
    {
      title: 'What the macro gives mobench',
      code: {
        language: 'mermaid',
        value: `sequenceDiagram
  participant Rust as Benchmark crate
  participant Macro as #[benchmark]
  participant Registry as inventory registry
  participant Runner as mobench runner
  Rust->>Macro: annotate function
  Macro->>Registry: submit benchmark metadata
  Runner->>Registry: discover function by name
  Runner->>Rust: execute warmup and measured iterations
  Runner->>Runner: write BenchReport`,
      },
    },
  ],
  'setup-teardown': [
    {
      title: 'Timing boundary',
      body: [
        <>Setup and teardown are about isolating the measured body. One-time setup prepares shared input once. Per-iteration setup prepares fresh input for each sample. Teardown cleans up after measurement and should not hide work that belongs in the benchmark itself.</>,
      ],
      code: {
        language: 'mermaid',
        value: `flowchart LR
  setup["setup() outside timing"] --> warmup["warmup iterations"]
  warmup --> measure["measured benchmark body"]
  measure --> samples["BenchSample[]"]
  samples --> teardown["teardown() outside timing"]`,
      },
    },
    {
      title: 'Mutable input pattern',
      code: {
        language: 'rust',
        value: `fn random_rows() -> Vec<Row> {
    seeded_rows(10_000)
}

#[benchmark(setup = random_rows, per_iteration)]
pub fn sort_rows(mut rows: Vec<Row>) {
    rows.sort_by_key(|row| row.account_id);
    std::hint::black_box(rows);
}`,
      },
    },
  ],
  sdk: [
    {
      title: 'Programmatic run shape',
      body: [
        <>The SDK centers on a spec-in, report-out model. Generated runners serialize a <code>BenchSpec</code>, execute through the registry, then serialize a runner report back to platform code or the native C ABI caller.</>,
      ],
      code: {
        language: 'rust',
        value: `use mobench_sdk::timing::BenchSpec;

let spec = BenchSpec::new("my_bench_crate::checksum_bench", 100, 10)?;
let report = mobench_sdk::run_benchmark(spec)?;

println!("mean: {} ns", report.mean_ns().unwrap_or_default());
println!("p95: {} ns", report.percentile_ns(95.0).unwrap_or_default());`,
      },
    },
    {
      title: 'Native C ABI boundary',
      code: {
        language: 'mermaid',
        value: `flowchart LR
  swift["Swift / Kotlin runner"] --> c["mobench_run_benchmark_json"]
  c --> rust["Rust benchmark registry"]
  rust --> report["RunnerReport JSON"]
  report --> buf["MobenchBuf"]
  buf --> free["mobench_free_buf"]`,
      },
    },
  ],
  build: [
    {
      title: 'Generated output tree',
      code: {
        language: 'text',
        value: `target/mobench/
  android/
    project/                 # generated Gradle project
    app-release.apk          # app under test
    app-release-androidTest.apk
    runner-spec.json
  ios/
    project/                 # generated Xcode project
    MobenchRunner.ipa
    MobenchRunnerUITests.zip
    runner-spec.json`,
      },
    },
    {
      title: 'Build pipeline',
      code: {
        language: 'mermaid',
        value: `flowchart TD
  check["mobench check"] --> resolve["resolve crate + config"]
  resolve --> generate["generate mobile runner"]
  generate --> compile["Gradle / xcodebuild"]
  compile --> artifacts["APK/AAB + test APK or IPA + XCUITest ZIP"]
  artifacts --> verify["verify artifact paths"]
  verify --> provider["local provider or BrowserStack upload"]`,
      },
    },
  ],
  'local-devices': [
    {
      title: 'Local execution matrix',
      code: {
        language: 'mermaid',
        value: `flowchart LR
  runner["Generated runner"] --> android{"Android target"}
  runner --> ios{"iOS target"}
  android --> adb["ADB physical device"]
  android --> emulator["Android Studio emulator"]
  ios --> sim["Xcode simulator"]
  ios --> iphone["Connected iOS device"]
  adb --> summary["mobench reports"]
  emulator --> summary
  sim --> summary
  iphone --> summary`,
      },
    },
    {
      title: 'Debugging local devices',
      code: {
        language: 'bash',
        value: `# Android
adb devices -l
adb logcat | rg mobench

# iOS simulator
xcrun simctl list devices available
xcrun simctl boot "iPhone 15"

# iOS device visibility
xcrun xctrace list devices`,
      },
    },
  ],
  browserstack: [
    {
      title: 'CI run sequence',
      code: {
        language: 'mermaid',
        value: `sequenceDiagram
  participant CI
  participant Mobench
  participant BS as BrowserStack
  participant PR as Pull request
  CI->>Mobench: mobench ci run
  Mobench->>Mobench: resolve matrix + build artifacts
  Mobench->>BS: upload app + test suite
  Mobench->>BS: create App Automate build
  BS-->>Mobench: build/session status + logs
  Mobench->>CI: summary.json + summary.md + results.csv
  Mobench->>PR: sticky Markdown report`,
      },
    },
    {
      title: 'Device matrix example',
      code: {
        language: 'yaml',
        value: `android:
  smoke:
    - device: "Google Pixel 7"
      os_version: "13.0"
  low_end:
    - device: "Samsung Galaxy A52"
      os_version: "11.0"

ios:
  smoke:
    - device: "iPhone 14"
      os_version: "16"`,
      },
    },
  ],
  'app-automate': [
    {
      title: 'App Automate lifecycle diagram',
      code: {
        language: 'mermaid',
        value: `flowchart TD
  creds["Username + access key"] --> uploadApp["Upload app artifact"]
  uploadApp --> uploadTests["Upload Espresso APK or XCUITest ZIP"]
  uploadTests --> build["Create framework build"]
  build --> devices["Run on selected real devices"]
  devices --> artifacts["Logs, video, status, media"]
  artifacts --> normalize["mobench fetch + normalize"]
  normalize --> reports["summary.json / summary.md / results.csv"]`,
      },
    },
    {
      title: 'Framework-specific artifact expectations',
      code: {
        language: 'text',
        value: `Android Espresso
  app:       .apk or .aab
  tests:     androidTest .apk
  run API:   /app-automate/espresso/v2/build

iOS XCUITest
  app:       .ipa
  tests:     XCUITest .zip
  run API:   /app-automate/xcuitest/v2/build`,
      },
    },
  ],
  profiling: [
    {
      title: 'Profiling artifact lifecycle',
      code: {
        language: 'mermaid',
        value: `flowchart LR
  run["profile run"] --> capture["native capture backend"]
  capture --> manifest["profile.json"]
  capture --> trace["trace-events.json"]
  trace --> phases["semantic phase summary"]
  manifest --> flame["flamegraph bundle"]
  manifest --> diff["profile diff"]`,
      },
    },
    {
      title: 'Trace-event shape',
      code: {
        language: 'json',
        value: `{
  "source": { "kind": "native", "profiler": "android-native", "origin": "local" },
  "total_duration_ns": 124000000,
  "lanes": [
    {
      "id": "main",
      "label": "Main thread",
      "events": [
        { "event_kind": "sample", "start_offset_ns": 0, "end_offset_ns": 2000000, "phase": "measured", "iteration": 1, "frames": ["decode_payload"] }
      ]
    }
  ]
}`,
      },
    },
  ],
  reports: [
    {
      title: 'Report contract walkthrough',
      code: {
        language: 'json',
        value: `{
  "summary": {
    "target": "android",
    "function": "my_bench_crate::checksum_bench",
    "iterations": 100,
    "warmup": 10,
    "devices": ["Google Pixel 7-13.0"],
    "device_summaries": [
      {
        "device": "Google Pixel 7-13.0",
        "mean_ns": 81234,
        "median_ns": 80110,
        "p95_ns": 90220
      }
    ]
  }
}`,
      },
    },
    {
      title: 'Report consumption flow',
      code: {
        language: 'mermaid',
        value: `flowchart LR
  run["mobench run"] --> json["summary.json"]
  run --> md["summary.md"]
  run --> csv["results.csv"]
  json --> dashboard["dashboard / regression checker"]
  md --> pr["GitHub PR comment"]
  csv --> sheets["spreadsheet / warehouse"]`,
      },
    },
  ],
  schemas: [
    {
      title: 'Schema relationship',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  ci["ci-contract-v1"] --> outputs["summary_json / summary_md / results_csv"]
  outputs --> summary["summary-v1"]
  summary --> samples["BenchSample rows"]
  profile["profile run"] --> trace["trace-events-v1"]
  trace --> lanes["lanes + events + frames"]`,
      },
    },
    {
      title: 'Validation example',
      code: {
        language: 'bash',
        value: `# Example shape for CI: validate before publishing artifacts.
ajv validate \\
  -s docs/schemas/summary-v1.schema.json \\
  -d target/mobench/ci/summary.json

ajv validate \\
  -s docs/schemas/trace-events-v1.schema.json \\
  -d target/mobench/profile/trace-events.json`,
      },
    },
  ],
  examples: [
    {
      title: 'Basic example walkthrough',
      code: {
        language: 'bash',
        value: `cd examples/basic-benchmark
cargo test
mobench list --crate-path .
mobench run --local-only --function basic_benchmark::fibonacci_30`,
      },
    },
    {
      title: 'FFI example walkthrough',
      body: [
        <>Use the FFI example when validating generated runner boundaries. It demonstrates app-facing exported functions, benchmark discovery, and the native C ABI path that keeps binding overhead out of the measured benchmark call.</>,
      ],
      code: {
        language: 'rust',
        value: `#[derive(serde::Serialize, serde::Deserialize, uniffi::Record)]
pub struct HashInput {
    pub bytes: Vec<u8>,
}

#[uniffi::export]
pub fn hash_for_app(input: HashInput) -> HashOutput {
    hash_impl(input)
}

mobench_sdk::export_native_c_abi!();

#[benchmark(setup = sample_hash_input)]
pub fn hash_bench(input: &HashInput) {
    std::hint::black_box(hash_impl(input.clone()));
}`,
      },
    },
  ],
  diagrams: [
    {
      title: 'BrowserStack CI lifecycle',
      code: {
        language: 'mermaid',
        value: `sequenceDiagram
  participant GH as GitHub Actions
  participant CLI as mobench ci run
  participant BS as BrowserStack App Automate
  participant Device as Real device session
  participant Artifacts as CI artifacts
  participant PR as Pull request

  GH->>CLI: target, profile, matrix, credentials
  CLI->>CLI: build Android APK or iOS app/test bundle
  CLI->>BS: upload app artifact
  CLI->>BS: upload Espresso APK or XCUITest ZIP
  CLI->>BS: create build with resolved devices
  BS->>Device: schedule framework session
  Device-->>BS: logs, status, media, benchmark output
  BS-->>CLI: build/session metadata
  CLI->>Artifacts: summary.json, summary.md, results.csv
  CLI->>PR: sticky Markdown report`,
      },
    },
    {
      title: 'CLI, SDK, and template boundary',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  subgraph CLI["mobench CLI"]
    config["Config resolution"]
    matrix["Device matrix resolution"]
    provider["Provider orchestration"]
    report["Report writers"]
  end

  subgraph SDK["mobench-sdk"]
    registry["Benchmark registry"]
    timing["Timing harness"]
    builders["AndroidBuilder / IosBuilder"]
    codegen["Mobile project codegen"]
    profile["Native profiling"]
  end

  subgraph Generated["Generated runner projects"]
    android["Android Gradle + Espresso harness"]
    ios["Xcode + XCUITest harness"]
    wrapper["bench-mobile FFI wrapper"]
  end

  config --> builders
  matrix --> provider
  builders --> codegen
  codegen --> android
  codegen --> ios
  codegen --> wrapper
  wrapper --> registry
  provider --> android
  provider --> ios
  android --> timing
  ios --> timing
  timing --> report
  profile --> report`,
      },
    },
  ],
  'current-spec': [
    {
      title: 'Spec coverage map',
      code: {
        language: 'mermaid',
        value: `mindmap
  root((mobench current spec))
    Authoring
      benchmark macro
      setup
      teardown
    Runtime
      BenchSpec
      BenchReport
      RunnerReport
    Runners
      UniFFI
      native C ABI
      BoltFFI
    CLI
      run
      ci run
      ci merge-split-runs
      report
    Contracts
      schemas
      output files
      semver`,
      },
    },
    {
      title: 'Compatibility checklist',
      bullets: [
        <>Do not change serialized report keys without a schema version plan.</>,
        <>Do not make generated runners require private SDK symbols.</>,
        <>Treat CI output paths as integration contracts for downstream workflows.</>,
      ],
    },
  ],
  codebase: [
    {
      title: 'Where to make changes',
      code: {
        language: 'text',
        value: `crates/mobench/
  CLI commands, BrowserStack client, report writers

crates/mobench-sdk/
  timing, registry, generated runner builders, profiling helpers

crates/mobench-macros/
  #[benchmark] parsing and compile-time validation

docs/schemas/
  machine-readable output contracts

examples/
  integration examples and fixture outputs`,
      },
    },
    {
      title: 'Codebase dependency flow',
      code: {
        language: 'mermaid',
        value: `flowchart LR
  macros["mobench-macros"] --> sdk["mobench-sdk"]
  cli["mobench"] --> sdk
  examples["examples"] --> sdk
  ci["GitHub workflows"] --> cli
  docs["docs + schemas"] --> cli
  docs --> sdk`,
      },
    },
  ],
  testing: [
    {
      title: 'Testing pyramid',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  unit["Fast Rust unit tests"] --> cli["CLI smoke tests"]
  cli --> fixtures["Fixture + schema validation"]
  fixtures --> local["Local generated runner smoke"]
  local --> bs["BrowserStack smoke matrix"]
  bs --> release["Release readiness"]`,
      },
    },
    {
      title: 'Fixture test pattern',
      code: {
        language: 'rust',
        value: `#[test]
fn summary_fixture_matches_schema_expectations() {
    let summary = include_str!("../examples/fixtures/basic/summary.json");
    let parsed: serde_json::Value = serde_json::from_str(summary).unwrap();
    assert_eq!(parsed["summary"]["target"], "android");
    assert!(parsed["summary"]["device_summaries"].is_array());
}`,
      },
    },
  ],
  'public-api': [
    {
      title: 'Public API layers',
      code: {
        language: 'mermaid',
        value: `flowchart TB
  user["Benchmark author"] --> macro["#[benchmark]"]
  user --> sdkTypes["mobench-sdk types"]
  ci["CI integration"] --> cliTypes["mobench crate RunRequest / RunResult"]
  runners["Generated mobile runners"] --> abi["serialized RunnerReport + native C ABI"]
  downstream["Dashboards"] --> schemas["summary / ci / trace schemas"]`,
      },
    },
    {
      title: 'Release readiness walk',
      body: [
        <>A release is ready only when host tests, generated-runner examples, schema fixtures, docs snippets, and dry-run publishing all agree on the same public surface. The point is to catch mismatches before a downstream CI workflow learns about them the hard way.</>,
      ],
    },
  ],
  troubleshooting: [
    {
      title: 'Failure triage flow',
      code: {
        language: 'mermaid',
        value: `flowchart TD
  fail["Run failed"] --> phase{"Where did it fail?"}
  phase --> discover["Benchmark discovery"]
  phase --> build["Mobile build"]
  phase --> provider["Provider execution"]
  phase --> report["Report parsing"]
  discover --> list["mobench list"]
  build --> check["mobench check"]
  provider --> logs["ADB / Xcode / BrowserStack logs"]
  report --> schema["Validate schema + inspect summary.json"]`,
      },
    },
    {
      title: 'Minimum useful bug report',
      code: {
        language: 'text',
        value: `Include:
  mobench version
  target: android / ios / both
  provider: local-only / local device / BrowserStack
  benchmark function name
  mobench.toml relevant sections
  generated artifact paths
  summary.json or failing provider logs`,
      },
    },
  ],
}

const AI_LINKS = [
  ['ChatGPT', 'https://chatgpt.com/?q='],
  ['Claude', 'https://claude.ai/new?q='],
  ['Gemini', 'https://gemini.google.com/app?prompt='],
  ['Grok', 'https://grok.com/?q='],
] as const

function groupedPages() {
  return PAGES.reduce<Record<string, PageDef[]>>((groups, page) => {
    groups[page.group] = groups[page.group] ? [...groups[page.group], page] : [page]
    return groups
  }, {})
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type SearchEntry = {
  id: string
  page: PageDef
  title: string
  subtitle: string
  sectionTitle?: string
  haystack: string
}

function textFromNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textFromNode).join(' ')
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode }
    return textFromNode(props.children)
  }
  return ''
}

function sectionText(section: Section) {
  return [
section.title,
...(section.body ?? []).map(textFromNode),
...(section.bullets ?? []).map(textFromNode),
section.image?.alt,
section.image?.caption,
...(section.codeVariants ?? []).flatMap((variant) => [variant.label, variant.value]),
section.code?.value,
]
    .filter(Boolean)
    .join(' ')
}

function buildSearchEntries(): SearchEntry[] {
  return PAGES.flatMap((page) => {
    const sections = [...CONTENT[page.id], ...(EXTRA_CONTENT[page.id] ?? [])]
    const pageEntry: SearchEntry = {
      id: page.id,
      page,
      title: page.label,
      subtitle: `${page.group} · ${page.description}`,
      haystack: [page.label, page.group, page.description, ...page.toc].join(' '),
    }

    const sectionEntries = sections.map((section) => ({
      id: `${page.id}:${slugify(section.title)}`,
      page,
      title: section.title,
      subtitle: `${page.label} · ${page.group}`,
      sectionTitle: section.title,
      haystack: [page.label, page.group, page.description, ...page.toc, sectionText(section)].join(' '),
    }))

    return [pageEntry, ...sectionEntries]
  })
}

function normalizeSearch(value: string) {
  return value.toLowerCase().trim()
}

function searchDocs(entries: SearchEntry[], query: string) {
  const normalized = normalizeSearch(query)
  if (!normalized) return entries.filter((entry) => !entry.sectionTitle).slice(0, 8)

  const terms = normalized.split(/\s+/).filter(Boolean)

  return entries
    .map((entry) => {
      const title = normalizeSearch(entry.title)
      const subtitle = normalizeSearch(entry.subtitle)
      const haystack = normalizeSearch(entry.haystack)

      if (!terms.every((term) => haystack.includes(term))) return null

      let score = 0
      if (title === normalized) score += 90
      if (title.startsWith(normalized)) score += 60
      if (title.includes(normalized)) score += 35
      if (subtitle.includes(normalized)) score += 12
      if (!entry.sectionTitle) score += 8
      score += terms.reduce((sum, term) => sum + (title.includes(term) ? 10 : 1), 0)

      return { entry, score }
    })
    .filter((result): result is { entry: SearchEntry; score: number } => result !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .map((result) => result.entry)
    .slice(0, 10)
}

function docsPageMarkdown(active: PageDef) {
  const article = document.querySelector('[data-docs-article]')
  const clone = article?.cloneNode(true) as HTMLElement | undefined
  clone?.querySelectorAll('[data-docs-actions]').forEach((element) => element.remove())
  const pageText = clone?.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? active.label
  return `# ${active.label}\n\n${pageText}`
}

function aiPromptForPage(markdown: string) {
  return [
    'Use this mobench documentation page context.',
    `Cross-check with the source-indexed DeepWiki / Devin documentation when useful: ${DEEPWIKI_URL}`,
    'Explain the page, identify important implementation details, and suggest the next concrete command or file to inspect.',
    '',
    markdown,
  ].join('\n')
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function DocsActions({
 active,
 getMarkdown,
 label = 'Copy page',
 mobileLabel = 'Copy',
}: {
 active?: PageDef
 getMarkdown?: () => string
 label?: string
 mobileLabel?: string
}) {
 const [open, setOpen] = useState(false)
 const [copied, setCopied] = useState(false)

 const currentMarkdown = () => getMarkdown?.() ?? (active ? docsPageMarkdown(active) : '# mobench\n\n' + document.body.innerText.trim())

  const copyPage = async () => {
    await copyText(currentMarkdown())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const askAi = (baseUrl: string) => {
    window.open(`${baseUrl}${encodeURIComponent(aiPromptForPage(currentMarkdown()))}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative" data-docs-actions>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.16)] bg-white px-3 font-sans text-[13px] font-medium text-ink shadow-[0_8px_24px_-22px_rgba(20,18,12,0.5)] transition-colors hover:border-green/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/30 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-5 xl:text-[17px]"
      >
        {copied ? <Check className="h-[15px] w-[15px] xl:h-5 xl:w-5" /> : <MessageCircle className="h-[15px] w-[15px] xl:h-5 xl:w-5" />}
 <span className="hidden sm:inline">{copied ? 'Copied' : label}</span>
 <span className="sm:hidden">{copied ? 'Done' : mobileLabel}</span>
      <ChevronDown className={cn('h-[15px] w-[15px] transition-transform xl:h-5 xl:w-5', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(326px,calc(100vw-40px))] overflow-hidden rounded-xl border border-[rgba(20,18,12,0.12)] bg-white p-1.5 text-ink shadow-[0_24px_70px_-36px_rgba(20,18,12,0.42)]">
          <button
            type="button"
            onClick={copyPage}
            className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left font-sans hover:bg-green/5"
          >
            <Copy size={17} className="mt-0.5 text-green" />
            <span>
              <span className="block text-[14px] font-medium text-ink">Copy page</span>
              <span className="mt-1 block text-[12.5px] leading-[1.35] text-muted">Copy the current page as Markdown.</span>
            </span>
          </button>

          <div className="border-t border-[rgba(20,18,12,0.10)] px-3 pb-2 pt-3">
            <div className="mb-2 flex items-center gap-3">
              <MessageCircle size={17} className="text-green" />
              <div>
                <div className="text-[14px] font-medium text-ink">Ask with context</div>
                <div className="mt-0.5 text-[12.5px] text-muted">Send this page to an assistant.</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_LINKS.map(([label, url]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => askAi(url)}
                  className="cursor-pointer rounded-lg border border-[rgba(20,18,12,0.10)] px-2.5 py-2 text-[12.5px] font-medium text-ink hover:border-green/40 hover:bg-green/5"
                >
                  {label}
                </button>
              ))}
          </div>
        </div>
        <div className="border-t border-[rgba(20,18,12,0.10)] px-3 pb-2 pt-3">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-[112px] flex-none items-center rounded-lg border border-[rgba(20,18,12,0.10)] bg-white px-2">
              <img
                src="/assets/logo-cognition.svg"
                alt="Cognition"
                className="h-4 w-full object-contain"
                loading="lazy"
              />
            </span>
            <div>
              <div className="text-[14px] font-medium text-ink">External docs</div>
              <div className="mt-0.5 text-[12.5px] text-muted">Open source-indexed DeepWiki / Devin context.</div>
            </div>
          </div>
          <a
            href={DEEPWIKI_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-[rgba(20,18,12,0.10)] px-2.5 py-2 text-[12.5px] font-medium text-ink no-underline hover:border-green/40 hover:bg-green/5"
          >
            DeepWiki for mobile-bench-rs
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    )}
    </div>
  )
}

function H2({ id, children, tight }: { id: string; children: ReactNode; tight?: boolean }) {
 const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
 event.preventDefault()
 const nextUrl = `${window.location.pathname}${window.location.search}#${id}`
 window.history.pushState(null, '', nextUrl)
 document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
 }

 return (
 <h2
 id={id}
 className={cn(
 'group relative text-[25px] font-semibold leading-tight text-ink [scroll-margin-top:116px] sm:text-[30px] xl:[scroll-margin-top:90px]',
 tight ? 'mb-[18px] mt-2' : 'mb-[18px] mt-11 sm:mt-[58px]',
 )}
 >
 <a
 href={`#${id}`}
 onClick={handleClick}
 className="relative inline-flex items-baseline text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-green/30 focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
 >
 <span
 aria-hidden="true"
 className="pointer-events-none absolute -left-5 top-[0.1em] font-mono text-[0.78em] text-green opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:-left-7"
 >
 #
 </span>
 {children}
 </a>
 </h2>
 )
}

function P({ children }: { children: ReactNode }) {
return <p className="m-0 mb-3.5 text-[16px] leading-[1.72] text-ink-soft sm:text-[17px] sm:leading-[1.78]">{children}</p>
}

function setMermaidDiagramLayout(container: HTMLDivElement) {
  const svg = container.querySelector('svg')
  const viewBox = svg?.getAttribute('viewBox')?.split(/\s+/).map(Number)
  if (!svg || !viewBox || viewBox.length !== 4 || viewBox.some(Number.isNaN)) {
    container.dataset.diagramLayout = 'standard'
    return
  }

  const [, , width, height] = viewBox
  const ratio = width / Math.max(height, 1)
  container.dataset.diagramLayout = ratio > 1.45 ? 'wide' : ratio < 0.78 ? 'vertical' : 'standard'
}

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modalContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const diagramIdRef = useRef(`mobench-diagram-${Math.random().toString(36).slice(2)}`)
  const expandedDiagramIdRef = useRef(`mobench-diagram-expanded-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false

    async function renderInlineDiagram() {
      if (!containerRef.current) return

      try {
        setError(null)
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'neutral',
          fontFamily: 'Geist, system-ui, sans-serif',
        })

const id = diagramIdRef.current
        const { svg } = await mermaid.render(id, chart)
if (!cancelled && containerRef.current) {
containerRef.current.innerHTML = svg
setMermaidDiagramLayout(containerRef.current)
}
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Unable to render diagram')
        }
      }
    }

    renderInlineDiagram()

    return () => {
      cancelled = true
    }
  }, [chart])

  useEffect(() => {
    if (!open || !modalContainerRef.current) return

    let cancelled = false

    async function renderModalDiagram() {
      if (!modalContainerRef.current) return

      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'neutral',
        fontFamily: 'Geist, system-ui, sans-serif',
      })

const id = expandedDiagramIdRef.current
      const { svg } = await mermaid.render(id, chart)
if (!cancelled && modalContainerRef.current) {
modalContainerRef.current.innerHTML = svg
setMermaidDiagramLayout(modalContainerRef.current)
}
    }

    renderModalDiagram()

    return () => {
      cancelled = true
    }
  }, [chart, open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <div className="group relative my-6 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.10)] bg-white p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-3 right-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[rgba(20,18,12,0.14)] bg-white/92 text-green shadow-[0_12px_30px_-20px_rgba(20,18,12,0.55)] backdrop-blur transition hover:border-green/45 hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/35"
          aria-label="Expand diagram"
          title="Expand diagram"
        >
          <Maximize2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in text-left"
          aria-label="Expand diagram"
        >
          <div ref={containerRef} className="mermaid-diagram min-h-[120px] overflow-x-auto pb-8" />
        </button>
        {error && (
          <div className="mt-3 rounded-lg border border-amber/25 bg-amber/10 px-3 py-2 text-[13px] leading-[1.45] text-ink-soft">
            Diagram render failed. Mermaid source shown below.
          </div>
        )}
        {error && (
          <pre className="mt-3 max-w-full overflow-x-auto rounded-lg bg-leaf p-3 font-mono text-[12px] leading-[1.6] text-code">
            {chart}
          </pre>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/55 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Expanded diagram">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(244,239,221,0.16)] bg-cream shadow-[0_24px_90px_-34px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(20,18,12,0.10)] px-4 py-3 sm:px-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Expanded diagram</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[rgba(20,18,12,0.14)] bg-white text-ink hover:border-green/40 hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/35"
                aria-label="Close expanded diagram"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
              <div ref={modalContainerRef} className="mermaid-diagram mermaid-diagram-expanded min-h-[420px]" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Code({ children, language }: { children: string; language: string }) {
 if (language === 'mermaid') {
 return <MermaidDiagram chart={children.trim()} />
 }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.10)] bg-leaf">
      <div className="border-b border-[rgba(20,18,12,0.08)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        {language}
      </div>
      <SyntaxHighlightedCode className={cn(`language-${language}`, 'max-w-full overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.8] text-code sm:px-5 sm:text-[13.5px]')}>
        {children.trimEnd()}
      </SyntaxHighlightedCode>
    </div>
 )
}

function CodeVariants({ variants }: { variants: NonNullable<Section['codeVariants']> }) {
 const [activeId, setActiveId] = useState(variants[0]?.id ?? '')
 const active = variants.find((variant) => variant.id === activeId) ?? variants[0]

 if (!active) return null

 return (
 <div className="my-5">
 <div className="mb-3 inline-flex flex-wrap gap-1 rounded-xl border border-[rgba(20,18,12,0.10)] bg-white p-1">
 {variants.map((variant) => {
 const selected = variant.id === active.id
 return (
 <button
 key={variant.id}
 type="button"
 onClick={() => setActiveId(variant.id)}
 className={cn(
 'h-9 cursor-pointer rounded-lg px-3.5 font-mono text-[11.5px] uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/30',
 selected ? 'bg-green text-cream shadow-[0_10px_24px_-18px_rgba(20,18,12,0.7)]' : 'text-muted hover:bg-leaf hover:text-ink',
 )}
 aria-pressed={selected}
 >
 {variant.label}
 </button>
 )
 })}
 </div>
 <Code language={active.language}>{active.value}</Code>
 </div>
 )
}

function SectionBlock({ section, first }: { section: Section; first: boolean }) {
 return (
 <section>
      <H2 id={slugify(section.title)} tight={first}>
        {section.title}
      </H2>
      {section.body?.map((paragraph, index) => (
        <P key={index}>{paragraph}</P>
      ))}
{section.bullets && (
<ul className="mb-5 mt-2 space-y-2.5 pl-5 text-[15.5px] leading-[1.65] text-ink-soft sm:text-[16.5px]">
{section.bullets.map((item, index) => (
<li key={index} className="pl-1">
{item}
</li>
))}
</ul>
)}
{section.image && (
<figure className="mb-6 mt-5 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.10)] bg-white shadow-[0_24px_70px_-46px_rgba(20,18,12,0.45)]">
<img src={section.image.src} alt={section.image.alt} className="block w-full" loading="lazy" />
{section.image.caption && (
<figcaption className="border-t border-[rgba(20,18,12,0.08)] px-4 py-3 text-[13px] leading-[1.55] text-muted sm:px-5">
{section.image.caption}
</figcaption>
)}
</figure>
)}
{section.codeVariants && <CodeVariants variants={section.codeVariants} />}
{section.code && <Code language={section.code.language}>{section.code.value}</Code>}
</section>
 )
}

function ExternalButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.14)] bg-white px-3 text-[13px] font-medium text-ink no-underline hover:border-green/40 hover:bg-green/5"
    >
      {children}
      <ExternalLink size={14} />
    </a>
  )
}

function RepoPath({ path }: { path: string }) {
  return (
    <a
      href={`${GITHUB_REPO}/tree/main/${path}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-code underline decoration-green/25 underline-offset-4 hover:text-green hover:decoration-green/60"
    >
      {path}
    </a>
  )
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-green underline decoration-green/25 underline-offset-4 hover:decoration-green/60"
    >
      {children}
    </a>
  )
}

function BrandLink({
  href,
  logo,
  children,
}: {
  href: string
  logo: BrandLogoName
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(20,18,12,0.12)] bg-white px-2 py-1 text-[13px] font-medium text-ink no-underline shadow-[0_8px_22px_-20px_rgba(20,18,12,0.5)] hover:border-green/35 hover:bg-green/5"
    >
      <BrandLogo logo={logo} />
      {children}
    </a>
  )
}

function BrandLogo({ logo }: { logo: BrandLogoName }) {
  const asset = BRAND_LOGOS[logo]
  return (
    <span className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-[4px] bg-white p-[1px]" aria-hidden="true">
      <img src={asset.src} alt="" className="h-full w-full object-contain" />
    </span>
  )
}

function DocsSearchDialog({
  open,
  query,
  results,
  onQueryChange,
  onSelect,
  onClose,
}: {
  open: boolean
  query: string
  results: SearchEntry[]
  onQueryChange: (query: string) => void
  onSelect: (entry: SearchEntry) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 p-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Search docs">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Close search" onClick={onClose} />
      <div className="relative mx-auto mt-[8vh] w-full max-w-[720px] overflow-hidden rounded-xl border border-[rgba(20,18,12,0.12)] bg-white text-ink shadow-[0_32px_100px_-42px_rgba(20,18,12,0.75)]">
        <div className="flex items-center gap-3 border-b border-[rgba(20,18,12,0.10)] px-4 py-3 sm:px-5">
          <Search size={18} className="flex-none text-green" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
              if (event.key === 'Enter' && results[0]) {
                event.preventDefault()
                onSelect(results[0])
              }
            }}
            placeholder="Search docs"
            className="h-10 min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-green/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/30"
            aria-label="Close search"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[min(560px,70vh)] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => {
                const ResultIcon = result.page.icon
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => onSelect(result)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-green/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/30"
                  >
                    <ResultIcon className="mt-0.5 h-[17px] w-[17px] flex-none text-green" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-medium text-ink">{result.title}</span>
                      <span className="mt-1 block line-clamp-2 text-[12.5px] leading-[1.4] text-muted">{result.subtitle}</span>
                    </span>
                    {result.sectionTitle && <span className="mt-0.5 rounded-md bg-leaf px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-green">Section</span>}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <div className="text-[15px] font-medium text-ink">No docs found</div>
              <div className="mt-1 text-[13px] text-muted">Try a crate, command, provider, schema, or artifact name.</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[rgba(20,18,12,0.08)] px-4 py-2.5 font-mono text-[11px] text-faint sm:px-5">
          <span>Enter to open first result</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}

export function Docs({ initialPage = 'overview' }: { initialPage?: PageId }) {
 const navigate = useNavigate()
 const [page, setPage] = useState<PageId>(initialPage)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const active = PAGES.find((item) => item.id === page) ?? PAGES[0]
  const activeIndex = PAGES.findIndex((item) => item.id === active.id)
  const prev = activeIndex > 0 ? PAGES[activeIndex - 1] : null
  const next = activeIndex < PAGES.length - 1 ? PAGES[activeIndex + 1] : null
  const groups = groupedPages()
  const sections = [...CONTENT[active.id], ...(EXTRA_CONTENT[active.id] ?? [])]
  const ActiveIcon = active.icon
  const searchEntries = useMemo(() => buildSearchEntries(), [])
  const searchResults = useMemo(() => searchDocs(searchEntries, searchQuery), [searchEntries, searchQuery])

 useEffect(() => {
 setPage(initialPage)
 }, [initialPage])

 useEffect(() => {
 const scrollToHash = (behavior: ScrollBehavior) => {
 const rawHash = window.location.hash.slice(1)
 if (!rawHash) return
 const hash = decodeURIComponent(rawHash)

 window.requestAnimationFrame(() => {
 document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior })
 })
 }

 scrollToHash('auto')

 const onHashChange = () => scrollToHash('smooth')
 window.addEventListener('hashchange', onHashChange)
 return () => window.removeEventListener('hashchange', onHashChange)
 }, [active.id])

 const go = (id: PageId) => {
 setPage(id)
 void navigate({ to: docsPathForPage(id) })
 window.scrollTo({ top: 0, behavior: 'smooth' })
 }

  const selectSearchResult = (entry: SearchEntry) => {
 setPage(entry.page.id)
 setSearchOpen(false)
 setSearchQuery('')
 void navigate({ to: docsPathForPage(entry.page.id), hash: entry.sectionTitle ? slugify(entry.sectionTitle) : undefined })

 window.setTimeout(() => {
      if (entry.sectionTitle) {
        document.getElementById(slugify(entry.sectionTitle))?.scrollIntoView({ block: 'start', behavior: 'smooth' })
        return
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable)

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        return
      }

      if (event.key === '/' && !isEditable) {
        event.preventDefault()
        setSearchOpen(true)
        return
      }

      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-cream text-ink">
      <DocsSearchDialog
        open={searchOpen}
        query={searchQuery}
        results={searchResults}
        onQueryChange={setSearchQuery}
        onSelect={selectSearchResult}
        onClose={() => setSearchOpen(false)}
      />
      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,12,0.09)] bg-[var(--mb-header-bg)] backdrop-blur-[14px]">
        <div className="flex h-[60px] items-center justify-between gap-4 px-5 sm:px-7">
          <div className="flex items-center gap-2.5">
            <a href={LANDING_URL} className="text-[18px] font-semibold tracking-[-0.035em] text-ink no-underline transition-colors hover:text-green">
              mobench
            </a>
            <Link to="/docs" className="rounded-md border border-[rgba(20,18,12,0.14)] bg-white px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted no-underline transition-colors hover:border-green/35 hover:text-green">docs</Link>
            <Link to="/docs" className="rounded-md border border-[rgba(20,18,12,0.14)] bg-white px-2 py-1 font-mono text-[10.5px] tracking-[0.02em] text-muted no-underline transition-colors hover:border-green/35 hover:text-green">{MOBENCH_VERSION}</Link>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 min-w-[280px] max-w-[430px] flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.10)] bg-white px-3 text-left text-muted transition-colors hover:border-green/35 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/30 lg:flex"
          >
            <Search size={15} />
            <span className="flex-1 text-[13.5px]">Search docs</span>
            <kbd className="rounded border border-[rgba(20,18,12,0.10)] px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>
          </button>

          <div className="flex items-center gap-3 text-[13.5px] text-muted sm:gap-4">
            <ThemeToggle />
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-inherit no-underline">
              <span className="hidden sm:inline">Source</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[290px] flex-none overflow-y-auto border-r border-[rgba(20,18,12,0.08)] px-5 pb-12 pt-7 xl:block">
          {Object.entries(groups).map(([group, pages]) => (
            <div key={group} className="mb-7">
              <div className="mb-2 px-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest">{group}</div>
              <div className="space-y-1">
                {pages.map((item) => {
                  const ItemIcon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.id)}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] leading-[1.35] transition-colors',
                        item.id === active.id ? 'bg-green/10 font-medium text-green' : 'text-muted hover:bg-green/5 hover:text-ink',
                      )}
                    >
                      <ItemIcon className="mt-[2px] h-[14px] w-[14px] flex-none" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </aside>

        <main className="mb-scroll flex min-h-[calc(100vh-60px)] w-full min-w-0 flex-1 justify-center px-5 pb-20 pt-9 sm:px-7 sm:pt-12 xl:px-12 xl:pb-[130px] xl:pt-14">
          <article className="w-full max-w-[920px]" data-docs-article>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.08em] text-green">
                  <ActiveIcon className="h-[14px] w-[14px]" />
                  {active.group}
                </div>
                <h1 className="m-0 text-[clamp(34px,10vw,52px)] font-semibold leading-[1.04] text-ink">{active.label}</h1>
                <p className="mt-4 max-w-[760px] text-[17px] leading-[1.65] text-ink-soft sm:text-[18px]">{active.description}</p>
              </div>
              <div className="shrink-0 pt-1">
                <DocsActions active={active} />
              </div>
            </div>

            {active.id === 'overview' && (
              <div className="mb-9 flex flex-wrap gap-2">
          <ExternalButton href={DOCSRS.mobench}>mobench API</ExternalButton>
          <ExternalButton href={DOCSRS.sdk}>SDK API</ExternalButton>
          <ExternalButton href={DOCSRS.macros}>Macro API</ExternalButton>
          <ExternalButton href={DEEPWIKI_URL}>DeepWiki / Devin</ExternalButton>
        </div>
      )}

            {sections.map((section, index) => (
              <SectionBlock key={section.title} section={section} first={index === 0} />
            ))}

            <div className="mt-16 flex flex-col justify-between gap-4 border-t border-[rgba(20,18,12,0.1)] pt-7 sm:flex-row">
              {prev ? (
                <button
                  type="button"
                  onClick={() => go(prev.id)}
                  className="cursor-pointer rounded-lg border border-[rgba(20,18,12,0.10)] bg-white px-4 py-3 text-left hover:border-green/35 hover:bg-green/5 sm:w-[48%]"
                >
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faintest">Previous</div>
                  <div className="mt-1 text-[15px] font-medium text-ink">{prev.label}</div>
                </button>
              ) : (
                <span className="sm:w-[48%]" />
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => go(next.id)}
                  className="cursor-pointer rounded-lg border border-[rgba(20,18,12,0.10)] bg-white px-4 py-3 text-left hover:border-green/35 hover:bg-green/5 sm:w-[48%]"
                >
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faintest">Next</div>
                  <div className="mt-1 text-[15px] font-medium text-ink">{next.label}</div>
                </button>
              )}
            </div>
          </article>
        </main>

        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[226px] flex-none overflow-y-auto px-6 pb-12 pt-[60px] 2xl:block">
          <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest">On page</div>
          <div className="space-y-1.5">
            {sections.map((section) => {
              const label = section.title

              return (
              <a key={label} href={`#${slugify(label)}`} className="block rounded-md px-2 py-1.5 text-[13px] leading-[1.35] text-muted no-underline hover:bg-green/5 hover:text-green">
                {label}
              </a>
              )
            })}
          </div>

        </aside>
      </div>
    </div>
  )
}
