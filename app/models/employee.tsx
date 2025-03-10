/**
 * Represents an Employee entity.
 * This Map defines the schema for an employee with various properties.
 * Each key represents a field, and the value defines the type and constraints for that field.
 *
 * @constant
 * @type {Map<string, Object>}
 */
const Employee = new Map([
  /**
   * The name of the employee.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} required - Whether this field is required.
   * @property {boolean} unique - Whether the name must be unique.
   */
  ["name", { type: "String", required: true, unique: true }],

  /**
   * The IP address of the employee's machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} unique - Whether the IP address must be unique.
   * @property {boolean} sparse - Allows null values in the field.
   */
  ["ip", { type: "String", unique: true, sparse: true }],

  /**
   * The department where the employee works.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */

  ["department", { type: "String" }],
  /**
   * The MAC address of the employee's machine.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {boolean} unique - Whether the MAC address must be unique.
   * @property {boolean} sparse - Allows null values in the field.
   */
  ["MAC", { type: "String", unique: true, sparse: true }],

  /**
   * The employee's assigned PC identifier.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["pc", { type: "String" }],

  /**
   * The office key assigned to the employee.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["officeKey", { type: "String" }],

  /**
   * The employee's email address.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["email", { type: "String" }],

  /**
   * The password for the employee's account.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["ePw", { type: "String" }],

  /**
   * The badge number assigned to the employee.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["badge", { type: "String" }],

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
   * Primary User for the shared Computer.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["primaryUser", { type: "String", sparse: true }],

  /**
   * Checkbox for the choice of the shared Computer.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["sharedComputer", { type: "Boolean", default: false }], // 공유 컴퓨터 플래그

  /**
   * Notes or additional information about the employee.
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   */
  ["note", { type: "String" }],

  /**
   * The type of entity the employee represents.
   * Defaults to "employee".
   * @type {Object}
   * @property {string} type - The data type of the field, "String".
   * @property {string} default - The default value for the field, "employee".
   */
  ["__type", { type: "String", default: "employee" }],
]);

export default Employee;
