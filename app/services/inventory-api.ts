import axios from "axios";
import type { InventoryItem, InventoryFormData, Location } from "@/app/types/inventory";

/**
 * API service for handling all API requests related to inventory.
 */
export const inventoryApiService = {
  /**
   * Fetches all inventory items or filters by location.
   * 
   * @param {Location} location - Optional location to filter items
   * @returns {Promise<Array<InventoryItem>>} Array of inventory items
   */
  getAllItems: async (location?: Location): Promise<Array<InventoryItem>> => {
    try {
      const url = location ? `/api/inventory?location=${location}` : "/api/inventory";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }
  },

  /**
   * Fetches a specific inventory item by name.
   * 
   * @param {string} item - The name of the item to fetch
   * @returns {Promise<InventoryItem>} The inventory item
   */
  getItemByName: async (item: string): Promise<InventoryItem> => {
    try {
      const response = await axios.get(`/api/inventory/${encodeURIComponent(item)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      throw error;
    }
  },

  /**
   * Creates a new inventory item.
   * 
   * @param {InventoryFormData} data - The inventory item data to create
   * @returns {Promise<InventoryItem>} The created inventory item
   */
  createItem: async (data: InventoryFormData): Promise<InventoryItem> => {
    try {
      const response = await axios.post("/api/inventory", data);
      return response.data;
    } catch (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }
  },

  /**
   * Updates an existing inventory item.
   * 
   * @param {string} item - The name of the item to update
   * @param {InventoryFormData} data - The updated inventory data
   * @returns {Promise<InventoryItem>} The updated inventory item
   */
  updateItem: async (item: string, data: Partial<InventoryFormData>): Promise<InventoryItem> => {
    try {
      const response = await axios.put(`/api/inventory/${encodeURIComponent(item)}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }
  },

  /**
   * Deletes an inventory item by name.
   * 
   * @param {string} item - The name of the item to delete
   * @returns {Promise<{ message: string }>} The response from the API
   */
  deleteItem: async (item: string): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`/api/inventory/${encodeURIComponent(item)}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting inventory item:", error);
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