import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { loadMessages } from '@/lib/i18n/load-messages';

/**
 * Profile section layout
 * Loads profile translations on-demand for all child pages
 */
export default async function ProfileLayout({
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
