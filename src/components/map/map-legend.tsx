import type { ReactNode } from 'react'
import { useI18n } from '@/i18n/language-context'

function Swatch({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  )
}

export function MapLegend() {
  const { t } = useI18n()
  const items: { key: string; label: string; icon: ReactNode }[] = [
    {
      key: 'room',
      label: t.types.room,
      icon: <rect x="2" y="2" width="14" height="14" rx="3" fill="#1b2a3d" stroke="#5b6f88" strokeWidth="1.5" />,
    },
    {
      key: 'junction',
      label: t.types.junction,
      icon: <circle cx="9" cy="9" r="5.5" fill="#1a2330" stroke="#5b6f88" strokeWidth="1.5" />,
    },
    {
      key: 'exit',
      label: t.types.exit,
      icon: <path d="M17 9 13 15.9H5L1 9 5 2.1H13Z" fill="#0d2a1f" stroke="var(--exit)" strokeWidth="1.5" />,
    },
    {
      key: 'route',
      label: t.states.route,
      icon: <line x1="1" y1="9" x2="17" y2="9" stroke="var(--route)" strokeWidth="3.5" strokeLinecap="round" />,
    },
    {
      key: 'start',
      label: t.states.start,
      icon: <circle cx="9" cy="9" r="6.5" fill="none" stroke="var(--start)" strokeWidth="2" strokeDasharray="3 2" />,
    },
    {
      key: 'blocked',
      label: t.states.blocked,
      icon: (
        <>
          <line x1="1" y1="9" x2="17" y2="9" stroke="var(--hazard)" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M6 6 12 12M12 6 6 12" stroke="var(--hazard)" strokeWidth="2" strokeLinecap="round" />
        </>
      ),
    },
    {
      key: 'closed',
      label: t.states.closed,
      icon: (
        <>
          <path d="M17 9 13 15.9H5L1 9 5 2.1H13Z" fill="#161c24" stroke="#6b7787" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M6.5 6.5 11.5 11.5M11.5 6.5 6.5 11.5" stroke="#8a96a6" strokeWidth="1.75" strokeLinecap="round" />
        </>
      ),
    },
  ]

  return (
    <div
      className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg border bg-card/90 px-3 py-2 backdrop-blur"
      aria-label={t.map.legend}
      role="group"
    >
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5">
            <Swatch>{item.icon}</Swatch>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
