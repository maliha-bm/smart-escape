import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelSectionProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function PanelSection({ title, icon, action, className, children }: PanelSectionProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={cn('border-b p-4 last:border-b-0', className)}>
      <div className="mb-3 flex items-center gap-2">
        {icon && (
          <span className="text-muted-foreground [&_svg]:size-4" aria-hidden="true">
            {icon}
          </span>
        )}
        <h2 id={headingId} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  )
}
