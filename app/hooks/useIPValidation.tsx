import { useState } from "react";
import axios from "axios";

/**
 * Regular expression for validating IPv4 addresses.
 * This regular expression ensures the provided string is in the correct IPv4 format,
 * consisting of four numbers (0-255) separated by dots.
 *
 * @constant {RegExp} IPv4Regex - The regular expression used for IPv4 validation.
 */
export const IPv4Regex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Custom hook for validating and checking duplicate IP addresses.
 *
 * This hook provides the functionality to validate an IPv4 address structure
 * using the regular expression `IPv4Regex`. Additionally, it allows you to
 * check if a specific IP address is already taken by sending a request to the backend.
 *
 * @returns {Object} Returns the validation message and a function to check duplicate IPs.
 */
export const useIPValidation = () => {
  // State to hold the validation message for the IP address
  const [IPValidationMessage, setIPValidationMessage] = useState<string>("");

  /**
   * Checks if the provided IP address already exists in the database.
   * Sends a POST request to the backend API to verify the availability of the IP.
   *
   * If the IP is available, a success message is set, otherwise an error message.
   *
   * @async
   * @param {string} ip - The IP address to check for duplication.
   */
  const checkDuplicateIP = async (ip: string) => {
    try {
      // Sending the IP to the backend to check for duplication
      const response = await axios.post("/api/units/check-ip", { ip });
      if (response.status === 201) {
        // IP is available, so set the success message
        setIPValidationMessage(response.data.message);
      }
    } catch (error) {
      // Handling error case by setting the error message from the response
      if (axios.isAxiosError(error) && error.response) {
        // Server responded
        setIPValidationMessage(error.response.data.message);
      } else {
        // Server Not responded
        setIPValidationMessage("Error checking IP");
        // Clear error message after 3 seconds
        setTimeout(() => {
          setIPValidationMessage("");
        }, 3000);
      }
    }
  };
  /**
   * Checks if the provided IP address available in the database.
   * Sends a POST request to the backend API to verify the availability of the IP.
   *
   * If the IP is available, a success message is set, otherwise an error message.
   *
   * @async
   * @param {string} ip - The IP address to check for duplication.
   */
  const checkAvailableIP = async (
    ip: string
  ): Promise<{ available: boolean; message: string }> => {
    try {
      const response = await axios.post("/api/units/check-ip", { ip });
      if (response.status === 400) {
        return { available: false, message: "IP Address Already Exists." };
      }
      return { available: true, message: "Available." };
    } catch (error) {
      console.log(error);
      return { available: false, message: "Error checking IP" };
    }
  };

  return {
    IPValidationMessage, // The current IP validation message
    checkDuplicateIP, // Function to check IP duplication
    checkAvailableIP, // Function to check IP Availability
    setIPValidationMessage, // Function to set IP Availability message
  };
};
