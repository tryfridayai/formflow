import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { MarketingFooter } from '@/components/layout/marketing-footer';

export const metadata: Metadata = {
  title: 'FormFlow — Free Online Form Builder | Beautiful Conversational Forms',
  description:
    'Create beautiful conversational forms with unlimited responses, built-in analytics, and no watermarks. The best free Typeform alternative for small businesses and teams. Drag and drop form builder with no-code setup.',
  keywords: [
    'form builder',
    'online form builder',
    'free form builder',
    'typeform alternative',
    'free typeform alternative',
    'conversational form builder',
    'form builder with analytics',
    'form builder unlimited responses',
    'no-code form builder',
    'beautiful form builder',
    'create forms online free',
    'survey maker free',
    'drag and drop form builder',
    'form builder for small business',
    'online survey builder',
  ],
  openGraph: {
    title: 'FormFlow — Free Online Form Builder | Beautiful Conversational Forms',
    description:
      'Create beautiful conversational forms with unlimited responses, built-in analytics, and no watermarks. The best free Typeform alternative.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FormFlow',
    url: 'https://formflow.app',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FormFlow — Beautiful forms. Unlimited responses. Zero hassle.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FormFlow — Free Online Form Builder | Beautiful Conversational Forms',
    description:
      'Create beautiful conversational forms with unlimited responses, built-in analytics, and no watermarks. The best free Typeform alternative.',
    creator: '@formflow',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://formflow.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  );
}
