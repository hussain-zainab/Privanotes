export function ShieldMark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 3 27 7v8c0 8-4.7 12.8-11 14C9.7 27.8 5 23 5 15V7l11-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 16.2 14.6 19.3 21 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ShieldMark className="h-6 w-6 text-shield" />
      <span className="text-[15px] font-semibold tracking-tight text-mist-100">
        PrivaNotes <span className="text-mist-300 font-medium">AI</span>
      </span>
    </div>
  );
}
