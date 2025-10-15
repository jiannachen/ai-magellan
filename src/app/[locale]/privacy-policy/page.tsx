import { setRequestLocale } from 'next-intl/server';

interface PrivacyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  // 动态导入对应语言的隐私政策翻译文件
  const privacyMessages = await import(`../../../i18n/pages/privacy/${locale}.json`);
  const privacy = privacyMessages.privacy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {privacy.title}
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.introduction.title}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {privacy.introduction.content}
              </p>
            </section>

            {/* Information Collection */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.information_collection.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{privacy.information_collection.personal_info}</p>
                <p>{privacy.information_collection.usage_data}</p>
                <p>{privacy.information_collection.cookies}</p>
              </div>
            </section>

            {/* Information Use */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.information_use.title}
              </h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li>• {privacy.information_use.service_provision}</li>
                <li>• {privacy.information_use.communication}</li>
                <li>• {privacy.information_use.personalization}</li>
                <li>• {privacy.information_use.analytics}</li>
                <li>• {privacy.information_use.security}</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.information_sharing.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{privacy.information_sharing.third_parties}</p>
                <p>{privacy.information_sharing.service_providers}</p>
                <p>{privacy.information_sharing.legal_compliance}</p>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.data_security.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{privacy.data_security.measures}</p>
                <p>{privacy.data_security.limitations}</p>
              </div>
            </section>

            {/* User Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.user_rights.title}
              </h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li>• {privacy.user_rights.access}</li>
                <li>• {privacy.user_rights.opt_out}</li>
                <li>• {privacy.user_rights.cookies_control}</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {privacy.contact.title}
              </h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <p className="text-slate-700 dark:text-slate-300 mb-2">{privacy.contact.description}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium">{privacy.contact.email}:</span> privacy@aimagellan.com
                </p>
              </div>
            </section>

            <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-600 text-center text-slate-500 dark:text-slate-400">
              <p>{privacy.lastUpdated}: {new Date().toLocaleDateString(locale)}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PrivacyPageProps) {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'Privacy Policy | AI Magellan' : '隱私政策 | AI Magellan',
    description: locale === 'en' 
      ? 'Privacy Policy for AI Magellan - How we collect, use, and protect your information'
      : 'AI Magellan 隱私政策 - 我們如何收集、使用和保護您的資訊',
  };
}