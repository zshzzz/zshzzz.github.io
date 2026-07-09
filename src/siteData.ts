export const profile = {
  name: 'zshzzz',
  eyebrow: 'Backend · Data · Systems',
  status: 'Open to interesting problems',
  summary:
    '后端架构与数据工程。用简洁的系统解决复杂问题，也用代码做一点无用的、有生命力的事。',
  manifesto:
    '不堆功能列表。这里是一座小型装置：字是材料，终端是器械，游戏是展品。先感受节奏，再动手。',
  location: 'Beijing / Remote',
  primaryLink: 'https://github.com/zshzzz',
  footerNote: 'Built with React + Vite. An exhibition of one.',
}

export const kineticLines: { text: string; outline?: boolean }[] = [
  { text: 'BUILD SYSTEMS' },
  { text: 'THAT FEEL ALIVE', outline: true },
  { text: 'DATA · RHYTHM · PLAY' },
  { text: 'ZSHZZZ / BEIJING', outline: true },
  { text: 'VIBE CODING' },
]

export const hotspots = [
  { label: 'Terminal', targetId: 'apparatus' },
  { label: 'Music', targetId: 'music' },
  { label: 'Play', targetId: 'exhibits' },
  { label: 'Contact', targetId: 'signal' },
]

export const sections = {
  note: { index: '01', label: 'Note', title: 'A short note.' },
  apparatus: { index: '02', label: 'Apparatus', title: 'Terminal.' },
  music: { index: '03', label: 'Sound', title: 'Room tone.' },
  exhibits: { index: '04', label: 'Exhibits', title: 'Two toys, serious.' },
  signal: { index: '05', label: 'Signal', title: 'Find me.' },
}

export const exhibits = [
  {
    id: 'life',
    index: 'A',
    title: "Conway's Life",
    blurb: '规则极简，行为不尽。点格子，改命运。',
  },
  {
    id: 'snake',
    index: 'B',
    title: 'Snake',
    blurb: '穿墙、记分、无意义的优雅循环。',
  },
]

export const contactLinks = [
  {
    label: 'GitHub',
    value: '@zshzzz',
    href: 'https://github.com/zshzzz',
  },
  {
    label: 'Email',
    value: 'zhangshenghui913@gmail.com',
    href: 'mailto:zhangshenghui913@gmail.com',
  },
]
