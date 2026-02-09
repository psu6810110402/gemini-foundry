import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
        404 - Not Found
      </h2>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Could not find requested resource
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
