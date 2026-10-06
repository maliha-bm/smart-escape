import { memo, type ReactNode } from 'react'
import { Ban, Check, Lock, LockOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HazardRowProps {
  id: string
  primary: ReactNode
  secondary?: ReactNode
  icon: ReactNode
  active: boolean
  /** Visual variant of the active state. */
  variant: 'blocked' | 'closed'
  stateLabel: string
  actionLabel: string
  actionAria: string
  highlight?: boolean
  onToggle: (id: string) => void
}

function HazardRowComponent({
  id,
  primary,
  secondary,
  icon,
  active,
  variant,
  stateLabel,
  actionLabel,
  actionAria,
  highlight,
  onToggle,
}: HazardRowProps) {
  const ActionIcon = variant === 'closed' ? (active ? LockOpen : Lock) : active ? Check : Ban

  return (
    <li
      className={cn(
        'flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors duration-200',
        active
          ? variant === 'blocked'
            ? 'border-hazard/40 bg-hazard/10'
            : 'border-muted-foreground/30 bg-muted/60'
          : 'border-transparent bg-background',
        highlight && !active && 'border-route/30',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md border [&_svg]:size-3.5',
          active ? (variant === 'blocked' ? 'border-hazard/50 text-hazard' : 'text-muted-foreground') : 'text-muted-foreground',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', active && 'text-muted-foreground line-through decoration-1')}>{primary}</p>
        {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
      </div>
      <span
        className={cn(
          'hidden shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase xl:inline',
          active ? (variant === 'blocked' ? 'bg-hazard/15 text-hazard' : 'bg-muted text-muted-foreground') : 'bg-route/10 text-route',
        )}
      >
        {stateLabel}
      </span>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-pressed={active}
        aria-label={actionAria}
        className={cn(
          'inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          active
            ? 'border-border bg-secondary text-foreground hover:bg-secondary/70'
            : 'border-hazard/40 text-hazard hover:bg-hazard/10',
        )}
      >
        <ActionIcon className="size-3.5" aria-hidden="true" />
        {actionLabel}
      </button>
    </li>
  )
}

export const HazardRow = memo(HazardRowComponent)
