import { RegisterForm } from "@/components/auth/register-form"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <RegisterForm />
      </div>
    </AuthGuard>
  )
}
