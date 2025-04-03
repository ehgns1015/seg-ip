import axios from "axios";
import type { StockItem, StockFormData, Location } from "@/app/types/stock";

/**
 * API service for handling all API requests related to stock.
 */
export const stockApiService = {
  /**
   * Fetches all stock items or filters by location.
   * 
   * @param {Location} location - Optional location to filter items
   * @returns {Promise<Array<StockItem>>} Array of stock items
   */
  getAllItems: async (location?: Location): Promise<Array<StockItem>> => {
    try {
      const url = location ? `/api/stock?location=${location}` : "/api/stock";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching stock items:", error);
      throw error;
    }
  },

  /**
   * Fetches a specific stock item by name.
   * 
   * @param {string} item - The name of the item to fetch
   * @returns {Promise<StockItem>} The stock item
   */
  getItemByName: async (item: string): Promise<StockItem> => {
    try {
      const response = await axios.get(`/api/stock/${encodeURIComponent(item)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching stock item:", error);
      throw error;
    }
  },

  /**
   * Creates a new stock item.
   * 
   * @param {StockFormData} data - The stock item data to create
   * @returns {Promise<StockItem>} The created stock item
   */
  createItem: async (data: StockFormData): Promise<StockItem> => {
    try {
      const response = await axios.post("/api/stock", data);
      return response.data;
    } catch (error) {
      console.error("Error creating stock item:", error);
      throw error;
    }
  },

  /**
   * Updates an existing stock item.
   * 
   * @param {string} item - The name of the item to update
   * @param {StockFormData} data - The updated stock data
   * @returns {Promise<StockItem>} The updated stock item
   */
  updateItem: async (item: string, data: Partial<StockFormData>): Promise<StockItem> => {
    try {
      const response = await axios.put(`/api/stock/${encodeURIComponent(item)}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating stock item:", error);
      throw error;
    }
  },

  /**
   * Deletes a stock item by name.
   * 
   * @param {string} item - The name of the item to delete
   * @returns {Promise<{ message: string }>} The response from the API
   */
  deleteItem: async (item: string): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`/api/stock/${encodeURIComponent(item)}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting stock item:", error);
      throw error;
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