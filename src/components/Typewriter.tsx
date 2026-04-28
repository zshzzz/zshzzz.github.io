import { useEffect, useState } from 'react'

interface TypewriterProps {
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}

export default function Typewriter({
  phrases,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseDuration = 2200,
}: TypewriterProps) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(current.slice(0, text.length + 1))
          if (text.length + 1 === current.length) {
            setTimeout(() => setIsDeleting(true), pauseDuration)
          }
        } else {
          setText(current.slice(0, text.length - 1))
          if (text.length - 1 === 0) {
            setIsDeleting(false)
            setPhraseIndex((i) => (i + 1) % phrases.length)
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed
    )

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseDuration])

  return (
    <span className="typewriter">
      {text}
      <span className="typewriter-cursor" aria-hidden="true">|</span>
    </span>
  )
}
