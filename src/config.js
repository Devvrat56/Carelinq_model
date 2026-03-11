const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = apiBase;

// Smart-derive WS URL: swap http with ws or https with wss
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || apiBase.replace(/^http/, 'ws');
