import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { loadMessages } from '@/lib/i18n/load-messages';

/**
 * Submit section layout
 * Loads profile translations on-demand for the submit page
 */
export default async function SubmitLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Load profile translations on-demand
  const profileMessages = await loadMessages('profile');
  const coreMessages = await getMessages();

  // Merge profile messages with core messages
  const messages = {
    ...coreMessages,
    profile: profileMessages,
  };

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
