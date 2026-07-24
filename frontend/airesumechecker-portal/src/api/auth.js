import { apiClient, TOKEN_KEY } from './client';

export const authApi = {
  register: (payload) =>
    apiClient.post('/auth/register', payload).then((r) => {
      if (r.data.token) localStorage.setItem(TOKEN_KEY, r.data.token);
      return r.data;
    }),
  login: (payload) =>
    apiClient.post('/auth/login', payload).then((r) => {
      if (r.data.token) localStorage.setItem(TOKEN_KEY, r.data.token);
      return r.data;
    }),
  logout: () =>
    apiClient.post('/auth/logout').then((r) => {
      localStorage.removeItem(TOKEN_KEY);
      return r.data;
    }),
  me: () => apiClient.get('/auth/me').then((r) => r.data),
  updateProfile: (payload) => apiClient.patch('/auth/profile', payload).then((r) => r.data),
  changePassword: (payload) => apiClient.patch('/auth/password', payload).then((r) => r.data),

  // register: async ({ name, email }) => {
  //   await mockDelay();
  //   const u = { ...mockUser, name: name || mockUser.name, email: email || mockUser.email };
  //   saveMockUser(u);
  //   return { user: u };
  // },

  // login: async ({ email }) => {
  //   await mockDelay();
  //   const u = { ...mockUser, email: email || mockUser.email };
  //   saveMockUser(u);
  //   return { user: u };
  // },

  // logout: async () => {
  //   await mockDelay(150);
  //   saveMockUser(null);
  //   return { ok: true };
  // },

  // me: async () => {
  //   await mockDelay(150);
  //   const u = loadMockUser();
  //   if (!u) {
  //     // mimic the 401 the real backend would throw → AuthContext shows /login
  //     throw { status: 401, message: 'Not authenticated' };
  //   }
  //   return { user: u };
  // },

  // updateProfile: async (payload) => {
  //   await mockDelay();
  //   const current = loadMockUser() || mockUser;
  //   const u = { ...current, ...payload };
  //   saveMockUser(u);
  //   return { user: u };
  // },

  // changePassword: async () => {
  //   await mockDelay();
  //   return { ok: true };
  // },
};
