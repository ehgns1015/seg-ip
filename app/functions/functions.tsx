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
  let label: string = "";
  if (key === "pw") {
    console.log("pw in");
  }
  // Switch-case structure to return the appropriate label for the given key
  switch (key) {
    case "name":
      label = "Name";
      break;
    case "ip":
      label = "IP Address";
      break;
    case "department":
      label = "Department";
      break;
    case "pc":
      label = "PC Model";
      break;
    case "MAC":
      label = "MAC Address";
      break;
    case "officeKey":
      label = "MS Office";
      break;
    case "email":
      label = "E-mail";
      break;
    case "ePw":
      label = "E-mail Password";
      break;
    case "badge":
      label = "Badge#";
      break;
    case "ea":
      label = "EA Account";
      break;
    case "eaPw":
      label = "EA Password";
      break;
    case "device":
      label = "Device";
      break;
    case "printer1":
      label = "Printer#1";
      break;
    case "printer2":
      label = "Printer#2";
      break;
    case "scanner":
      label = "Scanner";
      break;
    case "PLC":
      label = "PLC";
      break;
    case "username":
      label = "Windows Username";
      break;
    case "pw":
      label = "Windows Password";
      break;
    case "note":
      label = "Note";
      break;
    default:
      break;
  }

  return label;
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
export const ipToInt = (ip: string): number =>
  ip.split(".").reduce((acc, octet) => {
    // Convert each octet and accumulate the result by shifting previous parts by 8 bits
    return (acc << 8) + parseInt(octet, 10);
  }, 0) >>> 0; // Unsigned right shift to ensure non-negative result
