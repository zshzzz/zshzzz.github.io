import { useEffect, useState } from 'react'

interface TypewriterProps {
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}

export default function Typewriter({
  phrases,
  typeSpeed = 72,
  deleteSpeed = 36,
  pauseDuration = 2200,
}: TypewriterProps) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!phrases.length) return
    const current = phrases[phraseIndex % phrases.length]
    let timeoutId: ReturnType<typeof setTimeout>

    if (!isDeleting && text === current) {
      timeoutId = setTimeout(() => setIsDeleting(true), pauseDuration)
    } else if (isDeleting && text === '') {
      setIsDeleting(false)
      setPhraseIndex((i) => (i + 1) % phrases.length)
    } else {
      timeoutId = setTimeout(
        () => {
          const nextLen = text.length + (isDeleting ? -1 : 1)
          setText(current.slice(0, nextLen))
        },
        isDeleting ? deleteSpeed : typeSpeed
      )
    }

    return () => clearTimeout(timeoutId)
  }, [text, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseDuration])

  return (
    <span className="typewriter">
      {text}
      <span className="typewriter-cursor" aria-hidden="true">
        |
      </span>
    </span>
  )
}
