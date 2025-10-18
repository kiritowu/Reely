'use client'

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
import { submitHelloForm } from '@/actions/hello'
import { unwrapResult } from '@/lib/action-result'
import { helloFormSchema, type HelloFormInput } from '@/types'

export function HelloWorldForm() {
  const form = useForm<HelloFormInput>({
    resolver: zodResolver(helloFormSchema),
    defaultValues: {
      userInput: '',
    },
  })

  // Use TanStack Query's useMutation with the server action
  const mutation = useMutation({
    mutationFn: async (values: HelloFormInput) => {
      // Create FormData and submit to server action
      const formData = new FormData()
      formData.append('userInput', values.userInput)
      return unwrapResult(await submitHelloForm({ formData }))
    },
    onSuccess: (data) => {
      form.reset()
    },
    onError: (error) => {
      console.error('Mutation error:', error)
    },
  })

  function onSubmit(values: HelloFormInput) {
    mutation.mutate(values)
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Hello World Form with TanStack Query</CardTitle>
        <CardDescription>
          Enter your message below and click send. It will be logged in the server console using Server Actions + TanStack Query.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type something..."
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be logged in the backend via server actions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={mutation.isPending} 
              className="w-full"
            >
              {mutation.isPending ? 'Sending...' : 'Send'}
            </Button>
            
            {/* TanStack Query Status Indicators */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mutation.isPending ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                <span>Pending: {mutation.isPending ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mutation.isSuccess ? 'bg-chart-2' : 'bg-muted'}`} />
                <span>Success: {mutation.isSuccess ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mutation.isError ? 'bg-destructive' : 'bg-muted'}`} />
                <span>Error: {mutation.isError ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      {mutation.data && (
        <CardFooter>
          <div className="w-full rounded-lg p-4 bg-chart-2/10 text-chart-2 border border-chart-2/20">
            <p className="font-medium">✅ Success!</p>
            <p className="text-sm mt-1 opacity-90">{mutation.data.message}</p>
          </div>
        </CardFooter>
      )}
      {mutation.isError && (
        <CardFooter>
          <div className="w-full rounded-lg p-4 bg-destructive/10 text-destructive border border-destructive/20">
            <p className="font-medium">❌ Network Error</p>
            <p className="text-sm mt-1 opacity-90">
              {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}


