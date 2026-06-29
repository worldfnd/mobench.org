import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'const',
  'crate',
  'else',
  'enum',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'true',
  'type',
  'use',
  'where',
  'while',
])

const TYPES = new Set([
  'AndroidBuilder',
  'BenchError',
  'BenchmarkBuilder',
  'BenchSample',
  'BenchSpec',
  'BenchSummary',
  'BuildConfig',
  'BuildProfile',
  'BuildResult',
  'DeviceSelection',
  'IosBuilder',
  'MobileTarget',
  'Option',
  'Report',
  'Result',
  'RunRequest',
  'RunResult',
  'RunnerReport',
  'SemanticPhase',
  'SigningMethod',
  'String',
  'Target',
  'Vec',
])

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function span(className: string, value: string) {
  return `<span class="${className}">${escapeHtml(value)}</span>`
}

function highlightText(value: string) {
  let html = ''
  const tokenPattern = /--[A-Za-z0-9_-]+|[A-Za-z_][A-Za-z0-9_]*!?|\d[\d_]*(?:\.\d+)?|::|->|=>|==|!=|<=|>=|[{}()[\].,;:=<>+\-*/&|?]|\s+|./g

  for (const match of value.matchAll(tokenPattern)) {
    const token = match[0]
    const index = match.index ?? 0

    if (/^\s+$/.test(token)) {
      html += token
    } else if (token.startsWith('--')) {
      html += span('code-flag', token)
    } else if (/^\d/.test(token)) {
      html += span('code-number', token)
    } else if (/^[A-Za-z_][A-Za-z0-9_]*!?$/.test(token)) {
      const bare = token.endsWith('!') ? token.slice(0, -1) : token
      const following = value.slice(index + token.length).trimStart()

      if (token.endsWith('!')) {
        html += span('code-macro', token)
      } else if (KEYWORDS.has(token)) {
        html += span('code-keyword', token)
      } else if (TYPES.has(token) || /^[A-Z]/.test(token)) {
        html += span('code-type', token)
      } else if (following.startsWith('(')) {
        html += span('code-function', token)
      } else if (bare === 'cargo' || bare === 'rustup' || bare === 'export' || bare === 'println') {
        html += span('code-command', token)
      } else {
        html += escapeHtml(token)
      }
    } else if (/^(::|->|=>|==|!=|<=|>=|[{}()[\].,;:=<>+\-*/&|?])$/.test(token)) {
      html += span('code-operator', token)
    } else {
      html += escapeHtml(token)
    }
  }

  return html
}

function splitRustSegments(line: string) {
  const segments: { kind: 'text' | 'string' | 'comment' | 'attribute'; value: string }[] = []
  let cursor = 0

  while (cursor < line.length) {
    if (line.startsWith('//', cursor)) {
      segments.push({ kind: 'comment', value: line.slice(cursor) })
      break
    }

    if (line.startsWith('#[', cursor)) {
      const end = line.indexOf(']', cursor + 2)
      segments.push({ kind: 'attribute', value: line.slice(cursor, end === -1 ? line.length : end + 1) })
      cursor = end === -1 ? line.length : end + 1
      continue
    }

    if (line[cursor] === '"') {
      let end = cursor + 1
      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2
          continue
        }
        if (line[end] === '"') {
          end += 1
          break
        }
        end += 1
      }
      segments.push({ kind: 'string', value: line.slice(cursor, end) })
      cursor = end
      continue
    }

    let next = cursor + 1
    while (next < line.length && !line.startsWith('//', next) && !line.startsWith('#[', next) && line[next] !== '"') {
      next += 1
    }
    segments.push({ kind: 'text', value: line.slice(cursor, next) })
    cursor = next
  }

  return segments
}

function highlightShellText(value: string) {
  const tokenPattern = /\$[A-Za-z_][A-Za-z0-9_]*|\$\{[^}]+}|%[A-Za-z_][A-Za-z0-9_]*%|--?[A-Za-z0-9][A-Za-z0-9_-]*|[A-Za-z0-9_.+/@:-]+|\d[\d_]*(?:\.\d+)?|[|&;()=<>]+|\s+|./g
  let html = ''
  let sawCommand = false

  for (const match of value.matchAll(tokenPattern)) {
    const token = match[0]
    const previous = value.slice(0, match.index ?? 0)
    const commandPosition = !sawCommand && !/^\s*$/.test(token) && /(^|\|\s*|&&\s*|;\s*)$/.test(previous)

    if (/^\s+$/.test(token)) {
      html += token
    } else if (/^(\$[A-Za-z_][A-Za-z0-9_]*|\$\{[^}]+}|%[A-Za-z_][A-Za-z0-9_]*%)$/.test(token)) {
      html += span('code-key', token)
    } else if (/^--?[A-Za-z0-9][A-Za-z0-9_-]*$/.test(token)) {
      html += span('code-flag', token)
    } else if (/^\d/.test(token)) {
      html += span('code-number', token)
    } else if (commandPosition && /^[A-Za-z0-9_.+/@:-]+$/.test(token)) {
      sawCommand = true
      html += span('code-command', token)
    } else if (/^[|&;()=<>]+$/.test(token)) {
      html += span('code-operator', token)
      if (/^(\||&&|;)$/.test(token)) sawCommand = false
    } else {
      html += escapeHtml(token)
    }
  }

  return html
}

function splitShellSegments(line: string) {
  const segments: { kind: 'text' | 'string' | 'comment'; value: string }[] = []
  let cursor = 0

  while (cursor < line.length) {
    if (line[cursor] === '#') {
      segments.push({ kind: 'comment', value: line.slice(cursor) })
      break
    }

    if (line[cursor] === '"' || line[cursor] === "'") {
      const quote = line[cursor]
      let end = cursor + 1
      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2
          continue
        }
        if (line[end] === quote) {
          end += 1
          break
        }
        end += 1
      }
      segments.push({ kind: 'string', value: line.slice(cursor, end) })
      cursor = end
      continue
    }

    let next = cursor + 1
    while (next < line.length && line[next] !== '#' && line[next] !== '"' && line[next] !== "'") {
      next += 1
    }
    segments.push({ kind: 'text', value: line.slice(cursor, next) })
    cursor = next
  }

  return segments
}

function highlightShellSegments(line: string) {
  return splitShellSegments(line)
    .map((segment) => {
      if (segment.kind === 'string') return span('code-string', segment.value)
      if (segment.kind === 'comment') return span('code-comment', segment.value)
      return highlightShellText(segment.value)
    })
    .join('')
}

function highlightLine(line: string, language = '') {
  const shellLike = /^(bash|zsh|sh|shell|powershell)$/i.test(language)
  if (shellLike) {
    if (/^\s*\$/.test(line)) {
      const [, indent = '', rest = ''] = line.match(/^(\s*)\$\s?(.*)$/) ?? []
      return `${escapeHtml(indent)}${span('code-prompt', '$')}${rest ? ` ${highlightShellSegments(rest)}` : ''}`
    }

    return highlightShellSegments(line)
  }

  if (/^\s*\$/.test(line)) {
    const [, indent = '', rest = ''] = line.match(/^(\s*)\$\s?(.*)$/) ?? []
    return `${escapeHtml(indent)}${span('code-prompt', '$')}${rest ? ` ${highlightText(rest)}` : ''}`
  }

  if (/^\s*[A-Za-z0-9_.-]+\s*=/.test(line)) {
    const [, indent = '', key = '', rest = ''] = line.match(/^(\s*)([A-Za-z0-9_.-]+)(\s*=.*)$/) ?? []
    return `${escapeHtml(indent)}${span('code-key', key)}${highlightRustSegments(rest)}`
  }

  return highlightRustSegments(line)
}

function highlightRustSegments(line: string) {
  return splitRustSegments(line)
    .map((segment) => {
      if (segment.kind === 'string') return span('code-string', segment.value)
      if (segment.kind === 'comment') return span('code-comment', segment.value)
      if (segment.kind === 'attribute') return span('code-attribute', segment.value)
      return highlightText(segment.value)
    })
    .join('')
}

function getCodeLines(element: HTMLElement) {
  const children = Array.from(element.children)
  if (children.length === 0) {
    return element.textContent?.split('\n') ?? []
  }
  return children.map((child) => child.textContent ?? '')
}

export function SyntaxHighlightedCode({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const lines = getCodeLines(element)
    const language = Array.from(element.classList)
      .find((className) => className.startsWith('language-'))
      ?.replace('language-', '') ?? ''
    element.innerHTML = lines.map((line) => `<div>${highlightLine(line, language)}</div>`).join('')
  }, [children, className])

  return (
    <div ref={ref} className={cn('syntax-codebox', className)}>
      {children}
    </div>
  )
}
