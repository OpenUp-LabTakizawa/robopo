export function PageLoadingShell({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-base-content/60 text-sm">{description}</p>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </div>
  )
}
