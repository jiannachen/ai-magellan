'use client';

import Script from 'next/script';
import { useEffect, useState, useCallback } from 'react';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  clarityProjectId?: string;
  enableDebug?: boolean;
  onError?: (error: Error, service: 'google' | 'clarity') => void;
  onLoad?: (service: 'google' | 'clarity') => void;
}

interface AnalyticsState {
  googleLoaded: boolean;
  clarityLoaded: boolean;
  errors: Array<{ service: 'google' | 'clarity'; error: Error; timestamp: number }>;
}

export function Analytics({ 
  googleAnalyticsId,
  clarityProjectId, 
  enableDebug = false,
  onError,
  onLoad 
}: AnalyticsProps) {
  const [state, setState] = useState<AnalyticsState>({
    googleLoaded: false,
    clarityLoaded: false,
    errors: []
  });

  const handleError = useCallback((error: Error, service: 'google' | 'clarity') => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, { service, error, timestamp: Date.now() }]
    }));
    onError?.(error, service);
    if (enableDebug) {
      console.warn(`[Analytics] ${service} failed:`, error);
    }
  }, [onError, enableDebug]);

  const handleLoad = useCallback((service: 'google' | 'clarity') => {
    setState(prev => ({
      ...prev,
      [`${service}Loaded`]: true
    }));
    onLoad?.(service);
    if (enableDebug) {
      console.log(`[Analytics] ${service} loaded successfully`);
    }
  }, [onLoad, enableDebug]);

  // Microsoft Clarity - Enhanced with error handling and loading states
  useEffect(() => {
    if (!clarityProjectId) return;

    try {
      const loadClarity = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Clarity inline script with dynamic typing
        (function(c,l,a,r,i,t,y){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);

            // Add load success handling
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            t.onload = () => {
              handleLoad('clarity');
            };

            // Add error handling
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            t.onerror = () => {
              handleError(new Error('Failed to load Clarity script'), 'clarity');
            };
        })(window,document,"clarity","script",clarityProjectId);
      };
      
      // Load with slight delay to avoid blocking initial render
      const timeoutId = setTimeout(loadClarity, 100);
      
      return () => clearTimeout(timeoutId);
    } catch (error) {
      handleError(error as Error, 'clarity');
    }
  }, [clarityProjectId, handleError, handleLoad]);

  if (!googleAnalyticsId && !clarityProjectId) return null;

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
          Analytics: GA={state.googleLoaded ? '✓' : '○'} CL={state.clarityLoaded ? '✓' : '○'}
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
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    clarity?: (...args: any[]) => void;
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
    
    // Microsoft Clarity tracking
    if (window.clarity) {
      window.clarity('event', eventName);
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
    
    // Microsoft Clarity automatically tracks page views
    // But we can use identify to set custom data
    if (window.clarity) {
      window.clarity('set', 'page_path', pagePath);
      if (pageTitle) {
        window.clarity('set', 'page_title', pageTitle);
      }
    }
  }
};

// Clarity-specific utility functions
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, userProperties);
  }
};

export const setClarityTag = (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, value);
  }
};

export const trackClarityEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
}; 