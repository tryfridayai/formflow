import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FormFlow - Beautiful Forms, Powerful Insights",
    template: "%s | FormFlow",
  },
  description:
    "Create engaging, conversational forms that feel like a conversation. Collect responses, analyze results, and share with anyone.",
  keywords: [
    "form builder",
    "survey",
    "typeform alternative",
    "conversational forms",
    "feedback",
    "questionnaire",
  ],
  authors: [{ name: "FormFlow" }],
  openGraph: {
    title: "FormFlow - Beautiful Forms, Powerful Insights",
    description:
      "Create engaging, conversational forms that feel like a conversation.",
    type: "website",
    locale: "en_US",
    siteName: "FormFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormFlow - Beautiful Forms, Powerful Insights",
    description:
      "Create engaging, conversational forms that feel like a conversation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
