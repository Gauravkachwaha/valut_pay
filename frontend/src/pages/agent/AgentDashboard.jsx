import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AgentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-cred-black">
      <header className="flex items-center justify-between border-b border-cred-border bg-cred-dark px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">PayVault Agent</h1>
          <p className="text-sm text-cred-text-secondary">Welcome, {user?.name}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-cred-border px-4 py-2 text-sm font-medium text-cred-text-secondary hover:border-cred-gold/50 hover:bg-cred-elevated"
        >
          Logout
        </button>
      </header>
      <main className="p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-white">Agent Dashboard</h2>
        <p className="mt-2 text-cred-text-secondary">
          Your assigned collection accounts and performance metrics will appear here.
        </p>
      </main>
    </div>
  )
}
