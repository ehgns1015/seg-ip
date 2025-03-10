/**
 * Utility functions for consistent field ordering
 */

/**
 * Interface for field configurations from environment variables
 */
interface FieldConfig {
  name: string;
  type: string;
}

/**
 * Interface for unit object values
 * This represents possible values that can be stored in a unit field
 */
type UnitValue = string | number | boolean | null | undefined;

/**
 * Gets the field order based on environment variables
 * @returns {Object} Contains field order arrays for employee and machine types
 */
export const getFieldOrder = () => {
  let employeeFields: string[] = [];
  let machineFields: string[] = [];

  try {
    const employeeFieldsConfig: FieldConfig[] = process.env
      .NEXT_PUBLIC_EMPLOYEE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS)
      : [];

    const machineFieldsConfig: FieldConfig[] = process.env
      .NEXT_PUBLIC_MACHINE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_MACHINE_FIELDS)
      : [];

    // Extract field names from configurations
    employeeFields = employeeFieldsConfig.map(
      (field: FieldConfig) => field.name
    );
    machineFields = machineFieldsConfig.map((field: FieldConfig) => field.name);
  } catch (error) {
    console.error("Error parsing field order:", error);
  }

  return {
    employeeFields,
    machineFields,
  };
};

/**
 * Sorts object keys based on predefined field order
 * @param {Record<string, UnitValue>} object - The object whose keys need to be sorted
 * @param {string[]} fieldOrder - The desired order of fields
 * @returns {string[]} Sorted keys
 */
export const sortObjectKeysByFieldOrder = (
  object: Record<string, UnitValue>,
  fieldOrder: string[]
): string[] => {
  if (!fieldOrder || !Array.isArray(fieldOrder)) return Object.keys(object);

  // Get all keys from the object
  const objectKeys = Object.keys(object);

  // Filter out keys that are in the field order
  const orderedKeys = fieldOrder.filter((key) => objectKeys.includes(key));

  // Get keys that are not in the field order
  const remainingKeys = objectKeys.filter((key) => !fieldOrder.includes(key));

  // Return ordered keys followed by any keys not in the order
  return [...orderedKeys, ...remainingKeys];
};
