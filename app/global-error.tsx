"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
          Something went wrong!
        </h2>
        {error.digest && (
          <p className="mt-2 text-sm text-slate-500 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
