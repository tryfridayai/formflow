import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - FormFlow',
  description: 'Sign in to your FormFlow account',
};

export default function LoginPage() {
  return <LoginForm />;
}
