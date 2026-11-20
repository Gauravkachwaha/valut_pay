import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cred-elevated px-6 text-center">
      <p className="text-6xl font-extrabold text-cred-gold">403</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Unauthorized</h1>
      <p className="mt-2 max-w-md text-cred-text-secondary">
        You don&apos;t have permission to access this page. Please sign in with an account that
        has the correct role.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-cred-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-cred-gold"
      >
        Back to Login
      </Link>
    </div>
  )
}
