// UI Іконки
export function IcoArrow({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoChevron({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}
export function IcoPhone({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoMenu({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
export function IcoClose({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
export function IcoCheck({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.2l2.2 2.3 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoPin({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
export function IcoMail({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 5.5l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoClock({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoTarget({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}
export function IcoCycle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15.5 6.5A6 6 0 006 5.2M4.5 13.5A6 6 0 0014 14.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 3.5v3h-3M4.5 16.5v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoSteps({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 15h4v-4h4V7h4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoShield({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l7 3v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IcoInstagram({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="6" r="0.9" fill="currentColor" />
    </svg>
  )
}
export function IcoFacebook({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.3 7.3h-1.4c-.7 0-1.1.4-1.1 1.1V10h2.3l-.3 2h-2v5h-2v-5H6v-2h1.5V8.1C7.5 6.3 8.6 5 10.5 5h1.8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoTelegram({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17.5 2.5L2.3 9c-.9.4-.9 1-.1 1.3l3.7 1.2 1.4 4.6c.2.6.5.7.9.4l2.3-1.9 3.6 2.7c.6.4 1 .2 1.2-.5l2.3-13c.2-.8-.2-1.1-.9-.8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 11.5l8.5-7.2-9.7 6.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IcoChat({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17 10c0 3.6-3.1 6.5-7 6.5-.8 0-1.6-.1-2.3-.4L3 17l1-3.4C3.4 12.6 3 11.3 3 10c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// Іконки послуг
export const SvcDesign = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14.8 8.6L8 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.2 8.6L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.5 26a10.5 10.5 0 0117-9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1.4 3.4" />
  </svg>
)
export const SvcPlant = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 28V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 16c0-6-7-9-7-9s1 8 7 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 20c0-5 7-8 7-8s-1 7-7 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
export const SvcLawn = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M4 25h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 25c0-5 1-8 0-11M12 25c1-6 0-10 2-13M16 25c-1-5 1-9-1-12M20 25c1-6 0-9 2-12M24 25c-1-5 1-8-1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const SvcWater = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 5s7 8.5 7 13.5a7 7 0 11-14 0C9 13.5 16 5 16 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 20a3 3 0 003 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const SvcLight = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 5a8 8 0 00-4.5 14.6c.7.5 1 1.3 1 2.1V23h7v-1.3c0-.8.3-1.6 1-2.1A8 8 0 0016 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13.5 26h5M14 28.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 19l1-4 1.5 2 1.5-2 1 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 1.5v2.2M24.5 6.5l-1.6 1.6M7.5 6.5l1.6 1.6M27 14.5h-2.2M7.2 14.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const SvcPond = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <ellipse cx="16" cy="21" rx="10" ry="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 21v2c0 1.7 4.5 3 10 3s10-1.3 10-3v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 9l-2.5 3.5M16 9l2.5 3.5M16 9V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const SvcCare = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="9" cy="23" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11.2 20.8L26 8M11.2 11.2L26 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const SvcPave = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="17" y="4" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="13" width="15" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="22" width="15" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="21" y="22" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)