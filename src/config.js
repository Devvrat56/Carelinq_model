let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Auto-fix: Prepend https:// if protocol is missing (e.g. "my-app.railway.app" -> "https://my-app.railway.app")
if (apiBase && !apiBase.startsWith('http') && !apiBase.includes('localhost')) {
    apiBase = `https://${apiBase}`;
}

export const API_BASE_URL = apiBase;

// Smart-derive WS URL: swap http with ws or https with wss
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || apiBase.replace(/^http/, 'ws');
