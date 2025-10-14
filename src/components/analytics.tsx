'use client';

import Script from 'next/script';
import { useEffect, useState, useCallback } from 'react';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  baiduAnalyticsId?: string;
  enableDebug?: boolean;
  onError?: (error: Error, service: 'google' | 'baidu') => void;
  onLoad?: (service: 'google' | 'baidu') => void;
}

interface AnalyticsState {
  googleLoaded: boolean;
  baiduLoaded: boolean;
  errors: Array<{ service: 'google' | 'baidu'; error: Error; timestamp: number }>;
}

export function Analytics({ 
  googleAnalyticsId, 
  baiduAnalyticsId, 
  enableDebug = false,
  onError,
  onLoad 
}: AnalyticsProps) {
  const [state, setState] = useState<AnalyticsState>({
    googleLoaded: false,
    baiduLoaded: false,
    errors: []
  });

  const handleError = useCallback((error: Error, service: 'google' | 'baidu') => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, { service, error, timestamp: Date.now() }]
    }));
    onError?.(error, service);
    if (enableDebug) {
      console.warn(`[Analytics] ${service} failed:`, error);
    }
  }, [onError, enableDebug]);

  const handleLoad = useCallback((service: 'google' | 'baidu') => {
    setState(prev => ({
      ...prev,
      [`${service}Loaded`]: true
    }));
    onLoad?.(service);
    if (enableDebug) {
      console.log(`[Analytics] ${service} loaded successfully`);
    }
  }, [onLoad, enableDebug]);
  // 百度统计 - Enhanced with error handling and loading states
  useEffect(() => {
    if (!baiduAnalyticsId) return;

    try {
      window._hmt = window._hmt || [];
      
      const loadBaiduAnalytics = () => {
        const hm = document.createElement("script");
        hm.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`;
        hm.async = true;
        hm.defer = true;
        
        // Add error handling
        hm.onerror = () => {
          handleError(new Error('Failed to load Baidu Analytics script'), 'baidu');
        };
        
        // Add load success handling
        hm.onload = () => {
          handleLoad('baidu');
        };
        
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(hm, firstScript);
        } else {
          document.head.appendChild(hm);
        }
      };
      
      // Load with slight delay to avoid blocking initial render
      const timeoutId = setTimeout(loadBaiduAnalytics, 100);
      
      return () => clearTimeout(timeoutId);
    } catch (error) {
      handleError(error as Error, 'baidu');
    }
  }, [baiduAnalyticsId, handleError, handleLoad]);

  if (!googleAnalyticsId && !baiduAnalyticsId) return null;

  return (
    <>
      {/* Google Analytics - Enhanced with error handling */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
            onError={() => handleError(new Error('Failed to load Google Analytics script'), 'google')}
            onLoad={() => {
              // Verify gtag is available before marking as loaded
              if (typeof window !== 'undefined' && window.gtag) {
                handleLoad('google');
              }
            }}
          />
          <Script 
            id="google-analytics" 
            strategy="afterInteractive"
            onError={() => handleError(new Error('Failed to initialize Google Analytics'), 'google')}
          >
            {`
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  // Privacy-focused settings
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });
                
                // Make gtag globally available for error checking
                window.gtag = gtag;
              } catch (error) {
                console.warn('[Analytics] Google Analytics initialization failed:', error);
              }
            `}
          </Script>
        </>
      )}
      
      {/* Debug information in development */}
      {enableDebug && process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 9999,
            fontFamily: 'monospace'
          }}
        >
          Analytics: GA={state.googleLoaded ? '✓' : '○'} BD={state.baiduLoaded ? '✓' : '○'}
          {state.errors.length > 0 && (
            <div style={{ color: '#ff6b6b', marginTop: '4px' }}>
              Errors: {state.errors.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Enhanced TypeScript declarations for analytics services
declare global {
  interface Window {
    _hmt: any[];
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Export types for external use
export type { AnalyticsProps, AnalyticsState };

// Utility functions for tracking events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Baidu Analytics tracking
    if (window._hmt) {
      window._hmt.push(['_trackEvent', eventName, JSON.stringify(parameters)]);
    }
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined') {
    // Google Analytics page view
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle || document.title
      });
    }
    
    // Baidu Analytics page view
    if (window._hmt) {
      window._hmt.push(['_trackPageview', pagePath]);
    }
  }
}; 