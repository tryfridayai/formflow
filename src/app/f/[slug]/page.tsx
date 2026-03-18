import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormRenderer } from '@/components/form-renderer/form-renderer';
import type { Form } from '@/lib/types/form';

interface PageProps {
  params: { slug: string };
}

async function getFormBySlug(slug: string): Promise<Form | null> {
  const supabase = createClient();

  const { data: form, error } = await supabase
    .from('forms')
    .select(
      `
      *,
      theme:themes(*),
      questions(*)
    `
    )
    .eq('slug', slug)
    .single();

  if (error || !form) return null;

  return form as unknown as Form;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const form = await getFormBySlug(params.slug);

  if (!form) {
    return { title: 'Form Not Found' };
  }

  const title = form.settings.meta_title ?? form.title;
  const description =
    form.settings.meta_description ??
    form.description ??
    `Fill out ${form.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(form.settings.meta_image_url && {
        images: [{ url: form.settings.meta_image_url }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const form = await getFormBySlug(params.slug);

  if (!form) {
    notFound();
  }

  /* Only published forms are accessible */
  if (form.status !== 'published') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <svg
              className="h-8 w-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">
            This form is not available
          </h1>
          <p className="max-w-sm text-sm text-gray-400">
            The form you are looking for is not currently accepting responses.
            Please contact the form owner for more information.
          </p>
        </div>
      </div>
    );
  }

  /* Check if the form has been closed by date */
  if (form.settings.close_date) {
    const closeDate = new Date(form.settings.close_date);
    if (closeDate < new Date()) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-xl font-bold text-white">
              This form is closed
            </h1>
            <p className="max-w-sm text-sm text-gray-400">
              This form is no longer accepting responses.
            </p>
          </div>
        </div>
      );
    }
  }

  /* Check max responses */
  if (
    form.settings.max_responses &&
    form.response_count >= form.settings.max_responses
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-bold text-white">
            Responses limit reached
          </h1>
          <p className="max-w-sm text-sm text-gray-400">
            This form has reached the maximum number of responses and is no
            longer accepting submissions.
          </p>
        </div>
      </div>
    );
  }

  return <FormRenderer form={form} />;
}
