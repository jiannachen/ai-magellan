# Microsoft Clarity Integration

## Overview
Microsoft Clarity has been successfully integrated into the AI Magellan project. Clarity provides user behavior analytics including heatmaps, session recordings, and insights.

## Configuration

### Environment Variables
Add your Clarity Project ID to your environment files:

```bash
# .env.development / .env.production
CLARITY_PROJECT_ID="your-clarity-project-id"
```

### Current Setup
- **Project ID**: `tqcz7g83dn` (configured in .env.development)
- **Auto-initialization**: Clarity loads automatically when the Analytics component is rendered
- **Error handling**: Built-in error tracking for failed script loads

## Features

### Automatic Tracking
- **Page views**: Automatically tracked by Clarity
- **User interactions**: Clicks, scrolls, form interactions
- **Performance metrics**: Load times, responsiveness

### Custom Tracking
Use the provided utility functions for custom tracking:

```typescript
import { 
  trackEvent, 
  trackPageView, 
  identifyUser, 
  setClarityTag, 
  trackClarityEvent 
} from '@/components/analytics';

// Track custom events
trackEvent('button_click', { button_name: 'submit' });

// Track page views with custom data
trackPageView('/dashboard', 'User Dashboard');

// Identify users (when logged in)
identifyUser('user123', { 
  email: 'user@example.com',
  plan: 'premium' 
});

// Set custom tags
setClarityTag('user_type', 'premium');
setClarityTag('feature_enabled', 'true');

// Track Clarity-specific events
trackClarityEvent('feature_used');
```

### Integration Examples

#### Track User Actions
```typescript
// In a component
const handleSubmit = () => {
  // Your submit logic
  trackEvent('form_submit', { form_type: 'contact' });
};

const handleToolClick = (toolName: string) => {
  trackEvent('tool_click', { tool_name: toolName });
  setClarityTag('last_tool_clicked', toolName);
};
```

#### User Identification
```typescript
// After user login
const handleLogin = (user: User) => {
  identifyUser(user.id, {
    email: user.email,
    subscription: user.subscriptionType,
    signup_date: user.createdAt
  });
};
```

## Debug Mode
Enable debug mode to see analytics status in development:

```typescript
<Analytics 
  googleAnalyticsId="G-9MNGY82H1J"
  clarityProjectId={process.env.CLARITY_PROJECT_ID}
  enableDebug={true}
/>
```

This shows a debug overlay with:
- GA: ✓/○ (Google Analytics status)
- CL: ✓/○ (Clarity status)
- Error count if any failures occur

## Privacy Considerations
- Clarity automatically respects user privacy settings
- Session recordings exclude sensitive data by default
- Consider implementing user consent for analytics tracking
- Review Clarity's privacy documentation for compliance requirements

## Accessing Clarity Data
1. Visit [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with your Microsoft account
3. Access your project using the Project ID: `tqcz7g83dn`
4. View heatmaps, session recordings, and insights

## Troubleshooting
- Verify `CLARITY_PROJECT_ID` is set correctly
- Check browser console for any script loading errors
- Use debug mode to confirm Clarity initialization
- Ensure the project ID is valid in your Clarity dashboard