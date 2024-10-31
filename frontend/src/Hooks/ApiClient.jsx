// ApiClient.js
const BASE_API_URL = import.meta.env.VITE_APP_API_URL || "https://minservice.live";

export default class ServiceApiClient {
  constructor() {
    this.base_url = BASE_API_URL + "/api";
  }

  async request(options) {
    let query = new URLSearchParams(options.query || {}).toString();
    if (query !== "") {
      query = "?" + query;
    }

    let response;
    try {
      response = await fetch(this.base_url + options.url + query, {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
        body: options.body ? JSON.stringify(options.body) : null,
      });
    } catch (error) {
      // Handle network or fetch errors
      return {
        ok: false,
        status: 500,
        body: {
          code: 500,
          message: "The server is unresponsive",
          description: error.toString(),
        },
      };
    }

    let responseBody = null;
    if (response.status !== 204) {
      try {
        responseBody = await response.json();
      } catch (error) {
        responseBody = {
          code: response.status,
          message: "Invalid JSON response",
          description: error.toString(),
        };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      body: responseBody,
    };
  }

  async get(url, query = {}, options = {}) {
    return this.request({ method: "GET", url, query, ...options });
  }

  async post(url, body, options = {}) {
    return this.request({ method: "POST", url, body, ...options });
  }

  async put(url, body, options = {}) {
    return this.request({ method: "PUT", url, body, ...options });
  }

  async delete(url, options = {}) {
    return this.request({ method: "DELETE", url, ...options });
  }
}
