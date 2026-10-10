/**
 * App config from Vite env. Everywhere else: `import { config } from '...'`.
 */

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiPrefix = '/api';

export const config = {
  apiUrl,
  apiPrefix,
  apiBase: `${apiUrl}${apiPrefix}`,
  storageKeys: {
    token: 'ss.token',
    guest: 'ss.guest',
  },
};
