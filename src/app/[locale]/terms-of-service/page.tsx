import { setRequestLocale } from 'next-intl/server';

interface TermsPageProps {
  params: {
    locale: string;
  };
}

export default async function TermsPage({ params: { locale } }: TermsPageProps) {
  setRequestLocale(locale);
  
  // 动态导入对应语言的服务条款翻译文件
  const termsMessages = await import(`../../../i18n/pages/terms/${locale}.json`);
  const terms = termsMessages.terms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {terms.title}
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Acceptance of Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.acceptance.title}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {terms.acceptance.content}
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.description.title}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {terms.description.content}
              </p>
            </section>

            {/* User Accounts */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.user_accounts.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.user_accounts.registration}</p>
                <p>{terms.user_accounts.accuracy}</p>
                <p>{terms.user_accounts.responsibility}</p>
              </div>
            </section>

            {/* User Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.user_content.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.user_content.submission}</p>
                <p>{terms.user_content.responsibility}</p>
                <p>{terms.user_content.ownership}</p>
              </div>
            </section>

            {/* Prohibited Conduct */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.prohibited_conduct.title}
              </h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li>• {terms.prohibited_conduct.illegal_use}</li>
                <li>• {terms.prohibited_conduct.interference}</li>
                <li>• {terms.prohibited_conduct.spam}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.intellectual_property.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.intellectual_property.ownership}</p>
                <p>{terms.intellectual_property.license}</p>
                <p>{terms.intellectual_property.respect}</p>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.disclaimers.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.disclaimers.as_is}</p>
                <p>{terms.disclaimers.accuracy}</p>
                <p>{terms.disclaimers.third_party}</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.limitation_liability.title}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {terms.limitation_liability.content}
              </p>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.termination.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.termination.right}</p>
                <p>{terms.termination.effect}</p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.changes.title}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>{terms.changes.modification}</p>
                <p>{terms.changes.continued_use}</p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-600 pb-2">
                {terms.contact.title}
              </h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <p className="text-slate-700 dark:text-slate-300 mb-2">{terms.contact.description}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium">{terms.contact.email}:</span> legal@aimagellan.com
                </p>
              </div>
            </section>

            <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-600 text-center text-slate-500 dark:text-slate-400">
              <p>{terms.lastUpdated}: {new Date().toLocaleDateString(locale)}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params: { locale } }: TermsPageProps) {
  return {
    title: locale === 'en' ? 'Terms of Service | AI Magellan' : '服務條款 | AI Magellan',
    description: locale === 'en' 
      ? 'Terms of Service for AI Magellan - Rules and guidelines for using our platform'
      : 'AI Magellan 服務條款 - 使用我們平台的規則和指導原則',
  };
}