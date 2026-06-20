import { useState } from 'react'

import { FeedbackPanel } from './FeedbackPanel'
import { ChoiceCard } from './cards/ChoiceCard'
import { ClozeCard } from './cards/ClozeCard'
import { OrderCard } from './cards/OrderCard'
import { WriteCard } from './cards/WriteCard'

import { grade, answerText, type UserAnswer } from '@/modules/practice/domain/grading'
import { schedule, type CardState } from '@/modules/practice/domain/srs'
import { loadStates, saveState } from '@/modules/practice/domain/store'
import type { Card } from '@/shared/content/types'
import { getRationale } from '@/shared/domain/rationale'


export interface SessionSummary { correct: number; wrong: number; total: number }

interface Feedback { correct: boolean; correctText: string; rationaleRef: string; fromBox: number; toBox: number; rationale?: string }

export function SessionRunner({
  queue, rationaleMap, today, onDone,
}: {
  queue: Card[]
  rationaleMap: Map<string, string>
  today: string
  onDone: (s: SessionSummary) => void
}) {
  const [i, setI] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const card = queue[i]

  // Shared resolver: schedule the SRS update from a correctness signal (auto-graded
  // for objective types, self-judged for text types) and build the feedback panel.
  const resolve = async (correct: boolean) => {
    if (!card) return
    const states = await loadStates()
    const prev: CardState | undefined = states[card.id]
    const next = schedule(prev, correct ? 'correct' : 'wrong', today)
    await saveState(card.id, next)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    const rationale = getRationale(card.rationaleRef, rationaleMap)
    setFb({
      correct,
      correctText: answerText(card),
      rationaleRef: card.rationaleRef,
      ...(rationale !== undefined ? { rationale } : {}),
      fromBox: prev?.box ?? 1,
      toBox: next.box,
    })
  }

  // Objective types judge the typed/selected answer; text types are judged by the learner.
  const answer = (ua: UserAnswer) => {
    if (!card) return
    void resolve(grade(card, ua).correct)
  }

  const cont = () => {
    setFb(null)
    if (i + 1 >= queue.length) onDone({ ...score, total: queue.length })
    else setI(i + 1)
  }

  if (!card) return null
  if (fb) return <FeedbackPanel {...fb} onContinue={cont} />

  switch (card.type) {
    case 'ordenar': return <OrderCard card={card} onAnswer={answer} />
    case 'cloze': return <ClozeCard card={card} onResolve={resolve} />
    case 'elegir': return <ChoiceCard card={card} onAnswer={answer} />
    default: return <WriteCard card={card} onResolve={resolve} />
  }
}
