import { useEffect, useRef, useState } from 'react'
import { applyTheme, type Theme } from '../lib/theme'
import { contactLinks, profile } from '../siteData'

interface Line {
  type: 'input' | 'output' | 'system'
  text: string
}

const WELCOME = [
  '  zshzzz · apparatus',
  '  ────────────────────',
  `  ${profile.manifesto}`,
  '',
  '  type "help" for commands.',
  '',
]

const FORTUNES = [
  '代码写得好，注释才敢少。',
  '先让它跑起来，再让它跑得漂亮。',
  '分布式系统的终极真理：总会有节点挂掉。',
  'Vibe Coding：先 vibes，再 specs。',
  '最好的架构，是明天还能看懂的架构。',
  '日志是未来的你写给现在的你的信。',
  '没有银弹，只有银勺子——一勺一勺调。',
  '数据不说谎，但管道会。',
]

const COW_TEMPLATE = (text: string) => {
  const maxLen = Math.min(Math.max(text.length, 1), 40)
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen))
  }
  if (!chunks.length) chunks.push('...')
  const width = Math.max(...chunks.map((l) => l.length), 1)
  const border = ' ' + '_'.repeat(width + 2)
  const dash = ' ' + '-'.repeat(width + 2)
  const bubble =
    chunks.length === 1
      ? [`< ${chunks[0].padEnd(width)} >`]
      : [
          `/ ${chunks[0].padEnd(width)} \\`,
          ...chunks.slice(1, -1).map((l) => `| ${l.padEnd(width)} |`),
          `\\ ${chunks[chunks.length - 1].padEnd(width)} /`,
        ]

  return [
    border,
    ...bubble,
    dash,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ].join('\n')
}

function processCommand(input: string): string[] {
  const parts = input.trim().split(/\s+/)
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1).join(' ')

  switch (cmd) {
    case 'help':
      return [
        'commands:',
        '',
        '  whoami        identity',
        '  skills        materials',
        '  projects      directions',
        '  contact       signals',
        '  neofetch      system postcard',
        '  date          beijing time',
        '  fortune       one line',
        '  theme <name>  void | ink',
        '  cowsay <msg>  classic nonsense',
        '  play          scroll to exhibits',
        '  clear         wipe',
        '  help          this list',
      ]

    case 'whoami':
      return [profile.name, profile.eyebrow, profile.location, '', profile.summary]

    case 'skills':
      return [
        'materials:',
        '',
        '  language     Python, Go, SQL, Shell',
        '  data         Spark, Flink, Kafka, Hive',
        '  store        PostgreSQL, Redis, ClickHouse, MongoDB',
        '  systems      microservices, distributed, event-driven',
        '  craft        Docker, K8s, Git, CI/CD',
      ]

    case 'projects':
      return [
        'directions:',
        '',
        '  1. data platforms   pipelines · ETL · realtime',
        '  2. backend systems  concurrency · services · distribution',
        '  3. data engineering warehouses · quality · governance',
        '  4. vibe coding      fast experiments with AI',
        '',
        '  (day-job repos stay private — only personal toys here)',
      ]

    case 'contact':
      return [
        'signals:',
        '',
        ...contactLinks.map((l) => `  ${l.label.padEnd(8)} ${l.value}`),
      ]

    case 'neofetch':
      return [
        `          .--.          ${profile.name}@exhibit`,
        "       .-'    '-.       ---------------",
        '      /  .--.    \\      OS: Browser / Vite / React',
        `     |  (    )    |     Host: ${profile.location}`,
        `      \\  '--'    /      Shell: apparatus 1.0`,
        `       '-.____.-'       Theme: ${document.documentElement.getAttribute('data-theme') || 'void'}`,
        `                        Status: ${profile.status}`,
        '                        Mode: kinetic type',
      ]

    case 'date':
      return [new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })]

    case 'fortune':
      return [FORTUNES[Math.floor(Math.random() * FORTUNES.length)]]

    case 'theme': {
      const map: Record<string, Theme> = {
        default: 'default',
        void: 'default',
        ink: 'ink',
      }
      const next = map[args]
      if (!next) {
        return [`unknown theme "${args}". try: void | ink`]
      }
      applyTheme(next)
      return [`theme → ${args === 'default' ? 'void' : args}`]
    }

    case 'cowsay':
      if (!args) return ['usage: cowsay <msg>']
      return [COW_TEMPLATE(args)]

    case 'play':
    case 'matrix':
      document.getElementById('exhibits')?.scrollIntoView({ behavior: 'smooth' })
      return ['entering exhibits…']

    case 'clear':
      return []

    case '':
      return []

    default:
      return [`command not found: ${cmd}. type "help".`]
  }
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(() =>
    WELCOME.map((text) => ({ type: 'system', text }))
  )
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return

    const newLines: Line[] = [...lines, { type: 'input', text: cmd }]

    if (cmd.toLowerCase() === 'clear') {
      setLines([])
    } else {
      const output = processCommand(cmd)
      setLines([...newLines, ...output.map((text) => ({ type: 'output' as const, text }))])
    }

    setHistory((h) => [cmd, ...h])
    setHistoryIdx(-1)
    setInput('')
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = historyIdx + 1
      if (next < history.length) {
        setHistoryIdx(next)
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIdx - 1
      if (next >= 0) {
        setHistoryIdx(next)
        setInput(history[next])
      } else {
        setHistoryIdx(-1)
        setInput('')
      }
    }
  }

  return (
    <div className="terminal-card" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-bar">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-title">{profile.name}@exhibit ~</span>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line terminal-${line.type}`}>
            {line.type === 'input' && <span className="terminal-prompt-mark">&gt; </span>}
            <pre>{line.text}</pre>
          </div>
        ))}
      </div>
      <form className="terminal-input-row" onSubmit={handleSubmit}>
        <span className="terminal-prompt-mark">&gt;</span>
        <input
          ref={inputRef}
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal input"
          placeholder="help"
        />
      </form>
    </div>
  )
}
