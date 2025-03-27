/**
 * Represents a single cable stock item in inventory.
 */
export interface CableStockItem {
    /** Combined category and type value (구분-종류) */
    type: string;
    
    /** LINNO identifier value */
    linno: string;
    
    /** Current quantity in stock */
    quantity: number;
  }
  
  /**
   * Represents monthly cable stock data stored in the database.
   */
  export interface CableStockData {
    /** Month in MM/YYYY format */
    month: string;
    
    /** Collection of stock items for this month */
    items: CableStockItem[];
    
    /** Date when this data was uploaded */
    uploadDate: Date;
  }
  
  /**
   * Represents consumption data between two months.
   */
  export interface ConsumptionData {
    /** Starting month in MM/YYYY format */
    fromMonth: string;
    
    /** Ending month in MM/YYYY format */
    toMonth: string;
    
    /** Collection of consumption items showing changes */
    items: ConsumptionItem[];
  }
  
  /**
   * Represents consumption information for a single item.
   */
  export interface ConsumptionItem {
    /** Cable type identifier */
    type: string;
    
    /** LINNO identifier value */
    linno: string;
    
    /** Original quantity in fromMonth */
    fromQuantity: number;
    
    /** Final quantity in toMonth */
    toQuantity: number;
    
    /** Amount consumed (fromQuantity - toQuantity) */
    consumption: number;
    
    /** Percentage of original stock consumed */
    consumptionRate: string;

    /** Monthly consumption rate */
    toLinno?: string;

    /** Flag indicating if the LINNO has changed */
    linnoChanged?: boolean;  
  }