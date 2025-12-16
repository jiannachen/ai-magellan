import { getTranslations } from 'next-intl/server';
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { FAQItem } from "./faq-item";

interface FAQ {
  question: string;
  answer: string;
}

/**
 * FAQ Section - Server Component
 * FAQ 区域,标题和结构是服务端,交互式折叠由客户端组件处理
 */
export async function FAQSection() {
  const tLanding = await getTranslations('landing');

  const faqs: FAQ[] = [
    {
      question: tLanding('sections.faq.questions.what_makes_different.question'),
      answer: tLanding('sections.faq.questions.what_makes_different.answer')
    },
    {
      question: tLanding('sections.faq.questions.quality_assurance.question'),
      answer: tLanding('sections.faq.questions.quality_assurance.answer')
    },
    {
      question: tLanding('sections.faq.questions.free_tools.question'),
      answer: tLanding('sections.faq.questions.free_tools.answer')
    },
    {
      question: tLanding('sections.faq.questions.submit_tool.question'),
      answer: tLanding('sections.faq.questions.submit_tool.answer')
    },
    {
      question: tLanding('sections.faq.questions.update_frequency.question'),
      answer: tLanding('sections.faq.questions.update_frequency.answer')
    },
    {
      question: tLanding('sections.faq.questions.account_required.question'),
      answer: tLanding('sections.faq.questions.account_required.answer')
    }
  ];

  return (
    <div className="bg-muted/30">
      <section className="py-24 px-4 relative overflow-hidden">
        {/* AM.md 专业级背景装饰 - 6-8%透明度标准 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl professional-float"
            style={{ background: 'linear-gradient(135deg, var(--magellan-coral) 0%, var(--magellan-gold) 100%)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-mint/4 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-magellan-primary/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
        </div>

        <div className="container mx-auto relative z-10">
          {/* AM.md 航海问答标题区域 */}
          <div className="text-center mb-16">
            {/* 航海问答徽章 */}
            <div className={cn(
              "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
              "bg-gradient-to-r from-magellan-coral/10 to-magellan-gold/10",
              "border border-magellan-coral/20 backdrop-blur-sm",
              "professional-glow"
            )}>
              <div className="relative">
                <MessageSquare className="h-4 w-4 text-magellan-coral professional-compass" />
                <div className="absolute inset-0 rounded-full bg-magellan-coral/20 professional-glow"></div>
              </div>
              <span className="text-sm font-medium text-magellan-coral">
                💬 {tLanding('sections.faq.badge')}
              </span>
              <div className="w-2 h-2 rounded-full bg-magellan-gold professional-glow"></div>
            </div>

            {/* 航海问答标题 */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-magellan-depth-900 mb-4">
              <span className="inline-flex items-center gap-2">
                🗣️ {tLanding('sections.faq.title')}
              </span>
            </h2>

            <p className="text-lg text-magellan-depth-600 max-w-3xl mx-auto leading-relaxed">
              🧭 {tLanding('sections.faq.description')}
            </p>
          </div>

          {/* AM.md 专业级问答列表 - 客户端组件 */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
