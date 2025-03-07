import axios from "axios";
import type { FormData } from "@/app/models/formData";

/**
 * API service for handling all API requests related to units.
 */
export const apiService = {
  /**
   * Fetches all units from the API.
   * 
   * @returns {Promise<Array<any>>} Array of unit objects
   */
  getAllUnits: async (): Promise<Array<any>> => {
    try {
      const response = await axios.get("/api/units");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches a specific unit by name.
   * 
   * @param {string} name - The name of the unit to fetch
   * @returns {Promise<any>} The unit object
   */
  getUnitByName: async (name: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/units/${name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Creates a new unit.
   * 
   * @param {FormData} data - The unit data to create
   * @returns {Promise<any>} The created unit
   */
  createUnit: async (data: FormData): Promise<any> => {
    try {
      const response = await axios.post("/api/units", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Updates an existing unit.
   * 
   * @param {string} name - The name of the unit to update
   * @param {FormData} data - The updated unit data
   * @returns {Promise<any>} The updated unit
   */
  updateUnit: async (name: string, data: FormData): Promise<any> => {
    try {
      const response = await axios.put(`/api/units/${name}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Deletes a unit by name.
   * 
   * @param {string} name - The name of the unit to delete
   * @returns {Promise<any>} The response from the API
   */
  deleteUnit: async (name: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/units/${name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Checks if an IP address is available.
   * 
   * @param {string} ip - The IP address to check
   * @returns {Promise<{ available: boolean; message: string }>} Object indicating availability and a message
   */
  checkIPAvailability: async (ip: string): Promise<{ available: boolean; message: string }> => {
    try {
      const response = await axios.post("/api/units/check-ip", { ip });
      return { available: true, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        return { available: false, message: error.response.data.message };
      }
      return { available: false, message: "Error checking IP" };
    }
  },

  /**
   * Error handler for API errors.
   * 
   * @param {unknown} error - The error object
   * @returns {string} The error message
   */
  handleError: (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || "Server error";
    }
    return "An unexpected error occurred";
  }
};