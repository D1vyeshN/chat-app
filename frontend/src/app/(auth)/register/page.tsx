// src/app/(auth)/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <RegisterForm />
    </main>
  )
}