import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'tw'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

export default getRequestConfig(async ({requestLocale}) => {
  // This can either be defined statically at the top-level if no request
  // is available (e.g. during static export) or can be read from the user's
  // session or the database
  let locale = await requestLocale;

  // Ensure a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load core translations and landing page translations
  // Other translations (profile, etc.) are loaded on-demand in their pages
  const [mainMessages, landingMessages] = await Promise.all([
    import(`./i18n/messages/${locale}.json`),
    import(`./i18n/pages/landing/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...mainMessages.default,
      landing: landingMessages.default,
    },
    timeZone: 'Asia/Taipei',
    now: new Date(),
    // Enable rich text formatting
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      }
    }
  };
});