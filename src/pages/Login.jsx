import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import { login } from '../api/auth.js'
import { useClinicProfile } from '../context/ClinicProfileContext.jsx'
import logo from '../assets/logo.png'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { profile: clinicProfile } = useClinicProfile()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect username or password.')
      } else if (err.request) {
        setError("Couldn't reach the server. Make sure the backend is running.")
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-primary-500 p-10 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute bottom-0 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <img
              src={clinicProfile?.logoDataUrl || logo}
              alt={clinicProfile?.name || 'Devs Hair & Skin Clinic'}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-contain bg-white mb-6"
            />
            <h2 className="text-2xl font-bold leading-snug">{clinicProfile?.name || 'Devs Hair & Skin Clinic'}</h2>
            <p className="text-primary-100 mt-2 text-sm">{clinicProfile?.tagline}</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-primary-100 text-xs">
            <Sparkles size={14} />
            <span>Manage patients, billing & inventory in one place</span>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Sign in to manage your clinic</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-500">
                <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-200" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-primary-600 font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
