import Script from 'next/script';
import { useTranslations } from 'next-intl';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'webpage' | 'itemList' | 'faq' | 'breadcrumb';
  data?: any;
  websites?: any[];
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; url: string }[];
}

export function StructuredData({ type, data, websites, faqs, breadcrumbs }: StructuredDataProps) {
  const t = useTranslations();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yoursite.com';
  
  const generateStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": t('seo.site_name'),
          "description": t('seo.site_description'),
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": t('seo.site_name'),
            "url": baseUrl
          }
        };
        
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": t('seo.site_name'),
          "description": t('seo.site_description'),
          "url": baseUrl,
          "logo": `${baseUrl}/images/logo.png`,
          "sameAs": [
            // 社交媒体链接（如果有的话）
          ]
        };
        
      case 'webpage':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": data?.title || t('seo.site_name'),
          "description": data?.description || t('seo.site_description'),
          "url": data?.url || baseUrl,
          "isPartOf": {
            "@type": "WebSite",
            "name": t('seo.site_name'),
            "url": baseUrl
          },
          "datePublished": data?.datePublished,
          "dateModified": data?.dateModified
        };
        
      case 'itemList':
        return {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": t('seo.ai_tools_list'),
          "description": t('seo.curated_list_description'),
          "numberOfItems": websites?.length || 0,
          "itemListElement": websites?.map((website, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "SoftwareApplication",
              "name": website.title,
              "description": website.description,
              "url": website.url,
              "applicationCategory": "AI Tool",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          })) || []
        };
        
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs?.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          })) || []
        };
        
      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs?.map((breadcrumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": breadcrumb.name,
            "item": breadcrumb.url
          })) || []
        };
        
      default:
        return null;
    }
  };

  const structuredData = generateStructuredData();
  
  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}