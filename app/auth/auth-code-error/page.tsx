export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          There was an error with the authentication code. Please try signing in
          again.
        </p>
        <div className="mt-5">
          <a
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Go back to home
          </a>
        </div>
      </div>
    </div>
  );
}
