import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-primary-700">404</p>
      <h1 className="mt-2 text-4xl font-semibold text-slate-950">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-slate-500">
        The page you are looking for does not exist or is no longer available.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded bg-primary px-4 py-2 font-semibold text-slate-950 shadow-sm transition-colors hover:bg-primary-300"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
