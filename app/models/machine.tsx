/**
 * Represents a Machine entity.
 * This Map defines the schema for a machine with various properties.
 * Each key represents a field, and the value defines the type and constraints for that field.
 *
 * @constant
 * @type {Map<string, Object>}
 */
const Machine = new Map([
  /**
   * The name of the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} required - Whether this field is required.
   * @property {boolean} unique - Whether the name must be unique.
   */
  ["name", { type: "String", required: true, unique: true }],

  /**
   * The IP address of the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} unique - Whether the IP address must be unique.
   * @property {boolean} sparse - Allows null values in the field.
   */
  ["ip", { type: "String", unique: true, sparse: true }],
  /**
   * The line the machine belongs to.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["line", { type: "String" }],

  /**
   * The type of device the machine is.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["device", { type: "String" }],

  /**
   * The MAC address of the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} unique - Whether the MAC address must be unique.
   * @property {boolean} sparse - Allows null values in the field.
   */
  ["MAC", { type: "String", unique: true, sparse: true }],

  /**
   * The first connected printer to the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["printer1", { type: "String" }],

  /**
   * The second connected printer to the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["printer2", { type: "String" }],

  /**
   * The scanner connected to the machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["scanner", { type: "String" }],

  /**
   * Indicates if the machine has a PLC (Programmable Logic Controller).
   * @type {Object}
   * @property {boolean} type - The data type of the field, "Boolean".
   */
  ["PLC", { type: "Boolean" }],

  /**
   * The employee's Windows Username or identifier.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["username", { type: "String" }],

  /**
   * The password for the employee's Windows account.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["pw", { type: "String" }],

  /**
   * Notes or additional information about the employee.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["note", { type: "String" }],

  /**
   * The type of entity the machine represents.
   * Defaults to "employee".
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {string} default - The default value for the field, "employee".
   */
  ["__type", { type: "String", default: "machine" }],
]);

export default Machine;
