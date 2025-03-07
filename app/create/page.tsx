/**
 * CreatePage component allows the user to create a new unit (either an employee or a machine).
 * The form dynamically adjusts based on the selected type, and the data is submitted via a POST request to save the unit.
 *
 * @component
 * @returns {JSX.Element} The Create New Unit page JSX
 *
 * @example
 * <CreatePage />
 */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { labeling } from "@/app/functions/functions";
import { IPv4Regex, useIPValidation } from "@/app/hooks/useIPValidation";
import { FormData } from "../models/formData";

/**
 * The CreatePage component allows users to submit a new employee or machine entry.
 * - Dynamically switches between "employee" and "machine" type forms.
 * - On form submission, the data is saved via a POST request to "/api/units".
 *
 * @returns {JSX.Element} JSX for creating a new unit (employee or machine)
 */
export default function CreatePage() {
  const router = useRouter();
  const [type, setType] = useState<"employee" | "machine">("employee");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ip: "",
    email: "",
    MAC: "",
    type: "",
  });
  const [error, setError] = useState(""); // Stores error message if any
  const { IPValidationMessage, checkDuplicateIP, setIPValidationMessage } =
    useIPValidation(); // Custom IP validation hook
  const [employeeFields, setEmployeeFields] = useState<FormData[]>([]);
  const [machineFields, setMachineFields] = useState<FormData[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Set the document title for the Create New Unit page
    document.title = "SEG IP Management";
    const employeeFieldsData = process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS)
      : [];
    console.log(employeeFieldsData);
    const machineFieldsData = process.env.NEXT_PUBLIC_MACHINE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_MACHINE_FIELDS)
      : [];

    setEmployeeFields(employeeFieldsData);
    setMachineFields(machineFieldsData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handles form submission.
   * Sends a POST request to save the unit data and redirects to the units page on success.
   * If an error occurs, it updates the error state with the error message.
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // POST request to save unit data
      await axios.post("/api/units", { ...formData, type });
      router.push("/units"); // Redirect to the units page after successful submission
    } catch (error) {
      console.log(error);
      // Set error message if POST request fails
      setError("Error saving data");
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  /**
   * Handles input field changes.
   * Updates form data and performs IP validation when the IP address is modified.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? e.target.checked : value,
    });

    if (name === "ip" && IPv4Regex.test(value)) {
      if (timeoutId) {
        clearTimeout(timeoutId); // Clear any existing timeout
      }

      const newTimeoutId = setTimeout(() => {
        checkDuplicateIP(value); // Check IP validity whenever it changes
        setTimeout(() => {
          setIPValidationMessage(""); // Clear validation message after 2 seconds
        }, 3000);
      }, 700); // Set delay before checking IP

      setTimeoutId(newTimeoutId);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Create New Unit</h1>
        <div className="flex items-center gap-2">
          {/* Toggle between Employee and Machine types */}
          <span
            className={`font-medium ${
              type === "employee" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            Employee
          </span>
          <div
            onClick={() =>
              setType((prev) => (prev === "employee" ? "machine" : "employee"))
            }
            className="relative w-12 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                type === "employee" ? "left-1" : "right-1"
              }`}
            ></div>
          </div>
          <span
            className={`font-medium ${
              type === "machine" ? "text-green-500" : "text-gray-400"
            }`}
          >
            Machine
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Render the fields based on the selected type (employee or machine) */}
        {(type === "employee" ? employeeFields : machineFields).map((field) => (
          <div key={field.name}>
            <label className="block mb-2 font-medium">
              {labeling(field.name)}
            </label>
            <input
              name={field.name}
              type={field.type}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                field.type === "checkbox" ? "w-auto" : ""
              }`}
              required={"name".includes(field.name)} // 'name' and 'ip' fields are required
            />
            {/* Show IP validation message if available */}
            {field.name === "ip" && IPValidationMessage && (
              <p className="text-sm mt-2 text-gray-600">
                {IPValidationMessage}
              </p>
            )}
          </div>
        ))}
        {/* Display error message if any */}
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create
        </button>
        {/* Link to navigate back to the homepage */}
        <Link
          href="/"
          className="fixed bottom-4 right-4 w-24 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
        >
          Home
        </Link>
      </form>
    </div>
  );
}
