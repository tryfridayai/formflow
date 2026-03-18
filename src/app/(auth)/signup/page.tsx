import { SignupForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - FormFlow',
  description: 'Create your FormFlow account',
};

export default function SignupPage() {
  return <SignupForm />;
}
