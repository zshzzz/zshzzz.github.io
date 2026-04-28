import { useEffect, useState } from 'react'

function formatTime(d: Date) {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return { h, m, s }
}

function formatDate(d: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
}

function getBeijingTime() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 8 * 3600000)
}

export default function Clock() {
  const [time, setTime] = useState(getBeijingTime)

  useEffect(() => {
    const id = setInterval(() => setTime(getBeijingTime()), 1000)
    return () => clearInterval(id)
  }, [])

  const { h, m, s } = formatTime(time)
  const dateStr = formatDate(time)

  return (
    <div className="clock-widget">
      <div className="clock-label">BEIJING</div>
      <div className="clock-digits">
        <span className="clock-digit-group">{h}</span>
        <span className="clock-colon">:</span>
        <span className="clock-digit-group">{m}</span>
        <span className="clock-colon">:</span>
        <span className="clock-digit-group">{s}</span>
      </div>
      <div className="clock-date">{dateStr}</div>
    </div>
  )
}
