export function EmptyState({ icon: Icon, title, description, hint }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {Icon ? (
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded border border-ink-600 text-mist-300">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      ) : null}
      <p className="text-[15px] font-medium text-mist-100">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-mist-300">{description}</p>
      ) : null}
      {hint ? (
        <p className="mt-1 rounded border border-ink-600 bg-ink-800 px-2.5 py-1 font-mono text-xs text-mist-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
