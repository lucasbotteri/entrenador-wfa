import { ActionCard } from './ActionCard'

export function ActionBank({ actions, onAct }: { actions: Array<{ id: string; text: string }>; onAct: (id: string) => void }) {
  return (
    <div>
      {actions.map(a => (
        <ActionCard key={a.id} id={a.id} text={a.text} onAct={onAct} />
      ))}
    </div>
  )
}
