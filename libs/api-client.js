/**
 * API客户端
 */
class ApiClient {
  constructor() {
    this.baseUrl = 'https://api.example.com'; // 示例API地址
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 设置认证token
   * @param {string} token - 认证token
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 通用请求方法
   * @param {string} endpoint - API端点
   * @param {string} method - HTTP方法
   * @param {Object} data - 请求数据
   * @param {Object} headers - 自定义请求头
   * @returns {Promise} API响应
   */
  async request(endpoint, method = 'GET', data = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 快捷方法
  async get(endpoint, headers = {}) {
    return this.request(endpoint, 'GET', null, headers);
  }

  async post(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, 'POST', data, headers);
  }

  async put(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, 'PUT', data, headers);
  }

  async delete(endpoint, headers = {}) {
    return this.request(endpoint, 'DELETE', null, headers);
  }

  // 扩展特定的API方法
  async getUserProfile(userId) {
    return this.get(`/users/${userId}/profile`);
  }

  async updateSettings(settings) {
    return this.post('/settings', settings);
  }

  async getHistory(page = 1, limit = 20) {
    return this.get(`/history?page=${page}&limit=${limit}`);
  }
}

// 创建单例
const apiClient = new ApiClient();

export default apiClient;