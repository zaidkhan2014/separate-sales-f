import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/useAuth'
import { routes } from '@/router/paths'

export default function LoginPage() {
  const navigate = useNavigate()
  const { staffLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await staffLogin({ email, password })
      navigate(routes.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please check credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Qalbi Sales Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Email</span>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="sales1@qalbi.co.in"
                aria-label="staff-email"
              />
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Password</span>
              <Input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                aria-label="staff-password"
              />
            </label>
            {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
