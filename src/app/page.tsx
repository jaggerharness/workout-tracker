import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { registerUser } from './actions';
import { CredSignIn } from './components/creds-sign-in';
import { GitHubSignIn } from './components/github-sign-in';
import { GoogleSignIn } from './components/google-sign-in';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex h-screen items-center justify-center">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <form
                  action={async (formData) => {
                    'use server';
                    await registerUser({ formData });
                  }}
                >
                  <Label className="sr-only" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                  />
                  <Label className="sr-only" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    placeholder="password1"
                    type="password"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  <Button>Register</Button>
                </form>
              </div>
              <div className="grid gap-1">
                <CredSignIn />
                {/* <form
                  action={async (formData) => {
                    'use server';
                    await signIn('credentials', formData, {
                      redirectTo: '/dashboard',
                    });
                  }}
                >
                  <label>
                    Email
                    <input name="email" type="email" />
                  </label>
                  <label>
                    Password
                    <input name="password" type="password" />
                  </label>
                  <Button>Login</Button>
                </form> */}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <GitHubSignIn />
              <GoogleSignIn />
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </main>
  );
}
