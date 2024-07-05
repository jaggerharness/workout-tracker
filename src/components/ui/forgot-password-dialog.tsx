'use client';

import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shad-ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../shad-ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../shad-ui/input';
import { Button } from '../shad-ui/button';
import { sendPasswordReset } from '@/server/actions/actions';
import { useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';

export function ForgotPasswordDialog() {
  const [submitted, setSubmitted] = useState(false);

  const formSchema = z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, 'Email is required')
      .email('Invalid email'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitted(true);
    await sendPasswordReset(values.email);
  }

  return (
    <Dialog>
      <DialogTrigger className="text-sm text-left font-medium hover:text-primary text-white tracking-tight">
        Forgot Password?
      </DialogTrigger>
      {!submitted ? (
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              <DialogHeader>
                <DialogTitle>Forgot Password?</DialogTitle>
                <DialogDescription>
                  If you've forgotten your password, enter your email below.
                  We'll send you a link to reset your password if there's an
                  account associated with that email address.
                </DialogDescription>
              </DialogHeader>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Continue</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check your email</DialogTitle>
            <DialogDescription>
              If there's an account associated with the provided email address,
              you will receive a link containing further instructions to reset
              your password.
            </DialogDescription>
          </DialogHeader>
          <div className='text-sm text-muted-foreground'>
          If you haven't received an email in the next few minutes use the button below to resend the reset form, or <span className='text-primary hover:text-primary/90 hover:cursor-pointer' onClick={() => setSubmitted(false)}>try with a new email</span>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Resend Email
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
