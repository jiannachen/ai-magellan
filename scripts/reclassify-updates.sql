-- Updates: 12, Inserts: 0, Deletes: 21
-- Reclassify websites from low-code-no-code (ID: 30)
-- Generated at: 2026-01-23T11:34:42.577Z
-- Total reclassifications: 12


-- Munch -> video-editing
UPDATE website_categories SET category_id = 18 WHERE website_id = 906 AND category_id = 30;
-- Zarla AI Website Builder -> ui-ux-design
UPDATE website_categories SET category_id = 14 WHERE website_id = 243 AND category_id = 30;
-- Fine -> code-generation
UPDATE website_categories SET category_id = 26 WHERE website_id = 1715 AND category_id = 30;
-- Claap -> sales-automation
UPDATE website_categories SET category_id = 45 WHERE website_id = 2204 AND category_id = 30;
-- Flatlogic -> code-assistant
UPDATE website_categories SET category_id = 25 WHERE website_id = 1681 AND category_id = 30;
-- CodeWP -> code-generation
UPDATE website_categories SET category_id = 26 WHERE website_id = 1726 AND category_id = 30;
-- B12 -> ui-ux-design
UPDATE website_categories SET category_id = 14 WHERE website_id = 240 AND category_id = 30;
-- Hocoos AI Website Builder -> ui-ux-design
UPDATE website_categories SET category_id = 14 WHERE website_id = 246 AND category_id = 30;
-- Bizagi -> code-assistant
UPDATE website_categories SET category_id = 25 WHERE website_id = 199 AND category_id = 30;
-- Senja -> market-research
UPDATE website_categories SET category_id = 43 WHERE website_id = 1243 AND category_id = 30;
-- Question AI -> teaching-tools
UPDATE website_categories SET category_id = 53 WHERE website_id = 1910 AND category_id = 30;
-- Universe Website Builder -> ui-ux-design
UPDATE website_categories SET category_id = 14 WHERE website_id = 1456 AND category_id = 30;
-- Playform already in ai-art-generation, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 965 AND category_id = 30;
-- Zenity already in code-review, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 261 AND category_id = 30;
-- Relume already in ui-ux-design, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 657 AND category_id = 30;
-- hachidori already in chatbot-platforms, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1201 AND category_id = 30;
-- Appy Pie already in chatbot-platforms, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1514 AND category_id = 30;
-- Arsturn already in chatbot-platforms, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1522 AND category_id = 30;
-- glif already in chatbot-platforms, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1524 AND category_id = 30;
-- TextIt already in chatbot-platforms, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1202 AND category_id = 30;
-- Flowise already in conversational-ai, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1516 AND category_id = 30;
-- BuildAI.space already in api-development, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1517 AND category_id = 30;
-- Locofy.ai already in ui-ux-design, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1679 AND category_id = 30;
-- Make already in workflow-automation, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1706 AND category_id = 30;
-- Segmind already in ai-art-generation, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1708 AND category_id = 30;
-- Gemini Coder already in conversational-ai, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1725 AND category_id = 30;
-- Poper already in ad-optimization, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 2110 AND category_id = 30;
-- testRigor already in test-automation, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 555 AND category_id = 30;
-- Examly already in language-learning, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1820 AND category_id = 30;
-- Autify already in test-automation, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 561 AND category_id = 30;
-- MTestHub already in recruitment, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1932 AND category_id = 30;
-- TutorOcean already in study-assistant, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1831 AND category_id = 30;
-- UChat already in customer-service, removing from low-code-no-code
DELETE FROM website_categories WHERE website_id = 1200 AND category_id = 30;