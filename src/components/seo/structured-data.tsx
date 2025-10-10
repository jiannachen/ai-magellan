import Script from 'next/script';
import { useTranslations } from 'next-intl';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'webpage' | 'itemList';
  data?: any;
  websites?: any[];
}

export function StructuredData({ type, data, websites }: StructuredDataProps) {
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