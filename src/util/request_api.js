// utils/request_api.js
import axios from "axios";
import Auth from "./auth";
const errorServer = "ម៉ាសុីនមេមានបញ្ហា សូមព្យាយាមម្តងទៀតពេលក្រោយ!";
const errorRequest = "ការទាញយកទិន្នន័យមានបញ្ហា សូមព្យាយាមម្តងទៀតពេលក្រោយ!";
const auth = new Auth();

/**
 * Handles error responses from axios
 */
const handleAxiosError = (error) => {
  if (error.response) {
    if (error.response?.status == 401) {
      // Auto Logout
      auth.removeClientLogin();
      setTimeout(() => {
        window.location.replace("/");
      }, 5);
    } else {
      return {
        success: false,
        message: error.response.data?.message || errorServer,
        status: error.response.status,
      };
    }
  } else if (error.request) {
    return {
      success: false,
      message: errorServer,
      status: 0,
    };
  } else {
    return {
      success: false,
      message: error.message,
      status: 0,
    };
  }
};

/**
 * POST request
 */
export const postRequest = async (url, data, token) => {
  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: token },
    });

    if (response.data?.success) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        message: response.data.message || errorRequest,
      };
    }
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * GET request by ID
 */
export const getByIdRequest = async (url, token) => {
  try {
    const response = await axios.get(url, {
      headers: { Authorization: token },
    });

    if (response.data?.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        message: response.data.message || errorRequest,
      };
    }
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * PUT request (Update)
 */
export const updateRequest = async (url, data, token) => {
  try {
    const response = await axios.put(url, data, {
      headers: { Authorization: token },
    });

    if (response.data?.success) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        message: response.data.message || errorRequest,
      };
    }
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * GET all request with optional query (pagination, search, filters)
 */
export const getAllRequest = async (url, token, query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await axios.get(fullUrl, {
      headers: { Authorization: token },
    });

    if (response?.data?.success) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        message: response.data?.message || errorRequest,
      };
    }
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * DELETE request
 * @param {string} url - The API endpoint
 * @param {string} token - Bearer token for authorization
 * @returns {Object} - Response data or error
 */
export const deleteRequest = async (url, token) => {
  try {
    const response = await axios.delete(url, {
      headers: { Authorization: token },
    });

    if (response.data?.success) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        message: response.data.message || "ការលុបបរាជ័យ",
      };
    }
  } catch (error) {
    return handleAxiosError(error);
  }
};
