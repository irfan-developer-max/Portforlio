// Groq Cloud API service for Portfolio AI Chatbot

const STORAGE_KEY_API = 'portfolio_groq_api_key';
const STORAGE_KEY_MODEL = 'portfolio_groq_model';

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (High Intelligence - Recommended)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Fast & Accurate)' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (Ultra-Fast)' },
];

export function getActiveApiKey() {
  if (typeof window === 'undefined') return '';
  const localKey = localStorage.getItem(STORAGE_KEY_API);
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_AI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export function saveActiveApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_API, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API);
  }
}

export function getSelectedModel() {
  if (typeof window === 'undefined') return GROQ_MODELS[0].id;
  const stored = localStorage.getItem(STORAGE_KEY_MODEL);
  if (stored && GROQ_MODELS.some((m) => m.id === stored)) {
    return stored;
  }
  return GROQ_MODELS[0].id;
}

export function saveSelectedModel(modelId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODEL, modelId);
}

export const IRFAN_SYSTEM_PROMPT = `
You are Irfan's AI Portfolio Assistant, an intelligent, friendly, and professional representative for Mohd Irfan.
Your goal is to showcase Irfan's capabilities, experience, skills, and projects to recruiters, engineering managers, and visitors.

About Mohd Irfan:
- Role: Full Stack Developer & Backend Developer
- Location: Hyderabad, Telangana, India
- Email: iamirfan6767@gmail.com
- GitHub: https://github.com/123irf
- LinkedIn: https://www.linkedin.com/in/mohd-irfan-irfan

Work Experience:
1. Full Stack Developer at Teketreeinc (Jun 10, 2026 - Present | Full-time | Hyderabad, India):
   - Working on modern full-stack systems, architecting end-to-end features, and optimizing performance.
2. Backend Developer at Befach International (Jun 23, 2025 - May 31, 2026 | Full-time | Hyderabad, India):
   - Developed scalable APIs, secure authentication systems, multi-step order workflows, and real-time shipment tracking for B2B e-commerce platforms.

Technical Skills:
- Frontend: React.js, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Responsive Web Design.
- Backend: Node.js, Express.js, Python, Django, RESTful APIs, Microservices architecture.
- Databases: MySQL, PostgreSQL, MongoDB, Apache Cassandra.
- Developer Tools: Git & GitHub, VS Code, Postman, Vite, API Integration, Linux, Vercel.

Featured Projects:
1. Kidzofi (https://www.kidzofi.com/):
   - Educational platform with responsive UI, scalable backend integration, and user-centric features.
2. B2B E-commerce Platform (https://www.befach.com/en):
   - Production B2B solution featuring authentication, order tracking, shipment workflows, and payment integration.
3. Jewellory ERP:
   - Specialized jewelry ERP software with real-time stock/inventory tracking, custom billing, order management, and operational analytics.
4. Staffing & Manpower Solutions (https://staffing-app-nine.vercel.app/):
   - Comprehensive staffing and manpower recruitment web platform featuring specialized talent supply, workforce management across industries, and client inquiry workflows.
5. URL Shortener Application:
   - High-throughput URL shortening service with analytics and optimized redirects built with Node.js and MySQL.

Personality and Formatting Guidelines:
- Format all responses in clean, friendly, natural text format.
- STRICT RULE: Do NOT use markdown tables or pipe symbols (|). Never generate tables with |---| or columns.
- Do NOT use raw markdown header tags like ### or ##. Use clean bold titles instead (e.g., **Frontend Skills:**).
- Use clear bullet points (- or •) and short, readable paragraphs with line breaks.
- Highlight key terms with bold text (**React.js**, **Node.js**, **Teketreeinc**).
- Be concise, direct, helpful, and courteous.
- If asked about hiring or interviews, encourage them to reach out via email (iamirfan6767@gmail.com) or LinkedIn.
- If asked questions unrelated to Irfan, software development, or his portfolio, politely guide the conversation back to Mohd Irfan's work.
`;

export async function sendChatMessage(messages, customApiKey = null) {
  const apiKey = customApiKey || getActiveApiKey();
  if (!apiKey) {
    throw new Error(
      'MISSING_KEY: Please add your Groq API key in the Chatbot Settings or in the .env file (VITE_GROQ_API_KEY).'
    );
  }

  const model = getSelectedModel();

  const formattedMessages = [
    { role: 'system', content: IRFAN_SYSTEM_PROMPT.trim() },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error?.message || `Groq API responded with status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'No response received.';
  return reply;
}
