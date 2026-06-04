export default function Button({ ...params }) {
  return (
    <button
      {...params}
      className={`flex items-center gap-3 rounded bg-primary px-4 py-2 font-semibold text-slate-950 shadow-sm transition-colors hover:bg-primary-300${params.className ? ` ${params.className}` : ''}`}
    >
      { params.children }
    </button>
  )
}