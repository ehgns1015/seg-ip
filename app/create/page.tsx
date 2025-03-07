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
    sharedComputer: false,
    primaryUser: "",
  });
  const [error, setError] = useState(""); // Stores error message if any
  const { IPValidationMessage, checkDuplicateIP, setIPValidationMessage } =
    useIPValidation(); // Custom IP validation hook
  const [employeeFields, setEmployeeFields] = useState<FormData[]>([]);
  const [machineFields, setMachineFields] = useState<FormData[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [employees, setEmployees] = useState<
    Array<{ name: string; ip: string }>
  >([]);

  useEffect(() => {
    // Set the document title for the Create New Unit page
    document.title = "SEG IP Management";
    const employeeFieldsData = process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS)
      : [];
    const machineFieldsData = process.env.NEXT_PUBLIC_MACHINE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_MACHINE_FIELDS)
      : [];
    setEmployeeFields(employeeFieldsData);
    setMachineFields(machineFieldsData);

    // Fetch employees for primary user selection
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/api/units");
        const employeesList = response.data.filter(
          (unit: { type?: string; name: string; ip: string }) =>
            unit.type === "employee" || !unit.type
        );
        setEmployees(employeesList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handles form submission.
   * Sends a POST request to save the unit data and redirects to the units page on success.
   * If an error occurs, it updates the error state with the error message.
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // POST request to save unit data
      await axios.post("/api/units", { ...formData, type });
      router.push("/units"); // Redirect to the units page after successful submission
    } catch (error: any) {
      // Set error message if POST request fails
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Error saving data");
      } else {
        setError("Error saving data");
      }

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
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The input change event
   * @returns {void}
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "sharedComputer") {
      const isChecked = (e.target as HTMLInputElement).checked;

      setFormData({
        ...formData,
        sharedComputer: isChecked,
        // if sharedComputer is false, delete primaryUser
        primaryUser: isChecked ? formData.primaryUser : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      });
    }

    if (name === "ip" && IPv4Regex.test(value)) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        checkDuplicateIP(value);
        setTimeout(() => {
          setIPValidationMessage("");
        }, 3000);
      }, 700);

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
        {(type === "employee" ? employeeFields : machineFields).map((field) => {
          // Skip rendering the IP field if shared computer is selected
          if (field.name === "ip" && formData.sharedComputer) {
            return null;
          }

          // Skip rendering primaryUser field when sharedComputer is unchecked
          if (
            field.name === "primaryUser" &&
            (!formData.sharedComputer || type !== "employee")
          ) {
            return null;
          }

          if (field.name === "sharedComputer" && type === "employee") {
            return (
              <div key={field.name} className="flex items-center">
                <input
                  id="sharedComputer"
                  name="sharedComputer"
                  type="checkbox"
                  checked={formData.sharedComputer}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5"
                />
                <label htmlFor="sharedComputer" className="font-medium">
                  {labeling("sharedComputer")}
                </label>
              </div>
            );
          }

          if (
            field.name === "primaryUser" &&
            type === "employee" &&
            formData.sharedComputer
          ) {
            return (
              <div key={field.name}>
                <label className="block mb-2 font-medium">
                  {labeling("primaryUser")}
                </label>
                <select
                  name="primaryUser"
                  value={formData.primaryUser}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Select Primary User --</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.name} ({emp.ip})
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.name === "note") {
            return (
              <div key={field.name}>
                <label className="block mb-2 font-medium">
                  {labeling(field.name)}
                </label>
                <textarea
                  name={field.name}
                  value={
                    formData[field.name] !== undefined
                      ? String(formData[field.name])
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full p-2 border rounded resize-vertical"
                  rows={4}
                />
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label className="block mb-2 font-medium">
                {labeling(field.name)}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={
                  formData[field.name] !== undefined
                    ? String(formData[field.name])
                    : ""
                }
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  field.type === "checkbox" ? "w-auto" : ""
                }`}
                required={"name".includes(field.name)} // 'name' field is required
              />
              {/* Show IP validation message if available */}
              {field.name === "ip" && IPValidationMessage && (
                <p className="text-sm mt-2 text-gray-600">
                  {IPValidationMessage}
                </p>
              )}
            </div>
          );
        })}

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
