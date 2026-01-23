import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';

/**
 * Load additional translation namespaces on-demand in server components
 * This reduces initial bundle size by only loading what's needed
 *
 * @example
 * ```tsx
 * // In a server component
 * import { loadMessages } from '@/lib/i18n/load-messages';
 *
 * export default async function ProfilePage() {
 *   const messages = await loadMessages('profile');
 *   // Use messages or get translations with namespace
 *   const t = await getTranslations('profile');
 * }
 * ```
 */
export async function loadMessages(namespace: 'profile' | 'landing' | 'privacy' | 'terms') {
  const locale = await getLocale() as Locale;

  try {
    let messages;

    switch (namespace) {
      case 'profile':
        messages = await import(`@/i18n/messages/profile.${locale}.json`);
        break;
      case 'landing':
        messages = await import(`@/i18n/pages/landing/${locale}.json`);
        break;
      case 'privacy':
        messages = await import(`@/i18n/pages/privacy/${locale}.json`);
        break;
      case 'terms':
        messages = await import(`@/i18n/pages/terms/${locale}.json`);
        break;
      default:
        throw new Error(`Unknown namespace: ${namespace}`);
    }

    return messages.default;
  } catch (error) {
    console.error(`Failed to load messages for namespace: ${namespace}`, error);
    return {};
  }
}

/**
 * Higher-order function to provide translations to server components
 * Automatically loads the required namespace and provides the getTranslations function
 *
 * @example
 * ```tsx
 * import { withMessages } from '@/lib/i18n/load-messages';
 *
 * export default withMessages('profile', async (t) => {
 *   return (
 *     <div>
 *       <h1>{t('dashboard.title')}</h1>
 *     </div>
 *   );
 * });
 * ```
 */
export async function withMessages<T>(
  namespace: 'profile' | 'landing' | 'privacy' | 'terms',
  component: (t: Awaited<ReturnType<typeof getTranslations>>) => Promise<T>
): Promise<T> {
  await loadMessages(namespace);
  const t = await getTranslations(namespace);
  return component(t);
}
