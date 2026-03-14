// Vendor environment variable mappings for Clavis
// This file provides a searchable list of common vendors and their environment variables

const vendorEnvVars = [
  // AI Platforms
  { name: 'OpenAI', env: 'OPENAI_API_KEY' },
  { name: 'Anthropic', env: 'ANTHROPIC_API_KEY' },
  { name: 'Google', env: 'GOOGLE_API_KEY' },
  { name: 'Groq', env: 'GROQ_API_KEY' },
  { name: 'Mistral AI', env: 'MISTRAL_API_KEY' },
  { name: 'Perplexity AI', env: 'PPLX_API_KEY' },
  { name: 'DeepSeek', env: 'DEEPSEEK_API_KEY' },
  { name: 'DashScope', env: 'DASHSCOPE_API_KEY' },
  { name: 'Zhipu AI', env: 'ZHIPUAI_API_KEY' },
  { name: 'Moonshot AI', env: 'MOONSHOT_API_KEY' },
  { name: 'Ark', env: 'ARK_API_KEY' },
  { name: 'DeepInfra', env: 'DEEPINFRA_API_KEY' },
]

/**
 * Search vendor environment variables by name or env
 * @param {string} searchTerm - Search term (case-insensitive)
 * @returns {Array} Filtered array of vendor objects
 */
function searchVendorEnvVars(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return vendorEnvVars
  }

  const term = searchTerm.toLowerCase().trim()

  return vendorEnvVars.filter(vendor => {
    return (
      vendor.name.toLowerCase().includes(term) ||
      vendor.env.toLowerCase().includes(term)
    )
  })
}

export { searchVendorEnvVars }