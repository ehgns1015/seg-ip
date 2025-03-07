import { useState, useCallback, useRef, useEffect } from "react";
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
 * @returns {Object} Returns the validation message and functions to check IP availability.
 */
export const useIPValidation = () => {
  // State to hold the validation message for the IP address
  const [IPValidationMessage, setIPValidationMessage] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Clears the validation message after a specified delay
   * @param {number} delay - Time in milliseconds to wait before clearing the message
   */
  const clearValidationMessage = useCallback((delay: number = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIPValidationMessage("");
      timeoutRef.current = null;
    }, delay);
  }, []);

  /**
   * Checks if the provided IP address already exists in the database.
   * Sends a POST request to the backend API to verify the availability of the IP.
   *
   * If the IP is available, a success message is set, otherwise an error message.
   *
   * @async
   * @param {string} ip - The IP address to check for duplication.
   */
  const checkDuplicateIP = useCallback(
    async (ip: string) => {
      if (!IPv4Regex.test(ip)) return;

      try {
        // Sending the IP to the backend to check for duplication
        const response = await axios.post("/api/units/check-ip", { ip });
        if (response.status === 201) {
          // IP is available, so set the success message
          setIPValidationMessage(response.data.message);
          clearValidationMessage();
        }
      } catch (error) {
        // Handling error case by setting the error message from the response
        if (axios.isAxiosError(error) && error.response) {
          // Server responded
          setIPValidationMessage(error.response.data.message);
        } else {
          // Server Not responded
          setIPValidationMessage("Error checking IP");
        }
        clearValidationMessage();
      }
    },
    [clearValidationMessage]
  );

  /**
   * Checks if the provided IP address is available in the database.
   * Sends a POST request to the backend API to verify the availability of the IP.
   *
   * @async
   * @param {string} ip - The IP address to check for availability.
   * @returns {Promise<{ available: boolean; message: string }>} Object indicating availability and a message.
   */
  const checkAvailableIP = useCallback(
    async (ip: string): Promise<{ available: boolean; message: string }> => {
      try {
        const response = await axios.post("/api/units/check-ip", { ip });
        if (response.status === 201) {
          return { available: true, message: "Available." };
        }
        return { available: false, message: "IP Address Already Exists." };
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status === 400
        ) {
          return { available: false, message: "IP Address Already Exists." };
        }
        return { available: false, message: "Error checking IP" };
      }
    },
    []
  );

  return {
    IPValidationMessage, // The current IP validation message
    checkDuplicateIP, // Function to check IP duplication
    checkAvailableIP, // Function to check IP Availability
    setIPValidationMessage, // Function to set IP Availability message
    clearValidationMessage, // Function to clear the validation message
  };
};
