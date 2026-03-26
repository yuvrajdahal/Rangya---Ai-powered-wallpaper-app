const BASE_URL = `http://192.168.100.13:3000`;

export const buildUrl = (url?: string | null) =>
  url?.startsWith("http") ? url : `${BASE_URL}${url}`;
