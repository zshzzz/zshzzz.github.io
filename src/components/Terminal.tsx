import { useEffect, useRef, useState } from 'react'

interface Line {
  type: 'input' | 'output' | 'system'
  text: string
}

const WELCOME = [
  '  _____  _____ _____ _____   ____  ____  ____  _  ___  _',
  ' / __  \\/ __  /  __// ___/  /  _ \\/ __ \\/ ___// |/ _ \\/',
  '/ /_/ // /_/ /__ \\  \\__ \\  / /_// /_/ / /   /    __/ ',
  '\\____/\\____/____/ /____/ /_/   \\____//_/   /_/|_|   ',
  '',
  '  欢迎来到 zshzzz 的终端。输入 "help" 查看可用命令。',
  '',
]

const COW_TEMPLATE = (text: string) => {
  const maxLen = Math.min(text.length, 40)
  const lines: string[] = []
  for (let i = 0; i < text.length; i += maxLen) {
    lines.push(text.slice(i, i + maxLen))
  }
  const border = ' ' + '_'.repeat(maxLen + 2)
  const top = '/ ' + lines[0].padEnd(maxLen) + ' \\'
  const middle = lines.length > 1
    ? lines.slice(1).map((l) => '| ' + l.padEnd(maxLen) + ' |')
    : []
  const bottom = '\\ ' + lines[lines.length - 1].padEnd(maxLen) + ' /'
  const dash = ' ' + '-'.repeat(maxLen + 2)

  return [
    border,
    top,
    ...(lines.length > 1 ? middle : []),
    bottom,
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
        '可用命令：',
        '',
        '  whoami        - 我是谁',
        '  skills        - 技术栈',
        '  projects      - 项目方向',
        '  contact       - 联系方式',
        '  date          - 当前时间',
        '  theme <名称>  - 切换主题 (default / cyberpunk / retro)',
        '  cowsay <内容> - ASCII 牛说你说的话',
        '  clear         - 清屏',
        '  help          - 显示此帮助',
      ]

    case 'whoami':
      return [
        'zshzzz',
        '后端工程师 / Python 开发者 / 架构师',
        '北京 / 远程',
        '',
        '擅长后端架构设计与大数据处理，热衷 Vibe Coding。',
        '喜欢用简洁的方式解决复杂的问题。',
      ]

    case 'skills':
      return [
        '技术栈：',
        '',
        '  语言        Python, Go, SQL, Shell',
        '  大数据      Spark, Flink, Kafka, Hive',
        '  数据库      PostgreSQL, Redis, ClickHouse, MongoDB',
        '  架构        微服务, 分布式系统, 事件驱动',
        '  工具        Docker, K8s, Git, CI/CD',
        '  兴趣        数据工程, 系统设计, Vibe Coding',
      ]

    case 'projects':
      return [
        '主要方向：',
        '',
        '  1. 大数据平台  - 数据管道、ETL、实时计算',
        '  2. 后端架构    - 高并发、微服务、分布式系统',
        '  3. 数据工程    - 数据仓库、数据治理、数据质量',
        '  4. Vibe Coding - 用 AI 辅助快速构建有意思的项目',
        '',
        '  （公司仓库不方便展示，这里只放个人实验项目）',
      ]

    case 'contact':
      return [
        '联系方式：',
        '',
        '  GitHub   github.com/zshzzz',
        '  邮箱     zhangshenghui913@gmail.com',
      ]

    case 'date':
      return [new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })]

    case 'theme': {
      const valid = ['default', 'cyberpunk', 'retro']
      if (!valid.includes(args)) {
        return [`未知主题: "${args}"。可选: ${valid.join(', ')}`]
      }
      const root = document.documentElement
      if (args === 'default') {
        root.removeAttribute('data-theme')
      } else {
        root.setAttribute('data-theme', args)
      }
      localStorage.setItem('theme', args)
      return [`主题已切换为 "${args}"。`]
    }

    case 'cowsay':
      if (!args) return ['用法: cowsay <内容>']
      return [COW_TEMPLATE(args)]

    case 'clear':
      return []

    case '':
      return []

    default:
      return [`未找到命令: ${cmd}。输入 "help" 查看可用命令。`]
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

    const newLines: Line[] = [...lines, { type: 'input' as const, text: cmd }]

    if (cmd.toLowerCase() === 'clear') {
      setLines([])
    } else {
      const output = processCommand(cmd)
      setLines([
        ...newLines,
        ...output.map((text) => ({ type: 'output' as const, text })),
      ])
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
        <span className="terminal-title">zshzzz@homepage ~</span>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line terminal-${line.type}`}>
            {line.type === 'input' && (
              <span className="terminal-prompt-mark">&gt; </span>
            )}
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
        />
      </form>
    </div>
  )
}
