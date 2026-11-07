import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Extend AxiosRequestConfig to track request start timestamp
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

export function initApiLogger() {
  console.log(
    '%c 🛠️ Medico Client API Debugging Enabled ',
    'background: #0d9488; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 6px;'
  );

  // 1. Axios Request Interceptor
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.metadata = { startTime: performance.now() };

      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const method = (config.method || 'GET').toUpperCase();
      const url = config.url || '';

      console.groupCollapsed(
        `%c🚀 [API REQ] ${method} %c${url}`,
        'color: #2563eb; font-weight: bold;',
        'color: #374151; font-weight: normal;'
      );
      console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
      console.log('🔗 URL:', url);
      console.log('📄 Method:', method);
      if (config.params) console.log('🔍 Query Params:', config.params);
      if (config.data) {
        if (config.data instanceof FormData) {
          const formEntries: Record<string, any> = {};
          config.data.forEach((val, key) => { formEntries[key] = val; });
          console.log('📦 Body (FormData):', formEntries);
        } else {
          console.log('📦 Body (JSON):', config.data);
        }
      }
      console.log('⚙️ Options:', { withCredentials: config.withCredentials, headers: config.headers });
      console.groupEnd();

      return config;
    },
    (error: AxiosError) => {
      console.log('%c❌ [API REQ ERROR]', 'color: #dc2626; font-weight: bold;', error);
      return Promise.reject(error);
    }
  );

  // 2. Axios Response Interceptor
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      const startTime = response.config.metadata?.startTime || performance.now();
      const duration = (performance.now() - startTime).toFixed(1);
      const method = (response.config.method || 'GET').toUpperCase();
      const url = response.config.url || '';
      const status = response.status;

      console.groupCollapsed(
        `%c✅ [API RES ${status}] %c${method} %c${url} %c(${duration}ms)`,
        'color: #059669; font-weight: bold;',
        'color: #2563eb; font-weight: bold;',
        'color: #374151; font-weight: normal;',
        'color: #6b7280; font-style: italic;'
      );
      console.log('📊 Status:', status, response.statusText);
      console.log('⚡ Execution Time:', `${duration}ms`);
      console.log('📥 Response Payload:', response.data);
      console.groupEnd();

      return response;
    },
    (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined;
      const startTime = config?.metadata?.startTime || performance.now();
      const duration = (performance.now() - startTime).toFixed(1);
      const method = (config?.method || 'REQ').toUpperCase();
      const url = config?.url || 'Unknown URL';
      const status = error.response?.status || 'FAIL';

      console.groupCollapsed(
        `%c❌ [API ERR ${status}] %c${method} %c${url} %c(${duration}ms)`,
        'color: #dc2626; font-weight: bold;',
        'color: #2563eb; font-weight: bold;',
        'color: #374151; font-weight: normal;',
        'color: #6b7280; font-style: italic;'
      );
      console.log('⚠️ Error Message:', error.message);
      console.log('📊 Status Code:', status);
      console.log('⚡ Execution Time:', `${duration}ms`);
      if (status === 401 && !url.includes('login') && !url.includes('register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }

      console.groupEnd();

      return Promise.reject(error);
    }
  );

  // 3. Patch window.fetch to capture any raw fetch calls as well
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const startTime = performance.now();
    const input = args[0];
    const init = args[1];
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || 'GET').toUpperCase();

    console.groupCollapsed(
      `%c🚀 [FETCH REQ] ${method} %c${url}`,
      'color: #7c3aed; font-weight: bold;',
      'color: #374151; font-weight: normal;'
    );
    console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
    console.log('🔗 URL:', url);
    console.log('📄 Method:', method);
    if (init?.body) console.log('📦 Body:', init.body);
    console.groupEnd();

    try {
      const response = await originalFetch.apply(this, args);
      const duration = (performance.now() - startTime).toFixed(1);
      const status = response.status;
      const isOk = response.ok;

      console.groupCollapsed(
        `%c${isOk ? '✅' : '❌'} [FETCH RES ${status}] %c${method} %c${url} %c(${duration}ms)`,
        isOk ? 'color: #059669; font-weight: bold;' : 'color: #dc2626; font-weight: bold;',
        'color: #7c3aed; font-weight: bold;',
        'color: #374151; font-weight: normal;',
        'color: #6b7280; font-style: italic;'
      );
      console.log('📊 Status:', status);
      console.log('⚡ Execution Time:', `${duration}ms`);
      console.groupEnd();

      return response;
    } catch (err) {
      const duration = (performance.now() - startTime).toFixed(1);
      console.groupCollapsed(
        `%c❌ [FETCH ERR] %c${method} %c${url} %c(${duration}ms)`,
        'color: #dc2626; font-weight: bold;',
        'color: #7c3aed; font-weight: bold;',
        'color: #374151; font-weight: normal;',
        'color: #6b7280; font-style: italic;'
      );
      console.log('💥 Error:', err);
      console.groupEnd();
      throw err;
    }
  };
}
