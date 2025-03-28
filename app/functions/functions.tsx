/**
 * Utility functions for the IP management application.
 * Contains functions for field labeling and IP address handling.
 */

/**
 * Field label mapping
 */
const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  ip: "IP Address",
  department: "Department",
  pc: "PC Model",
  MAC: "MAC Address",
  officeKey: "MS Office",
  email: "E-mail",
  ePw: "E-mail Password",
  badge: "Badge#",
  ea: "EA Account",
  eaPw: "EA Password",
  device: "Device",
  printer1: "Printer#1",
  printer2: "Printer#2",
  scanner: "Scanner",
  PLC: "PLC",
  username: "Username",
  pw: "Password",
  line: "Line",
  sharedComputer: "Shared Computer",
  primaryUser: "Primary User",
  note: "Note",
};

/**
 * Converts a given key to a human-readable label.
 *
 * This function maps internal field keys to user-friendly labels, which are typically used
 * in UI forms or display to make the field names more understandable for users.
 *
 * @param {string} key - The key representing the field to convert.
 * @returns {string} The human-readable label corresponding to the provided key.
 */
export const labeling = (key: string): string => {
  return FIELD_LABELS[key] || key;
};

/**
 * Converts an IPv4 address to its integer representation.
 *
 * This function takes an IPv4 address in dot-decimal notation and converts it into a 32-bit
 * integer. This is useful for efficient comparison or storage of IP addresses.
 *
 * Example:
 * "192.168.0.1" -> 3232235521
 *
 * @param {string} ip - The IPv4 address to convert.
 * @returns {number} The integer representation of the IPv4 address.
 */
export const ipToInt = (ip: string): number => {
  if (!ip) return 0;

  try {
    return (
      ip.split(".").reduce((acc, octet) => {
        // Convert each octet and accumulate the result by shifting previous parts by 8 bits
        return (acc << 8) + parseInt(octet, 10);
      }, 0) >>> 0
    ); // Unsigned right shift to ensure non-negative result
  } catch (e) {
    console.log("Error converting IP to integer:", e);
    return 0;
  }
};

/**
 * Formats an IP address for display.
 *
 * @param {string} ip - The IP address to format
 * @returns {string} The formatted IP address
 */
export const formatIP = (ip: string | undefined): string => {
  if (!ip) return "No IP";
  return ip;
};

/**
 * Creates pagination for a list of items.
 *
 * @param {Array<T>} items - The items to paginate
 * @param {number} currentPage - The current page number (1-based)
 * @param {number} itemsPerPage - The number of items per page
 * @returns {Array<T>} The paginated items
 */
export function paginate<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Validates input and trims any trailing spaces.
 * This function allows all characters including spaces.
 *
 * @param {string} value - The input value to validate
 * @returns {{ isValid: boolean, sanitizedValue: string, errorMessage: string }} Validation result
 */
export const validateInput = (
  value: string,
): {
  isValid: boolean;
  sanitizedValue: string;
  errorMessage: string;
} => {
  // Handle empty values
  if (value === undefined || value === null) {
    return {
      isValid: true,
      sanitizedValue: "",
      errorMessage: "",
    };
  }

  // Convert to string if it's not already
  const stringValue = String(value);

  // Only remove spaces at the end of the string, preserve all other spaces
  const sanitizedValue = stringValue.replace(/\s+$/, "");

  // Check if trailing spaces were removed
  const hadTrailingSpace = stringValue !== sanitizedValue;

  return {
    isValid: true,
    sanitizedValue: sanitizedValue,
    errorMessage: hadTrailingSpace ? "Trailing spaces removed" : "",
  };
};

/**
 * Validates a name field - removes trailing spaces and checks for special characters.
 * Spaces are allowed, but trailing spaces are removed before submission.
 * Special characters are not allowed in name fields.
 *
 * @param {string} name - The name to validate
 * @returns {{ isValid: boolean, sanitizedValue: string, errorMessage: string }} Validation result
 */
export const validateName = (
  name: string
): {
  isValid: boolean;
  sanitizedValue: string;
  errorMessage: string;
} => {
  if (name === undefined || name === null) {
    return {
      isValid: false,
      sanitizedValue: "",
      errorMessage: "Name is required",
    };
  }

  // Convert to string if it's not already
  const stringName = String(name);

  // Only remove spaces at the end of the string, preserve all other spaces
  const sanitizedName = stringName.replace(/\s+$/, "");

  // Block characters that would cause problems with API endpoints
  // Block: /, ?, &, =, #, :, %, +, ', ", \, ;, <, >
  const problematicCharsRegex = /[/?&=#:%+'"\\;<>]/;
  if (problematicCharsRegex.test(sanitizedName)) {
    return {
      isValid: false,
      sanitizedValue: sanitizedName,
      errorMessage:
        "Name contains characters that are not allowed (/ ? & = # : % + ' \" \\ ; < >)",
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitizedName,
    errorMessage: stringName !== sanitizedName ? "Trailing spaces removed" : "",
  };
};
