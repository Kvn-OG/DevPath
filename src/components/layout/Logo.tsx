export function Logo() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
      <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--dp-accent-soft)" />
        <path d="M10 11l-4 5 4 5M22 11l4 5-4 5M18 9l-4 14" stroke="var(--dp-accent-strong)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      DevPath
    </span>
  );
}
