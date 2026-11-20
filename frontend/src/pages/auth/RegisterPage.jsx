import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import Spinner from '../../components/common/Spinner'
import AuthShell from '../../components/auth/AuthShell'
import {
  AuthField,
  PasswordStrength,
  PasswordToggle,
  usePasswordVisibility,
} from '../../components/auth/AuthField'

const isGoogleConfigured =
  Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID) &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'

const ROLE_OPTIONS = [
  { value: ROLES.BORROWER, label: 'Borrower', hint: 'Apply & repay loans' },
  { value: ROLES.AGENT, label: 'Agent', hint: 'Manage borrowers' },
]

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function RegisterPage() {
  const { registerUser, googleLogin } = useAuth()
  const navigate = useNavigate()
  const password = usePasswordVisibility()
  const [submitting, setSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState(ROLES.BORROWER)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  })

  const passwordValue = watch('password')

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setSubmitting(true)
        await googleLogin(credentialResponse)
        // New Google users are registered with BORROWER role by the backend
        toast.success('Account created successfully!')
        navigate('/borrower/dashboard', { replace: true })
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Google login failed. Please try again.'
        )
      } finally {
        setSubmitting(false)
      }
    },
    onError: () => {
      toast.error('Google login failed. Please try again.')
    },
    flow: 'auth-code',
  })

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await registerUser({ ...values, role: selectedRole })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join PayVault and take control of your finances"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cred-gold hover:text-cred-gold-light">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          id="name"
          label="Full name"
          autoComplete="name"
          error={errors.name}
          registerProps={register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />

        <AuthField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email}
          registerProps={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
        />

        <AuthField
          id="password"
          label="Password"
          type={password.type}
          autoComplete="new-password"
          error={errors.password}
          registerProps={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
          rightSlot={<PasswordToggle visible={password.visible} onToggle={password.toggle} />}
        />
        {!errors.password && <PasswordStrength value={passwordValue} />}

        <div className="mb-6">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cred-text-muted">
            I am a
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((option) => {
              const active = selectedRole === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  aria-pressed={active}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${
                    active
                      ? 'border-cred-gold/70 bg-cred-gold/10 shadow-cred-gold'
                      : 'border-cred-border bg-cred-elevated/50 hover:border-cred-gold/30'
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${
                      active ? 'text-cred-gold' : 'text-white'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-cred-text-muted">
                    {option.hint}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gold-gradient py-4 text-sm font-bold tracking-[0.08em] text-black transition-all duration-200 hover:shadow-cred-gold-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
          {submitting ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <span className="relative">CREATE ACCOUNT</span>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-cred-text-muted">
          By continuing you agree to PayVault&apos;s Terms of Service and Privacy Policy.
        </p>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-cred-border" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-cred-text-muted">or</span>
        <div className="h-px flex-1 bg-cred-border" />
      </div>

      {isGoogleConfigured ? (
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-cred-border bg-cred-elevated/50 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-cred-gold/60 hover:bg-cred-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      ) : (
        <button
          type="button"
          disabled
          title="Google OAuth not configured"
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-cred-border bg-cred-elevated/50 py-3.5 text-sm font-medium text-white opacity-50"
        >
          <GoogleIcon />
          Continue with Google (Not Configured)
        </button>
      )}
    </AuthShell>
  )
}
