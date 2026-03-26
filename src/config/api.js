import axios from 'axios';

const api = axios.create({
  baseURL: 'https://englishability.rootadviser.com/api/',
  // baseURL:'http://192.168.3.50:9005/api/',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // 檢查是否為 401 且不是刷新接口本身
    if (error.response && error.response.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        console.log('[系統] 正在自動刷新 Token...');
        const response = await api.post('students/refresh/', {
          refresh: refreshToken
        });

        // 相容 token 或 access 欄位
        const newAccessToken = response.data.token || response.data.access;
        const newRefreshToken = response.data.refresh;

        if (!newAccessToken) {
          throw new Error('無法從 Refresh API 取得新的 Access Token');
        }

        console.log('[系統] 刷新成功，正在更新保險箱...');
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 更新這一次失敗請求的標頭
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // 重新發送請求
        return api(originalRequest);

      } catch (refreshError) {
        console.error('[系統] 刷新機制徹底失敗:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;