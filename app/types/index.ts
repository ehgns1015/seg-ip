/**
 * Core application types shared across components
 */

/**
 * Represents a unit entity in the system (employee or machine)
 */
export interface Unit {
    _id: string;
    name: string;
    ip: string;
    type?: "employee" | "machine";
    sharedComputer?: boolean;
    primaryUser?: string | null;
    MAC?: string;
    department?: string;
    email?: string;
    note?: string;
    [key: string]: string | boolean | number | null | undefined;
  }
  
  /**
   * Form data structure used for unit creation and editing
   */
  export interface FormData {
    name: string;
    ip: string;
    MAC: string;
    type: string;
    sharedComputer?: boolean;
    primaryUser?: string | null;
    note?: string;
    [key: string]: string | boolean | null | undefined;
  }