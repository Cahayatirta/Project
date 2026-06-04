export default function Input({ ...params }) {
  return <input {...params} className={`block w-full px-3 py-2 rounded-md border border-black/50 text-black placeholder:text-slate-400 focus:outline-primary-500 shadow-md mt-1${params.className ? ` ${params.className}` : ''}`}  />
}