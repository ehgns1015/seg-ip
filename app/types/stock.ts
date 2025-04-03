/**
 * Core types for the stock management system
 */

/**
 * Represents the possible locations for stock items
 */
export type Location = 'Wiley' | 'Redding' | 'Jane';

/**
 * Represents a stock item in the system
 */
export interface StockItem {
  _id?: string;
  item: string;              // Unique identifier for the item
  quantity: number;          // Current quantity of the item
  EOS: boolean;              // End of Stock indicator
  updated: Date;             // Last updated timestamp
  updatedFormatted?: string; // Formatted updated date (mm/dd/yyyy tt:mm)
  location: Location;        // Location where the item is stored
  note?: string;             // Additional notes for the item
}

/**
 * Form data structure used for item creation and editing
 */
export interface StockFormData {
  item: string;
  quantity: number;
  EOS: boolean;
  location: Location;
  note?: string;
}