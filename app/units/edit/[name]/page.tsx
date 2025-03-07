"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Employee from "@/app/models/employee"; // Correct import statement
import Machine from "@/app/models/machine";
import { labeling } from "@/app/functions/functions";
import { IPv4Regex, useIPValidation } from "@/app/hooks/useIPValidation";
import { FormData } from "@/app/models/formData";

// Dynamic input component for fields
const InputField = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <input
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full p-2 border rounded"
    />
  </div>
);

/**
 * EditPage component is used to render a form for editing an existing unit's data.
 * It fetches the unit data based on the 'name' parameter from the URL, displays
 * a form to edit that unit, and handles form submission, deletion, and cancellation.
 *
 * @component
 * @returns {JSX.Element} The EditPage JSX
 *
 * @example
 * <EditPage />
 */
export default function EditPage() {
  const router = useRouter();
  const { name } = useParams(); // Extract 'name' parameter from URL
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ip: "",
    email: "",
    MAC: "",
    type: "",
  }); // State to store the data of the unit being edited
  const [error, setError] = useState(""); // Error state for handling validation and API errors
  const { IPValidationMessage, checkDuplicateIP } = useIPValidation(); // Custom hook for IP validation

  /**
   * Fetches the unit data based on the 'name' parameter from the URL.
   * Sets the page title to the unit's IP and updates the formData state.
   *
   * @returns {Promise<void>} This function does not return any value.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/units/${name}`); // Fetch unit data by name
        document.title = response.data.ip; // Set page title to unit's IP address
        setFormData(response.data); // Update formData state with the retrieved data
      } catch (error) {
        console.error("Error fetching unit:", error); // Log any errors encountered during fetching
        setError("Failed to load data."); // Set error message if data fetch fails
      }
    };
    fetchData();
  }, [name]); // Dependency array ensures the effect runs when the 'name' changes

  /**
   * Handles form submission (editing unit data) and sends a PUT request to the server.
   * After updating the data, the user is redirected to the unit list page.
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {void}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/units/${name}`, formData); // Send updated data to the server
      router.push("/units"); // Redirect to unit list page after successful update
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError
        setError(error.response?.data?.error);
      } else {
        // Non-AxiosError
        setError("Server Error");
      }
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  /**
   * Handles changes in the form fields and updates the formData state accordingly.
   * If the IP address is changed, it validates the IP and checks for duplicates.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event triggered by the input field
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Update the corresponding field in formData
    });
    if (name === "ip" && IPv4Regex.test(value)) {
      checkDuplicateIP(value); // Check IP validity whenever the 'ip' field changes
    }
  };

  /**
   * Handles the deletion of the unit by sending a DELETE request to the server.
   * After the deletion, the user is redirected to the unit list page.
   *
   * @returns {void}
   */
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/units/${name}`); // Send DELETE request to remove the unit
      router.push("/units"); // Redirect to unit list page after deletion
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError
        setError(error.response?.data?.error);
      } else {
        // Non-AxiosError
        setError("Server Error");
      }
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  /**
   * Handles cancellation by navigating back to the previous page.
   *
   * @returns {void}
   */
  const handleCancel = () => {
    router.back(); // Navigate back to the previous page
  };

  /**
   * Dynamically renders the form fields based on the unit type (employee or machine).
   * The fields are rendered using the `InputField` component for each model key.
   *
   * @returns {JSX.Element[]} An array of input fields to render in the form
   */
  const renderFields = () => {
    const model = formData.type == "employee" ? Employee : Machine; // Determine model based on unit type
    const fields = Array.from(model.keys()); // Get keys of the model
    return fields.map((key) => {
      // Exclude '_id' and 'type' fields from the form
      if (["_id", "__type"].includes(key)) return null;
      return (
        <div key={key}>
          <InputField
            label={labeling(key)} // Capitalize the field label
            name={key}
            value={formData[key as keyof FormData] || ""}
            onChange={handleChange}
          />
          {key === "ip" && IPValidationMessage && (
            <p className="text-sm mt-2 text-gray-600">{IPValidationMessage}</p>
          )}
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Unit</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamically render the fields */}
        {renderFields()}
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Display error message if exists */}
        <div className="flex space-x-4">
          {/* Update button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
