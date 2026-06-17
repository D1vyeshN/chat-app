// src/components/auth/RegisterForm.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(username, email, password)
      router.push('/chat')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl">
          Create account 🚀
        </CardTitle>
        <CardDescription className="text-slate-400">
          Join the chat
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-400 mb-2 block">Username</label>
            <Input
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white
               placeholder:text-slate-500 focus:border-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400 mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white
               placeholder:text-slate-500 focus:border-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400 mb-2 block">Password</label>
            <Input
              type="password"
              placeholder="min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white
               placeholder:text-slate-500 focus:border-slate-500"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-5"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>

          <p className="text-slate-400 text-sm">
            Have account?{' '}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}