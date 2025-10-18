import { AuthForm } from '@/components/auth-form'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <main className="flex flex-col items-center gap-8 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Database Management
          </h1>
          <p className="text-muted-foreground">
            Secure authentication with email verification
          </p>
        </div>
        <AuthForm />
      </main>
    </div>
  )
}

