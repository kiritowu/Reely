'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signUp, signIn } from '@/actions/auth'
import { signUpSchema, signInSchema, type SignUpInput, type SignInInput, ALLOWED_EMAIL_DOMAINS } from '@/types'
import { Loader2, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react'

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  // Sign In Form
  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Sign Up Form
  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Sign In Mutation
  const signInMutation = useMutation({
    mutationFn: async (values: SignInInput) => {
      const result = await signIn({ email: values.email, password: values.password })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onError: (error) => {
      console.error('Sign in error:', error)
    },
  })

  // Sign Up Mutation
  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpInput) => {
      const result = await signUp({ email: values.email, password: values.password })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      setSignUpSuccess(true)
      signUpForm.reset()
    },
    onError: (error) => {
      console.error('Sign up error:', error)
    },
  })

  function onSignIn(values: SignInInput) {
    signInMutation.mutate(values)
  }

  function onSignUp(values: SignUpInput) {
    signUpMutation.mutate(values)
  }

  if (signUpSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
            <Mail className="h-6 w-6 text-chart-2" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your inbox to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Verification email sent successfully. You must verify your email before signing in.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSignUpSuccess(false)
              setActiveTab('signin')
            }}
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="space-y-4 mt-4">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            className="pl-9"
                            disabled={signInMutation.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="pl-9"
                            disabled={signInMutation.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {signInMutation.isError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {signInMutation.error instanceof Error
                        ? signInMutation.error.message
                        : 'An error occurred during sign in'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
                  {signInMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            className="pl-9"
                            disabled={signUpMutation.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Allowed domains: {ALLOWED_EMAIL_DOMAINS.slice(0, 3).join(', ')}, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="pl-9"
                            disabled={signUpMutation.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Minimum 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="pl-9"
                            disabled={signUpMutation.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {signUpMutation.isError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {signUpMutation.error instanceof Error
                        ? signUpMutation.error.message
                        : 'An error occurred during sign up'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
                  {signUpMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

