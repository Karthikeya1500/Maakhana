// Axios instance with default configuration
import axios from "axios"
import { serverUrl } from "../config"

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
})

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could redirect to login
      console.warn("Authentication expired")
    }
    return Promise.reject(error)
  }
)

export default api
