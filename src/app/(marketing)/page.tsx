'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  BarChart3,
  Zap,
  Shield,
  MousePointerClick,
  Infinity,
  Palette,
  Code2,
  GitBranch,
  Download,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────── animation helpers ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────── data ─────────── */
const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'Conversational UX',
    description:
      'One question at a time. Guide respondents through a smooth, engaging experience that feels like a conversation — not a chore.',
  },
  {
    icon: Infinity,
    title: 'Unlimited Responses',
    description:
      'No response caps, no surprise bills. Collect as many submissions as you need on every plan — including our generous free tier.',
  },
  {
    icon: BarChart3,
    title: 'Built-in Analytics',
    description:
      'Real-time charts, completion funnels, drop-off analysis, and CSV export. Stop paying for a third-party dashboard.',
  },
  {
    icon: GitBranch,
    title: 'Conditional Logic',
    description:
      'Show or skip questions based on previous answers. Build personalized flows for lead qualification, quizzes, and surveys.',
  },
  {
    icon: Palette,
    title: 'Full Customization',
    description:
      'Custom colors, fonts, backgrounds, and logos. No watermarks on any paid plan. Your brand, front and center.',
  },
  {
    icon: Code2,
    title: 'Embed Anywhere',
    description:
      'Share via link, embed with an iframe, or generate a QR code. Drop your form into any website in seconds.',
  },
  {
    icon: Zap,
    title: 'Keyboard-First',
    description:
      'Respondents fly through your form with Enter, arrow keys, and letter shortcuts. Faster completion, better data.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Built on Supabase with row-level security. Your data stays yours. GDPR-ready infrastructure out of the box.',
  },
  {
    icon: Download,
    title: 'Clean Exports',
    description:
      'One-click CSV export with properly formatted data. No messy headers, no broken encoding. Ready for your spreadsheet.',
  },
];

const COMPARISON = [
  { feature: 'Conversational one-at-a-time UX', formflow: true, typeform: true, tally: false, google: false },
  { feature: 'Unlimited responses (all plans)', formflow: true, typeform: false, tally: true, google: true },
  { feature: 'Built-in analytics dashboard', formflow: true, typeform: false, tally: false, google: false },
  { feature: 'No branding watermark', formflow: true, typeform: false, tally: true, google: true },
  { feature: 'Conditional logic', formflow: true, typeform: true, tally: true, google: false },
  { feature: 'CSV export', formflow: true, typeform: true, tally: true, google: true },
  { feature: 'Custom themes & fonts', formflow: true, typeform: true, tally: false, google: false },
  { feature: 'Embed & QR codes', formflow: true, typeform: true, tally: true, google: false },
  { feature: 'Transparent pricing', formflow: true, typeform: false, tally: true, google: true },
  { feature: 'Starts free', formflow: true, typeform: false, tally: true, google: true },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals getting started with online forms.',
    features: [
      'Unlimited forms',
      'Unlimited responses',
      '15 question types',
      'Conditional logic',
      'Basic analytics',
      'Share link & embed',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For teams who need custom branding and deeper insights.',
    features: [
      'Everything in Free',
      'Remove FormFlow branding',
      'Advanced analytics & funnels',
      'Custom themes & fonts',
      'Priority support',
      'CSV & JSON export',
      'File upload questions',
      'Custom thank-you redirects',
    ],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    description: 'For growing businesses with collaboration needs.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Custom domains',
      'Webhooks & API access',
      'Partial submission capture',
      'Real-time notifications',
      'Dedicated support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    quote: 'We switched from Typeform and saved over $1,200 a year. The analytics alone are worth it.',
    name: 'Sarah Chen',
    role: 'Head of Marketing, Vetro',
    avatar: 'SC',
  },
  {
    quote: 'FormFlow gives us the beautiful form experience without the insane response limits. Game changer.',
    name: 'Marcus Rivera',
    role: 'Founder, Launchpad Studios',
    avatar: 'MR',
  },
  {
    quote: 'Finally a form builder that doesn\'t charge $80/month just to remove a watermark.',
    name: 'Priya Agarwal',
    role: 'Product Manager, Nexus',
    avatar: 'PA',
  },
];

/* ─────────── page ─────────── */
export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ───── HERO ───── */}
      <section className="relative isolate pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2"
        >
          <div className="h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-200 via-violet-100 to-transparent opacity-30 blur-3xl dark:from-indigo-900/40 dark:via-violet-900/20" />
        </div>

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* badge */}
            <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Star className="h-3 w-3 fill-indigo-500 text-indigo-500" />
                Free &amp; open-source form builder
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Beautiful forms.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Unlimited responses.
              </span>{' '}
              Zero hassle.
            </motion.h1>

            {/* sub */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400"
            >
              FormFlow is the free online form builder that gives you conversational
              forms, built-in analytics, and no response limits — for a fraction
              of what Typeform charges. Create surveys, quizzes, and lead forms in
              minutes with our drag-and-drop, no-code form creator.
            </motion.p>

            {/* CTA row */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" asChild>
                <Link href="/signup" className="gap-2">
                  Start Building — It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                See features →
              </a>
            </motion.div>

            {/* social proof */}
            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-8 text-xs text-gray-400 dark:text-gray-500"
            >
              No credit card required &middot; Free forever plan &middot; Set up in 2 minutes
            </motion.p>
          </motion.div>

          {/* hero image / mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/40">
              <div className="overflow-hidden rounded-lg bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
                {/* mock form UI */}
                <div className="flex min-h-[340px] flex-col items-center justify-center px-8 py-16">
                  <div className="w-full max-w-md space-y-8">
                    <div>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        1 →
                      </span>
                      <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        What&apos;s your name?
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        We&apos;d love to get to know you.
                      </p>
                    </div>
                    <div className="border-b-2 border-indigo-500 pb-2">
                      <span className="text-lg text-gray-400 dark:text-gray-500">
                        Type your answer here...
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white">
                        OK ✓
                      </div>
                      <span className="text-xs text-gray-400">
                        press <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Enter ↵</kbd>
                      </span>
                    </div>
                  </div>
                </div>
                {/* progress bar in mockup */}
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-1 w-1/3 rounded-full bg-indigo-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
            >
              Everything you need
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
            >
              A better way to create online forms
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400"
            >
              FormFlow combines the beautiful conversational experience of premium
              form builders with the analytics, flexibility, and fair pricing your
              team actually deserves.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900 dark:hover:shadow-indigo-950/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── COMPARISON TABLE ───── */}
      <section className="border-y border-gray-200 bg-gray-50 py-20 sm:py-28 dark:border-gray-800 dark:bg-gray-950/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
            >
              How FormFlow compares
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400"
            >
              See how we stack up against Typeform, Tally, and Google Forms on the
              features that matter most.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 overflow-x-auto"
          >
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 pr-6 font-medium text-gray-500 dark:text-gray-400">Feature</th>
                  <th className="pb-3 pr-6 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                    FormFlow
                  </th>
                  <th className="pb-3 pr-6 text-center font-medium text-gray-500 dark:text-gray-400">
                    Typeform
                  </th>
                  <th className="pb-3 pr-6 text-center font-medium text-gray-500 dark:text-gray-400">
                    Tally
                  </th>
                  <th className="pb-3 text-center font-medium text-gray-500 dark:text-gray-400">
                    Google Forms
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3.5 pr-6 text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="py-3.5 pr-6 text-center">
                      {row.formflow ? (
                        <Check className="mx-auto h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-6 text-center">
                      {row.typeform ? (
                        <Check className="mx-auto h-5 w-5 text-gray-400" />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-6 text-center">
                      {row.tally ? (
                        <Check className="mx-auto h-5 w-5 text-gray-400" />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      {row.google ? (
                        <Check className="mx-auto h-5 w-5 text-gray-400" />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400"
            >
              No hidden response limits. No forced upgrades. Pick a plan that fits
              your needs — and keep it.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mt-14 grid gap-6 lg:grid-cols-3"
          >
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={`relative flex flex-col rounded-xl border p-8 ${
                  plan.highlight
                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-gray-900 dark:shadow-indigo-950/20 dark:ring-indigo-500'
                    : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="border-t border-gray-200 bg-gray-50 py-20 sm:py-28 dark:border-gray-800 dark:bg-gray-950/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
            >
              Loved by teams who switched
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── SEO CONTENT BLOCK ───── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            The free online form builder for modern teams
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p>
              FormFlow is a <strong>free form builder</strong> designed for founders,
              marketers, and product teams who need beautiful, conversational forms
              without the steep pricing of legacy tools. Whether you need to{' '}
              <strong>create a survey</strong>, build a{' '}
              <strong>lead generation form</strong>, or design an interactive{' '}
              <strong>quiz maker</strong>, FormFlow gives you the tools to do it in
              minutes — no code required.
            </p>
            <p>
              Unlike traditional <strong>online survey builders</strong>, FormFlow
              presents questions one at a time in a smooth, conversational flow.
              This approach — pioneered by Typeform — dramatically increases
              completion rates. But while Typeform charges $39/month for just 100
              responses, FormFlow offers{' '}
              <strong>unlimited responses on every plan</strong>, including free.
            </p>
            <p>
              Our <strong>drag-and-drop form creator</strong> supports 15 question
              types including short text, multiple choice, rating scales, opinion
              scales, date pickers, file uploads, and more. Add{' '}
              <strong>conditional logic</strong> to personalize the experience —
              show or skip questions based on previous answers. Customize everything
              from colors and fonts to backgrounds and logos with our full{' '}
              <strong>form theme editor</strong>.
            </p>
            <p>
              What truly sets FormFlow apart is the{' '}
              <strong>built-in analytics dashboard</strong>. See real-time response
              charts, completion funnels, per-question breakdowns, and drop-off
              analysis — all without connecting a third-party tool. Export your data
              as clean CSV with one click.
            </p>
            <p>
              FormFlow is the <strong>best Typeform alternative</strong> for teams
              that want premium form experiences at fair, transparent pricing. It&apos;s
              also a powerful{' '}
              <strong>Google Forms alternative</strong> for anyone who needs
              customization and analytics beyond what free tools offer. Start
              building your first form today — no credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
            >
              Ready to build better forms?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-lg text-gray-600 dark:text-gray-400"
            >
              Join thousands of teams creating beautiful, conversational forms with
              unlimited responses and built-in analytics.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" asChild>
                <Link href="/signup" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-4 text-xs text-gray-400 dark:text-gray-500"
            >
              Free forever &middot; No credit card &middot; Set up in 2 minutes
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ───── STRUCTURED DATA (JSON-LD) ───── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'FormFlow',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Free online form builder with conversational UX, unlimited responses, built-in analytics, and no watermarks. The best Typeform alternative.',
            offers: [
              {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                name: 'Free',
                description: 'Unlimited forms and responses, 15 question types, conditional logic',
              },
              {
                '@type': 'Offer',
                price: '19',
                priceCurrency: 'USD',
                name: 'Pro',
                description: 'Custom branding, advanced analytics, priority support',
              },
              {
                '@type': 'Offer',
                price: '49',
                priceCurrency: 'USD',
                name: 'Team',
                description: 'Team collaboration, custom domains, API access',
              },
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '1200',
              bestRating: '5',
            },
          }),
        }}
      />
    </div>
  );
}
