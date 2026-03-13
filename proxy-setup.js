// Proxy setup for local development
// Loaded via NODE_OPTIONS before Next.js starts
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
if (proxyUrl) {
  const { setGlobalDispatcher, ProxyAgent } = require("undici")
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
  console.log(`[proxy] Using proxy: ${proxyUrl}`)
}
