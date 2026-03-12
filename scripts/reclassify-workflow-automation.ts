#!/usr/bin/env node
/**
 * Reclassify websites from workflow-automation category
 *
 * This script analyzes websites in the workflow-automation category
 * and reassigns them to more appropriate categories based on their
 * title and description.
 *
 * Usage:
 * 1. Run: npx tsx scripts/reclassify-workflow-automation.ts
 * 2. Review generated SQL file
 * 3. Apply: wrangler d1 execute ai-magellan-db-production --remote --file=./scripts/reclassify-updates.sql
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

// Category mapping with IDs from production database
const CATEGORIES = {
  // Content Creation (parent: 1)
  'ai-writing': 2,
  'copywriting': 3,
  'social-media': 5,
  'seo-tools': 6,
  'email-marketing': 7,
  'paraphrasing-tools': 103,

  // Image & Design (parent: 8)
  'ai-art-generation': 9,
  'image-editing': 10,
  'logo-design': 11,
  'image-enhancement': 12,
  'background-removal': 13,
  'ui-ux-design': 14,
  '3d-design': 15,
  'avatar-generation': 107,
  'face-swap': 108,
  'photo-restoration': 109,

  // Video & Audio (parent: 16)
  'video-generation': 17,
  'video-editing': 18,
  'text-to-speech': 19,
  'voice-cloning': 20,
  'audio-editing': 21,
  'music-generation': 22,
  'subtitle-generation': 23,
  'audio-transcription': 104,

  // Development & Code (parent: 24)
  'code-assistant': 25,
  'code-generation': 26,
  'code-review': 27,
  'test-automation': 28,
  'api-development': 29,
  'low-code-no-code': 30,

  // Chatbots (parent: 31)
  'conversational-ai': 32,
  'customer-service': 33,
  'virtual-assistant': 34,
  'chatbot-platforms': 35,

  // Data & Analytics (parent: 36)
  'business-intelligence': 37,
  'data-visualization': 38,
  'predictive-analytics': 39,
  'data-mining': 40,
  'sql-assistant': 41,

  // Marketing & Sales (parent: 42)
  'market-research': 43,
  'ad-optimization': 44,
  'sales-automation': 45,
  'crm-tools': 46,
  'personalization': 47,

  // Education & Learning (parent: 48)
  'machine-translation': 55,
  'language-learning': 50,
  'document-translation': 56,
  'study-assistant': 51,
  'homework-helper': 52,
  'localization-tools': 58,
  'teaching-tools': 53,

  // Productivity (parent: 64)
  'task-management': 65,
  'meeting-assistant': 66,
  'note-taking': 67,
  'scheduling': 68,
  'workflow-automation': 69,
  'presentation-tools': 102,
  'document-management': 105,
  'ai-detection': 110,

  // Human Resources (parent: 70)
  'recruitment': 71,
  'resume-screening': 72,
  'employee-training': 73,
  'performance-management': 74,
  'resume-builder': 106,

  // Healthcare (parent: 75)
  'medical-diagnosis': 76,
  'fitness-coaching': 80,

  // Finance (parent: 81)
  'financial-analysis': 82,
  'investment-advisory': 83,
  'risk-management': 84,

  // Legal (parent: 101)
  'legal-documents': 85,
  'compliance': 86,
};

// Classification rules based on keywords
interface ClassificationRule {
  category: string;
  keywords: string[];
  excludeKeywords?: string[];
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ============ HIGH PRIORITY - Check first ============

  // Video Generation (before other video/image rules)
  {
    category: 'video-generation',
    keywords: ['video generat', 'create video', 'ai video', 'text to video', 'video ai', 'video content', 'raw footage', 'music video', 'motion data', 'motion capture', 'move.ai', 'video ad', 'video ads', 'animate', 'animation', 'animated video', 'comic', 'manga', 'storyboard', 'faceless video', 'short-form video', 'viral video', 'steve.ai', 'real estate video', 'character animation', '3d animation', 'dynamic video', 'text and images into', 'digital human', 'playable game', 'pollo ai', 'autoreel', 'vidful', 'metaphysic', 'pixverse', 'higgsfield', 'fliki', 'vmaker', 'domoai', 'anime video']
  },

  // Ad Optimization (before general marketing)
  {
    category: 'ad-optimization',
    keywords: ['ad optim', 'advertis', 'marketing campaign', 'ad generat', 'creative ad', 'dynamic product ad', 'ad campaign', 'ad performance', 'google ads', 'facebook ads', 'video ad', 'high-converting', 'landing page', 'product page', 'conversion', 'boost conversion', 'product feed', 'marketplace', 'shopify', 'e-commerce', 'ecommerce', 'ad creativ', 'winning ad', 'affiliate revenue', 'pencil', 'getcrux', 'lasso', 'transactional shopping', 'inspirational experience', 'monocle', 'poper', 'abandoning visitor', 'tangent ai', 'beauty shopper', 'maverick', 'customer lifetime', 'repliq', 'cold outreach']
  },

  // Sales Automation (before general business)
  {
    category: 'sales-automation',
    keywords: ['sales automat', 'sales engag', 'crm', 'lead generat', 'prospect', 'outreach', 'pipeline', 'revenue growth', 'sales cycle', 'b2b sales', 'revenue-driv', 'sales productivity', 'sales call', 'lead scoring', 'outbound call', 'sales research', 'cold call', 'telemarketing', 'sales strateg', 'target account', 'revenue enablement', 'sales performance', 'deal', 'close deal', 'marketing and sales workflow', 'digital agenc', 'vidyard', 'personalized video messaging', 'quin', 'professional relationship', 'sales follow-up', 'claap', 'meeting insights']
  },

  // Recruitment (before general HR)
  {
    category: 'recruitment',
    keywords: ['recruit', 'hiring', 'talent acquisition', 'job board', 'career opportunity', 'job search', 'job matching', 'interview', 'interviewer', 'candidate', 'talent engag', 'talent manage', 'job opportunity', 'employer', 'career', 'aijobs', 'job interview', 'hr data', 'hourly employee', 'professional connection', 'upwork job', 'osmos', 'verve ai interview', 'interview copilot', 'jobcopilot', 'jobed', 'job description', 'whoz copilot', 'talent deployment', 'applicant ai', 'screen job applicant', 'juicebox', 'peoplegpt', 'find specialized talent', 'lightscreen', 'coding interview']
  },

  // Customer Service (before chatbots)
  {
    category: 'customer-service',
    keywords: ['customer service', 'customer support', 'support automat', 'help desk', 'ticket', 'customer communication', 'customer conversation', 'review response', 'review management', 'reputation', 'community support', 'customer interaction', 'hotel review', 'multi-channel support', 'contact center', 'agent support'],
    excludeKeywords: ['contract', 'legal', 'healthcare', 'revenue cycle']
  },

  // Chatbot Platforms
  {
    category: 'chatbot-platforms',
    keywords: ['chatbot', 'chat bot', 'conversation bot', 'messaging bot', 'build chatbot', 'messaging channel', 'whatsapp', '30+ channel', 'messaging platform', 'botpenguin', 'gupshup', 'custom agent', 'brand representative']
  },

  // Email Marketing (before general marketing)
  {
    category: 'email-marketing',
    keywords: ['email market', 'newsletter', 'email campaign', 'email automat', 'email productiv', 'cold email', 'email draft', 'email management', 'inbox', 'email engag', 'email infrastructure', 'mailercloud', 'writemail', 'pipl.ai', 'inbox zero', 'daily.ai', 'swiftcrm', 'professional email', 'email 87%']
  },

  // ============ Image & Design ============
  {
    category: 'ai-art-generation',
    keywords: ['image generat', 'art generat', 'ai art', 'text to image', 'text-to-image', 'illustrat', 'drawing ai', 'create image', 'generate image', 'ai image', 'stock image', 'pattern', 'svg', 'visual content', 'firefly', 'midjourney', 'dalle', 'stable diffusion', 'royalty-free', 'ai horde', 'crowdsourced', 'character image', 'consistent character', 'ai creative tool', 'multimedia project', 'custom design', 'text description', 'ai-generated content', 'token limit', 'marketing asset', 'website visual', 'unrealperson', 'inspirational quote', 'prodia', 'quick qr', 'qr art', 'tattoosai', 'tattoo design', 'pixel-art', 'pixel art', 'playform', 'chichi-pui', 'letzai', 'limewire', 'imageprompt', 'apob.ai', 'rodin', '3d model from image']
  },
  {
    category: 'background-removal',
    keywords: ['background remov', 'remove background', 'bg remov', 'erase background', 'erase.bg', 'remove.bg', 'unscreen', 'video background']
  },
  {
    category: 'avatar-generation',
    keywords: ['avatar', 'headshot', 'profile photo', 'ai photo of', 'selfie', 'portrait generat']
  },
  {
    category: 'face-swap',
    keywords: ['face swap', 'faceswap', 'deepfake', 'celebrity lookalike', 'face match', 'baby face', 'future baby']
  },
  {
    category: 'logo-design',
    keywords: ['logo design', 'logo generat', 'brand design', 'logo creat', 'branded design', 'logo ai', 'logoai', '3d logo', '2d logo', 'brand identity', 'professional logo']
  },
  {
    category: 'ui-ux-design',
    keywords: ['ui design', 'ux design', 'interface design', 'figma', 'design system', 'ui component', 'prototype', 'wireframe', 'mockup', 'v0.dev', 'motiff', 'ui workflow', 'font pair', 'design asset', 'icons8', 'design variation', 'website planning', 'sitemap', 'flowmapp', 'website builder', 'b12', 'hocoos', 'website in minutes', 'business website', 'relume', 'marketing website']
  },
  {
    category: '3d-design',
    keywords: ['3d design', '3d model', '3d print', 'cad ', 'architectural render', '3d-print', 'archsynth', 'interior render', 'photorealistic render', 'architectural sketch', 'architectural design', 'residential design', '3d visual', 'immersive 3d', '3d content', 'property potential', 'living space', 'visual render', 'landscape design', 'pool design', 'backyard', 'outdoor space', 'home interior', 'room interior', 'coohom', 'garden planner', 'mechanical design', 'engineering assist', 'leiaSR', 'redesign room', 'room\'s interior', 'ai-generated concept']
  },
  {
    category: 'photo-restoration',
    keywords: ['photo restor', 'image restor', 'old photo', 'repair photo']
  },
  {
    category: 'image-editing',
    keywords: ['image edit', 'photo edit', 'image enhance', 'photo enhance', 'upscale', 'interior design', 'room design', 'roomgpt', 'reroom', 'fashion photo', 'try-on', 'virtual try', 'outfit', 'clothing', 'apparel', 'hairstyle', 'hair style', 'product image', 'product photo', 'dressx', 'fashion ai', 'virtual fashion', 'color analysis', 'color palette', 'e-commerce visual', 'product visual', 'image processing', 'isolate object', 'segment anything', 'media asset', 'imagekit', 'remini', 'blurry photo', 'hd quality', 'stunning hd', 'thedream.ai', 'ai-generated profile']
  },

  // Video Editing
  {
    category: 'video-editing',
    keywords: ['video edit', 'video cut', 'subtitle', 'caption', 'video clip', 'sports highlight', 'video produc', 'remove subtitle', 'translate video', 'ghostcut', 'localize video', 'dub video', '130+ language', 'sports match', 'analyze video', 'short-form content', 'sendshort', 'webinar', 'branded content', 'sports game', 'pixellot', 'media.io', 'hitpaw', 'wondershare filmora', 'riverside', 'tl;dv', 'video meeting', 'key insight', 'plainly', 'social clips', 'repurpose', 'munch']
  },

  // Music & Audio
  {
    category: 'music-generation',
    keywords: ['music generat', 'music track', 'music production', 'song generat', 'ai music', 'music ai', 'compose music', 'beat', 'melody', 'landr', 'aiva', 'udio', 'suno', 'sonauto', 'audio production', 'output.com', 'tracks', 'musical instrument', 'vintage instrument', 'musical gem', 'drum loop', 'drumloop', 'vocal track', 'synthesizer v', 'custom song', 'sendfame', 'song2art']
  },
  {
    category: 'audio-editing',
    keywords: ['audio edit', 'audio process', 'sound effect', 'audio master', 'music master', 'audio separat', 'sound design', 'sfx', 'podcast', 'podurama', 'jellypod', 'speech enhancem', 'ai-coustics', 'vocal remov', 'isolate vocal']
  },
  {
    category: 'text-to-speech',
    keywords: ['text-to-speech', 'text to speech', 'voice synth', 'speech synth', 'voiceover', 'voice-over', 'tts', 'dictation', 'voice to text', 'natural-sounding', 'superwhisper', 'dictate text', 'crikk', 'ai speech generat', 'lifelike ai vo']
  },
  {
    category: 'voice-cloning',
    keywords: ['voice clon', 'voice replica', 'voice interact', 'voice agent', 'soundhound', 'prank call', 'customizable voice', 'understand speech', 'speech directly', 'fakeyou', 'celebrity voice']
  },
  {
    category: 'audio-transcription',
    keywords: ['transcri', 'speech to text', 'speech-to-text', 'audio to text', 'transkriptor', 'youtube video', 'youtube summary', 'video to prompt', 'assemblyai', 'gladia', 'uniscribe', 'dictanote', 'audio and video', 'captioncreator', '50+ lang', 'omnisearch']
  },

  // Resume & Job related
  {
    category: 'resume-builder',
    keywords: ['resume', 'cv builder', 'cover letter', 'resignation letter', 'job application'],
    excludeKeywords: ['screening']
  },
  {
    category: 'resume-screening',
    keywords: ['resume screening', 'candidate screening', 'applicant tracking']
  },

  // Code & Development
  {
    category: 'code-assistant',
    keywords: ['code assist', 'coding assist', 'code complet', 'ai code', 'code ai', 'copilot', 'programming assist', 'developer tool', 'ide ', 'code editor', 'github', 'cursor', 'tabnine', 'sourcegraph', 'zed ', 'kodezi', 'software develop', 'coding workflow', 'supercharge coding', 'code migration', 'devin', 'computer vision model', 'industrial ai model', 'codecomplete', 'askcodi', 'developer productivity', 'coderabbit', 'codegpt', 'greptile', 'kodus', 'ellipsis.dev', 'pullflow', 'refact.ai', 'pearai', 'code review', 'code quality', 'static analysis'],
    excludeKeywords: ['without coding', 'no-code', 'no code', 'without code', 'zero coding']
  },
  {
    category: 'code-generation',
    keywords: ['code generat', 'generate code', 'deploy code', 'one click code', 'prompt into code', 'structured code', 'spec-driven', 'kiro', 'vly.ai', 'convert design', 'figma to code', 'design to code', 'locofy', 'anima', 'codeparrot', 'codewp', 'wordpress code', 'code snippet', 'fine']
  },
  {
    category: 'code-review',
    keywords: ['security', 'vulnerabil', 'firmware', 'malware', 'ai security', 'secure ai', 'engineering metric', 'engineering operation', 'secure generative ai', 'lakera', 'aporia', 'cranium', 'digma', 'prevent production issue']
  },
  {
    category: 'test-automation',
    keywords: ['test automat', 'visual test', 'qa automat', 'e2e test', 'applitools', 'api testing', 'software testing', 'regression', 'zero coding test', 'qodo', 'qodex', 'momentic', 'code quality', 'ai-driven testing']
  },
  {
    category: 'api-development',
    keywords: ['api develop', 'api build', 'rest api', 'graphql', 'deploy ai model', 'replicate.com', 'api integrat', 'api management', 'api lifecycle', 'deploy model', 'fine-tune model', 'multiple ai api', 'unify api', 'run ai model', 'ai inference', 'embed integration', 'rag implementation', 'web data integration', 'data stream', 'live data', 'background job', '300+ integration', 'embed 300', 'cloud computing', 'aws', 'ai application', 'langchain', 'scale ai', 'multimodal data', 'lancedb', 'edge device', 'hailo', 'computer vision dataset', 'voxel51', 'debug multimodal', 'rerun', 'training data', 'labellerr', 'cloud infrastructure', 'observability', 'middleware', 'mem0', 'persistent memory', 'ragie', 'cognee', 'memory layer', 'composio', 'eden ai', 'unify multiple ai', 'openrouter', 'every ai', 'integrate multiple ai', 'modal', 'vast.ai', 'cloud gpu', 'cerebrium', 'anyscale', 'lightning ai', 'vercel', 'frontend deployment', 'copilotkit', 'apyhub', 'vmodel', 'synexa', 'apipark', 'datature', 'superb ai', 'unitlab', 'laion', 'lighton']
  },
  {
    category: 'low-code-no-code',
    keywords: ['no-code', 'no code', 'low-code', 'low code', 'without cod', 'visual program', 'mini-app', 'glif', 'browser workflow', 'web task', 'automate browser', 'connect app', '100+ app', '1000+ app', 'relay.app', 'workato', 'celigo', 'integrate app', 'build workflow', 'orchestrate workflow', 'inngest', 'trigger.dev', 'wordpress', 'professional website', 'fronts.ai', 'hostinger', '10web', 'website with ai', 'handyplugin', 'airtable', 'custom business app', 'glide', 'softr', 'bubble', 'webwave', 'universe website', 'dora', 'zapier', 'kissflow', 'nintex', 'albato', 'smythos', 'decisions', 'axiom.ai', 'bytebot', 'gumloop', 'automa', 'buildship', 'magic loops', 'softgen', 'lovable', 'myshell', 'buildai.space', 'appsmith', 'flatlogic', 'segmind', 'harpa ai', 'simplescraper']
  },

  // Conversational AI
  {
    category: 'conversational-ai',
    keywords: ['conversational ai', 'dialogue', 'gpt', 'llm', 'language model', 'ai chat', 'chat ai', 'deepseek', 'chatgpt', 'multiple ai model', 'chad', 'roleplay', 'ai character', 'chat with ai', 'dating', 'dating app', 'conversation starter', 'gemini', 'gemma', 'ai model', 'enterprise ai solution', 'ai companion', 'companionship', 'loneliness', 'emotional support', 'meaningful conversation', 'interactive conversation', 'ai behavior', 'ai personality', 'wisent', 'venice', 'uncensored ai', 'generative ai', 'writer.com', 'creative content', 'aleph alpha', 'meta ai', 'deepmind', 'messaging assistance', 'more dates', 'wingai', 'immersive ai', 'intelligent assistant', 'claude', 'chatbox ai', 'lobechat', 'funfun ai', 'trynectar', 'replika', 'virtual companion', 'mental health support', 'therapeutic', 'woebot', 'abby', 'chatai', 'google ai studio', 'groq', 'instant inference', 'hottalks', 'wingmanx', 'dating chat', 'chatgpt svenska', 'swedish-language']
  },
  {
    category: 'virtual-assistant',
    keywords: ['virtual assistant', 'personal assistant', 'ai assistant', 'workplace productivity', 'ai prompt', 'ai for work', 'ai tool', 'business tool', 'discover ai', 'compare ai', 'curated tool', 'prompt engineer', 'promptzone', 'topai', 'relationship detail', 'meaningful gesture', 'recipe', 'meal plan', 'grocery', 'ingredient', 'smartphone issue', 'device issue', 'one-click solution', 'tenorshare', 'imobie', 'aiprm', 'prompt generation', 'blind user', 'sighted volunteer', 'live video assistance', 'be my eyes', 'sintra', 'ninja ai', 'you.com', 'specialized ai agent', 'ai library', 'ai agent store', 'dang.ai', 'dreamgift', 'gift ideas', 'giftruly', 'ai free box', 'supermemory', 'promptbase', 'god of prompt', 'promptmetheus', 'optimized prompt', 'dog breed', 'identify dog']
  },

  // Data & Analytics
  {
    category: 'sql-assistant',
    keywords: ['sql', 'database query', 'query language', 'query dataset', 'seek ai', 'natural language query', 'excel formula', 'vba code', 'dynamodb', 'spreadsheet', 'formula bot', 'data task', 'database management', 'outerbase', 'chat2db', 'text2sql', 'bricks', 'sourcetable', 'ai excel bot', 'data collection', 'databar', 'spine ai', 'data analysis']
  },
  {
    category: 'data-visualization',
    keywords: ['data visual', 'chart', 'graph', 'analytics dashboard', 'hex.tech', 'data analysis', 'diagram', 'infographic', 'visual for business', 'venngage', 'research connection', 'text into visual', 'napkin', 'mind map', 'mapify', 'visual summar', 'mylens', 'visual insight', 'landinglens', 'piktochart', 'mermaid chart', 'deepnote', 'kanaries', 'engaging visual', 'complex ideas', 'akkio', 'media agenc', 'flowpoint', 'website optimization', 'agenti']
  },
  {
    category: 'business-intelligence',
    keywords: ['business intelligence', 'bi tool', 'business plan', 'supply chain', 'inventory', 'retail operation', 'ecommerce operation', 'enterprise ai', 'enterprise data', 'customer feedback', 'product insight', 'process optim', 'innovation management', 'business operation', 'digital transform', 'business idea', 'actionable plan', 'customer insight', 'revenue insight', 'celonis', 'business concept', 'startup idea', 'business listing', 'kumo', 'construction material', 'beam ai', 'bizplanr', 'simbly.ai', 'upmetrics', 'prometai', '15minuteplan', 'ibm', 'enterprise ai adoption', 'privacera', 'predictive insight', 'graphite note', 'alation', 'data-driven decision', 'plat.ai', 'predictive model', 'feedback analysis', 'clientzen', 'cycle', 'revai', 'uncover insight']
  },
  {
    category: 'predictive-analytics',
    keywords: ['predict', 'forecast', 'trend']
  },
  {
    category: 'data-mining',
    keywords: ['data min', 'data extract', 'insight from', 'powerdrill', 'web data', 'proxy network', 'scrape', 'import product', 'data collect', 'intelligent form', 'analyze response', 'fillout', 'yay! form']
  },

  // Marketing
  {
    category: 'market-research',
    keywords: ['market research', 'competitor', 'market analysis', 'marketing strategy', 'directory submission', 'startup directory', 'brand sentiment', 'customer acquisition', 'vibe scan', '70+ marketing', 'aiter', 'news insight', 'newsbang', 'ideaape', 'consumer insight', 'reddit discussion', 'particle news', 'news summar', 'digital first ai', 'waxwing', 'marketing strateg', 'competitive research', 'competely', 'competitors app', 'track competitor', 'delve ai', 'buyer persona', 'founderpal', 'influencer campaign', 'archive', 'testimonial', 'social proof', 'senja']
  },

  // Content Creation
  {
    category: 'seo-tools',
    keywords: ['seo', 'search engine optim', 'keyword', 'ranking', 'organic traffic', 'website optim', 'higher conversion', 'ukit ai', 'best practice', 'seo-optim', 'aiseo', 'blogseq', 'abun', 'ai seo content', 'gravitywrite', 'transcope', 'growthbar', 'brandwell', 'seo writing', 'frase', 'ink', 'content codex', 'quickcreator', 'alli ai', 'zupyak', 'describely', 'seo optim', 'website rank', 'boost rank', 'diib', 'seo bot', 'seo automat', 'topical map']
  },
  {
    category: 'social-media',
    keywords: ['social media', 'twitter', 'instagram', 'linkedin', 'facebook post', 'tiktok', 'content schedul', 'social management', 'personal brand', 'linkedin brand', 'youtube channel', 'tubebuddy', 'tubemagic', 'influencer', 'eezycollab', 'revid ai', 'viral social', 'typefully', 'grow your', 'comment generator', 'timeskip', 'youtube chapters', 'moderate comment', 'social media comment', 'commentguard', 'social modera', 'nuelink']
  },
  {
    category: 'copywriting',
    keywords: ['copywriting', 'copy generat', 'marketing copy', 'product description', 'marketing content', 'jaq & jil', 'copymonkey', 'amazon product listing', 'copy.ai', 'go-to-market']
  },
  {
    category: 'ai-writing',
    keywords: ['writing', 'content creat', 'blog', 'article', 'text generat', 'content generation', 'handwritten', 'choose-your-own-adventure', 'narrative', 'story', 'documentation', 'mintlify', 'textie.ai', 'novelistai', 'dreampress', 'talefy', 'video to blog', 'hashnode', 'jenni ai', 'jotbot', 'escríbelo', 'befreed.ai', 'childbook', 'storybooks', 'bedtimestory', 'oscar stories', 'storybee', 'scarlett panda', 'book by anyone', 'autocomplete', 'writing task', 'text improvement', 'compose ai', 'email writing', 'ai-powered writing', 'tenorshare']
  },
  {
    category: 'paraphrasing-tools',
    keywords: ['paraphras', 'rewrite', 'rephrase', 'human-like content', 'bypass', 'ai undetect', 'quillbot', 'rephrasely', 'writing clarity']
  },

  // Education
  {
    category: 'language-learning',
    keywords: ['language learn', 'learn english', 'learn spanish', 'vocabulary', 'grammar']
  },
  {
    category: 'machine-translation',
    keywords: ['translat', 'language pair', 'multilingual', 'localization', 'dub', '130+ language', 'localize', 'document translation', 'doctranslate', 'preserve format']
  },
  {
    category: 'study-assistant',
    keywords: ['study', 'learning', 'education', 'tutor', 'course', 'lesson', 'academic research', 'summarize content', 'literature review', 'research workflow', 'public speaking', 'online assessment', 'tech skill', 'interactive lab', 'voice confidence', 'communication skill', 'chess', 'noctie', 'penseum', 'khanmigo', 'youlearn', 'readtheory', 'studyraid', 'packback', 'examify', 'ankideck', 'flashcard', 'mini course', 'takeoff', 'glasp', 'to-teach', 'education copilot', 'workbookpdf', 'synthesis tutor', 'teddy ai', 'tutor ai']
  },
  {
    category: 'teaching-tools',
    keywords: ['quiz', 'survey', 'assessment', 'engage', 'essay grading', 'grading', 'cograder', 'homework help', 'test prep']
  },

  // Productivity (ORDER MATTERS - more specific first)
  {
    category: 'task-management',
    keywords: ['task manag', 'project manag', 'todo', 'to-do', 'kanban', 'agile', 'team project', 'team task', 'asana', 'miro', 'whimsical', 'team collaborat', 'taskade', 'smartsheet', 'team workflow', 'project execution', 'notion', 'team knowledge', 'workspace', 'organize team', 'creately', 'performance review', 'team performance', 'feedback', 'organize task', 'craft.do', 'beautiful document', 'team communication', 'slack', 'hr operation', 'microsoft 365', 'apps 365', 'employee connection', 'company culture', 'goprofile', 'magic todo', 'goblintools', 'overwhelming task', 'manageable step', 'chatprd', 'product document', 'ai perfect assistant', 'office 365 workflow']
  },
  {
    category: 'meeting-assistant',
    keywords: ['meeting', 'video call', 'conference', 'zoom', 'teams meet', 'videoask', 'video relationship', 'video conversation']
  },
  {
    category: 'note-taking',
    keywords: ['note', 'memo', 'journal', 'knowledge base', 'wiki', 'knowledge sharing']
  },
  {
    category: 'scheduling',
    keywords: ['schedul', 'calendar', 'booking', 'appointment', 'signup form', 'time slot', 'vimcal', 'time zone']
  },
  {
    category: 'presentation-tools',
    keywords: ['presentation', 'slide', 'powerpoint', 'pitch deck', 'infographic', 'pitch material', 'slidespeak', 'decktopus', 'pageon', 'sendsteps', 'popai', 'presentations.ai']
  },
  {
    category: 'document-management',
    keywords: ['document manag', 'pdf', 'file manag', 'format document', 'spoken words into', 'aqua voice', 'document process', 'ocr', 'text extract', 'cms', 'content management', 'summarize document', 'analyze document', 'image to text', 'extract text', 'enterprise knowledge', 'gosearch', 'code documentation', 'docuwriter', 'unstructured data', 'ai-ready format']
  },
  {
    category: 'ai-detection',
    keywords: ['ai detect', 'plagiarism', 'ai content detect', 'distinguish human', 'human or ai']
  },

  // Workflow Automation (LAST - only true automation platforms)
  {
    category: 'workflow-automation',
    keywords: ['workflow automat', 'automate workflow', 'zapier', 'make.com', 'n8n', 'automation platform', 'rpa', 'robotic process', 'business process automat', 'automation anywhere', 'appian', 'jitterbit', 'complex data workflow', 'parabola', 'cargo', 'revenue-generat workflow', 'uipath', 'pega', 'boomi', 'enterprise workflow', 'end-to-end automat', 'ifttt', '900+ app', 'bardeen', 'gtm workflow', 'drymerge', 'plain english instruction', 'lutra ai', 'natural language command', 'skyvern', 'autotab', 'flowable', 'repetitive task', 'robotic agent', 'sola', 'orchestrate ai workflow', 'ai workflow', 'visual workflow']
  },

  // Finance
  {
    category: 'financial-analysis',
    keywords: ['financ', 'accounting', 'budget', 'expense', 'financial data', 'investment decision', 'daloopa', 'audit', 'finance data', 'datarails', 'datasnipper', 'digitap', 'financial compliance', 'financial process']
  },
  {
    category: 'investment-advisory',
    keywords: ['invest', 'stock', 'trading', 'portfolio', 'cryptocurrency', 'crypto', 'elsa crypto', 'composer', 'pine script', 'tradingview', 'cityfalcon', 'financial insight', 'trading strateg', 'automated trading', 'coinscreener', 'trading decision']
  },

  // Legal
  {
    category: 'legal-documents',
    keywords: ['legal', 'contract', 'agreement', 'law', 'spellbook', 'robin ai', 'legalese decoder', 'consumer rights', 'dispute resolution', 'donotpay', 'hr document', 'goheather', 'contract lifecycle', 'linksquares', 'fynk', 'contract management']
  },
  {
    category: 'compliance',
    keywords: ['compliance', 'regulat', 'audit', 'governance', 'fraud detect', 'identity verif', 'privacy', 'secure data', 'sensitive data', 'fake account', 'verisoul', 'data breach', 'gamma', 'identity theft', 'aura', 'nist-certified', 'kby-ai', 'screen time', 'online safety', 'mobicip', 'guardrails', 'ai risk', 'toxic behavior', 'personal data exposed', 'hidden personal data', 'facia', 'idscan', '3d face verif', 'id document', 'zama', 'homomorphic encryption', 'harmful content', 'content moderation', 'checkstep', 'content safety']
  },

  // Healthcare
  {
    category: 'medical-diagnosis',
    keywords: ['medical imaging', 'medical diagnosis', 'healthcare', 'patient', 'medical insight', 'licensed doctor', 'skin condition', 'health risk', 'mental wellness', 'mindfulness', 'nervous system', 'neurofit', 'tripp', 'x-ray', 'sully.ai', 'nabla', 'clinical documentation', 'revenue cycle', 'healthcare admin', 'carepatron', 'thoughtful']
  },
  {
    category: 'fitness-coaching',
    keywords: ['fitness', 'workout', 'exercise', 'gym', 'fitness coaching', 'client management', 'mycoach', 'fitnessai', 'planfit', 'shred', 'bodbot', 'smartgym', 'gymbuddy', 'coachify']
  },

  // Personalization (lower priority - catch-all for personal/recommend)
  {
    category: 'personalization',
    keywords: ['personalized', 'recommendation engine', 'personalize', 'price compar', 'second-hand', 'customer experience', 'user experience', 'experimentation', 'evolv ai', 'price track', 'optimal shopping', 'car valuation', 'value my car', 'dream interpret', 'compare price', 'australian retailer', 'zyft', 'meaningful connection', 'personal and professional', 'depassport', 'travel itinerar', 'trip planner', 'wonderplan', 'roam around', 'aicotravel', 'vacay', 'hadana', 'gift idea', 'giftron', 'gifthuntr', 'cool gift', 'gift genie', 'celebrateally', 'tarot', 'aistro', 'astrology', 'horoscope', 'bazi', 'shen-shu', 'meal plan', 'recipe', 'chefgpt', 'casa de sante', 'foodieprep', 'vital meditation', 'cuqui baby', 'baiby', 'baby name']
  }
];

interface Website {
  id: number;
  title: string;
  url: string;
  description: string;
}

function classifyWebsite(website: Website): string | null {
  const text = `${website.title} ${website.description}`.toLowerCase();

  for (const rule of CLASSIFICATION_RULES) {
    // Check exclude keywords first
    if (rule.excludeKeywords?.some(kw => text.includes(kw.toLowerCase()))) {
      continue;
    }

    // Check if any keyword matches
    if (rule.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return rule.category;
    }
  }

  return null; // No match found
}

async function main() {
  const args = process.argv.slice(2);
  const reclassifyAll = args.includes('--all');

  // Parse --category argument
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const targetCategorySlug = categoryArg ? categoryArg.split('=')[1] : null;
  const targetCategoryId = targetCategorySlug ? CATEGORIES[targetCategorySlug as keyof typeof CATEGORIES] : null;

  console.log('='.repeat(60));
  if (reclassifyAll) {
    console.log('Reclassify ALL Websites');
  } else if (targetCategorySlug && targetCategoryId) {
    console.log(`Reclassify ${targetCategorySlug} Websites (ID: ${targetCategoryId})`);
  } else {
    console.log('Reclassify Workflow-Automation Websites');
  }
  console.log('='.repeat(60));

  let websites: Website[];
  let existingAssignments: { website_id: number; category_id: number }[];

  // Determine which category ID to process
  const processCategoryId = targetCategoryId || 69; // Default to workflow-automation (69)

  if (reclassifyAll) {
    // Query ALL websites
    console.log('\nQuerying all websites...\n');

    const queryResult = execSync(
      `npx wrangler d1 execute ai-magellan-db-production --remote --json --command "SELECT id, title, url, description FROM websites"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    const jsonMatch = queryResult.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse wrangler output');
      console.error(queryResult);
      process.exit(1);
    }
    const parsed = JSON.parse(jsonMatch[0]);
    websites = parsed[0]?.results || [];

    console.log(`Found ${websites.length} total websites`);

    // Query ALL existing category assignments
    console.log('Querying all existing category assignments...\n');

    const existingCatsResult = execSync(
      `npx wrangler d1 execute ai-magellan-db-production --remote --json --command "SELECT website_id, category_id FROM website_categories"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    const existingCatsMatch = existingCatsResult.match(/\[[\s\S]*\]/);
    if (!existingCatsMatch) {
      console.error('Failed to parse existing categories');
      process.exit(1);
    }
    const existingCatsParsed = JSON.parse(existingCatsMatch[0]);
    existingAssignments = existingCatsParsed[0]?.results || [];

  } else {
    // Process specific category
    const categoryName = targetCategorySlug || 'workflow-automation';
    console.log(`\nQuerying websites from ${categoryName} category (ID: ${processCategoryId})...\n`);

    const queryResult = execSync(
      `npx wrangler d1 execute ai-magellan-db-production --remote --json --command "SELECT w.id, w.title, w.url, w.description FROM websites w JOIN website_categories wc ON w.id = wc.website_id WHERE wc.category_id = ${processCategoryId}"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    const jsonMatch = queryResult.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse wrangler output');
      console.error(queryResult);
      process.exit(1);
    }
    const parsed = JSON.parse(jsonMatch[0]);
    websites = parsed[0]?.results || [];

    console.log(`Found ${websites.length} websites in ${categoryName} category`);

    // Query existing category assignments for these websites
    console.log('Querying existing category assignments...\n');

    const existingCatsResult = execSync(
      `npx wrangler d1 execute ai-magellan-db-production --remote --json --command "SELECT website_id, category_id FROM website_categories WHERE website_id IN (SELECT DISTINCT website_id FROM website_categories WHERE category_id = ${processCategoryId})"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    const existingCatsMatch = existingCatsResult.match(/\[[\s\S]*\]/);
    if (!existingCatsMatch) {
      console.error('Failed to parse existing categories');
      process.exit(1);
    }
    const existingCatsParsed = JSON.parse(existingCatsMatch[0]);
    existingAssignments = existingCatsParsed[0]?.results || [];
  }

  // Build a map of website_id -> set of category_ids
  const websiteCategoryMap = new Map<number, Set<number>>();
  for (const assignment of existingAssignments) {
    if (!websiteCategoryMap.has(assignment.website_id)) {
      websiteCategoryMap.set(assignment.website_id, new Set());
    }
    websiteCategoryMap.get(assignment.website_id)!.add(assignment.category_id);
  }

  console.log(`Processing ${websites.length} websites...\n`);

  // Classify each website
  const reclassifications: { website: Website; newCategory: string; newCategoryId: number; oldCategoryIds: number[] }[] = [];
  const alreadyInTargetCategory: { website: Website; newCategory: string; newCategoryId: number }[] = [];
  const noMatch: Website[] = [];
  const stats: Record<string, number> = {};

  for (const website of websites) {
    const newCategory = classifyWebsite(website);

    if (newCategory) {
      const newCategoryId = CATEGORIES[newCategory as keyof typeof CATEGORIES];
      const existingCats = websiteCategoryMap.get(website.id) || new Set();

      // Check if website needs reclassification
      if (!existingCats.has(newCategoryId)) {
        reclassifications.push({
          website,
          newCategory,
          newCategoryId,
          oldCategoryIds: Array.from(existingCats)
        });
      } else if (newCategoryId !== processCategoryId) {
        // Website already in target category but still in source category - need to delete from source
        alreadyInTargetCategory.push({
          website,
          newCategory,
          newCategoryId
        });
      }
      stats[newCategory] = (stats[newCategory] || 0) + 1;
    } else {
      noMatch.push(website);
      stats['no-match'] = (stats['no-match'] || 0) + 1;
    }
  }

  // Print statistics
  console.log('Classification Statistics:');
  console.log('-'.repeat(50));
  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  for (const [category, count] of sortedStats) {
    console.log(`${category.padEnd(30)} ${count}`);
  }
  console.log('-'.repeat(50));
  console.log(`Total to reclassify: ${reclassifications.length}`);
  console.log(`Already in correct category (will delete from source): ${alreadyInTargetCategory.length}`);
  console.log(`No match (keep existing): ${noMatch.length}`);

  // Generate SQL update statements
  const sqlStatements: string[] = [];
  const categoryName = targetCategorySlug || 'workflow-automation';
  sqlStatements.push(reclassifyAll ? '-- Reclassify ALL websites' : `-- Reclassify websites from ${categoryName} (ID: ${processCategoryId})`);
  sqlStatements.push(`-- Generated at: ${new Date().toISOString()}`);
  sqlStatements.push(`-- Total reclassifications: ${reclassifications.length}`);
  sqlStatements.push('');

  let updateCount = 0;
  let insertCount = 0;
  let deleteCount = 0;

  for (const { website, newCategory, newCategoryId, oldCategoryIds } of reclassifications) {
    const existingCats = websiteCategoryMap.get(website.id) || new Set();

    if (reclassifyAll) {
      // For --all mode: add new category if not exists
      if (!existingCats.has(newCategoryId)) {
        if (existingCats.size === 0) {
          // No existing category, insert new one
          sqlStatements.push(`-- ${website.title} -> ${newCategory} (new)`);
          sqlStatements.push(`INSERT INTO website_categories (website_id, category_id) VALUES (${website.id}, ${newCategoryId});`);
          insertCount++;
        } else {
          // Has existing category, update the first non-parent category
          const nonParentCats = oldCategoryIds.filter(id => id > 100 || (id % 10 !== 0 && id !== 1 && id !== 8 && id !== 16 && id !== 24 && id !== 31 && id !== 36 && id !== 42 && id !== 48 && id !== 64 && id !== 70 && id !== 75 && id !== 81 && id !== 101));
          if (nonParentCats.length > 0) {
            sqlStatements.push(`-- ${website.title} -> ${newCategory} (was category ${nonParentCats[0]})`);
            sqlStatements.push(`UPDATE website_categories SET category_id = ${newCategoryId} WHERE website_id = ${website.id} AND category_id = ${nonParentCats[0]};`);
            updateCount++;
          } else {
            sqlStatements.push(`-- ${website.title} -> ${newCategory} (add new)`);
            sqlStatements.push(`INSERT INTO website_categories (website_id, category_id) VALUES (${website.id}, ${newCategoryId});`);
            insertCount++;
          }
        }
      }
    } else {
      // Process specific category (e.g., workflow-automation or low-code-no-code)
      if (existingCats.has(newCategoryId)) {
        // Website already in target category, just delete from source category
        sqlStatements.push(`-- ${website.title} already in ${newCategory}, removing from ${categoryName}`);
        sqlStatements.push(`DELETE FROM website_categories WHERE website_id = ${website.id} AND category_id = ${processCategoryId};`);
        deleteCount++;
      } else {
        // Website not in target category, update the category
        sqlStatements.push(`-- ${website.title} -> ${newCategory}`);
        sqlStatements.push(`UPDATE website_categories SET category_id = ${newCategoryId} WHERE website_id = ${website.id} AND category_id = ${processCategoryId};`);
        updateCount++;
      }
    }
  }

  // Process websites already in target category (need to delete from source category)
  for (const { website, newCategory } of alreadyInTargetCategory) {
    sqlStatements.push(`-- ${website.title} already in ${newCategory}, removing from ${categoryName}`);
    sqlStatements.push(`DELETE FROM website_categories WHERE website_id = ${website.id} AND category_id = ${processCategoryId};`);
    deleteCount++;
  }

  sqlStatements.unshift(`-- Updates: ${updateCount}, Inserts: ${insertCount}, Deletes: ${deleteCount}`);
  sqlStatements.splice(4, 0, ''); // Add blank line after stats

  // Write SQL file
  const outputPath = './scripts/reclassify-updates.sql';
  fs.writeFileSync(outputPath, sqlStatements.join('\n'));

  console.log(`\nSQL Operations:`);
  console.log(`  Updates: ${updateCount}`);
  console.log(`  Inserts: ${insertCount}`);
  console.log(`  Deletes: ${deleteCount}`);
  console.log(`\nSQL file generated: ${outputPath}`);
  console.log('\nTo apply changes, run:');
  console.log(`wrangler d1 execute ai-magellan-db-production --remote --file=${outputPath}`);

  // Print sample reclassifications for review
  console.log('\n\nSample Reclassifications (first 30):');
  console.log('='.repeat(80));
  for (const { website, newCategory, oldCategoryIds } of reclassifications.slice(0, 30)) {
    console.log(`[${newCategory}] ${website.title} (was: ${oldCategoryIds.join(', ') || 'none'})`);
    console.log(`  Desc: ${website.description.substring(0, 70)}...`);
    console.log('');
  }

  if (alreadyInTargetCategory.length > 0) {
    console.log('\n\nWebsites already in correct category (will delete from source):');
    console.log('='.repeat(80));
    for (const { website, newCategory } of alreadyInTargetCategory.slice(0, 20)) {
      console.log(`[${newCategory}] ${website.title}`);
      console.log(`  Desc: ${website.description.substring(0, 70)}...`);
      console.log('');
    }
  }

  if (noMatch.length > 0) {
    console.log('\n\nWebsites with no match (first 20):');
    console.log('='.repeat(80));
    for (const website of noMatch.slice(0, 20)) {
      console.log(`${website.title}`);
      console.log(`  Desc: ${website.description.substring(0, 70)}...`);
      console.log('');
    }
  }
}

main().catch(console.error);
