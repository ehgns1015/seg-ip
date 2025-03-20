import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { IPv4Regex, useIPValidation } from "@/app/hooks/useIPValidation";
import type { FormData } from "@/app/types";
import { apiService } from "@/app/services/api";
import FormField from "./FormField";

interface UnitFormProps {
  initialData?: FormData;
  mode: "create" | "edit";
  employeeFields: FormData[];
  machineFields: FormData[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * UnitForm component for creating or editing units.
 * It dynamically renders form fields based on the unit type and handles form submission.
 *
 * @component
 * @param {UnitFormProps} props - The component props
 * @returns {JSX.Element} The unit form component
 */
const UnitForm: React.FC<UnitFormProps> = ({
  initialData,
  mode,
  employeeFields,
  machineFields,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [type, setType] = useState<"employee" | "machine">(
    initialData?.type === "machine" ? "machine" : "employee"
  );
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      ip: "",
      email: "",
      MAC: "",
      type: "",
      sharedComputer: false,
      primaryUser: "",
    }
  );
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<
    Array<{ name: string; ip: string }>
  >([]);
  const { IPValidationMessage, checkDuplicateIP, setIPValidationMessage } =
    useIPValidation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clears the error message after a delay.
   */
  const clearErrorAfterDelay = useCallback((delay: number = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setError("");
      timeoutRef.current = null;
    }, delay);
  }, []);

  // Fetch employees for primary user selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const allUnits = await apiService.getAllUnits();
        const employeesList = allUnits.filter(
          (unit: { type?: string; name: string; ip: string }) =>
            (unit.type === "employee" || !unit.type) &&
            (mode !== "edit" || unit.name !== initialData?.name)
        );
        setEmployees(employeesList);
      } catch (error) {
        console.log("Error fetching employees:", error);
        setError(apiService.handleError(error));
        clearErrorAfterDelay();
      }
    };

    fetchEmployees();
  }, [initialData?.name, mode, clearErrorAfterDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Handles form submission.
   * Sends a POST/PUT request to save the unit data and redirects to the units page on success.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Create a copy of form data and trim string values
      const trimmedData = { ...formData };

      // Trim all string fields to remove trailing spaces
      Object.keys(trimmedData).forEach((key) => {
        if (typeof trimmedData[key] === "string") {
          trimmedData[key] = trimmedData[key].trim();
        }
      });

      if (mode === "create") {
        await apiService.createUnit({ ...trimmedData, type });
      } else if (mode === "edit" && initialData?.name) {
        // Create a properly typed dataToSubmit object
        const dataToSubmit: FormData = {
          ...trimmedData,
          // Ensure primaryUser is null (not empty string) when sharedComputer is false
          primaryUser: trimmedData.sharedComputer
            ? trimmedData.primaryUser
            : null,
        };
        await apiService.updateUnit(initialData.name, dataToSubmit);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/ip-list/units");
      }
    } catch (error) {
      setError(apiService.handleError(error));
      clearErrorAfterDelay();
    }
  };
  /**
   * Handles delete operation for an existing unit.
   */
  const handleDelete = async () => {
    if (mode !== "edit" || !initialData?.name) return;

    try {
      await apiService.deleteUnit(initialData.name);
      router.push("/ip-list/units");
    } catch (error) {
      setError(apiService.handleError(error));
      clearErrorAfterDelay();
    }
  };

  /**
   * Handles input field changes.
   * Updates form data and performs IP validation when the IP address is modified.
   */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;

      if (name === "sharedComputer") {
        const isChecked = (e.target as HTMLInputElement).checked;

        setFormData((prevData) => ({
          ...prevData,
          sharedComputer: isChecked,
          // if sharedComputer is false, clear primaryUser
          primaryUser: isChecked ? prevData.primaryUser : "",
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]:
            type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
        }));
      }

      if (name === "ip" && IPv4Regex.test(value)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          checkDuplicateIP(value);
          timeoutRef.current = setTimeout(() => {
            setIPValidationMessage("");
            timeoutRef.current = null;
          }, 3000);
        }, 700);
      }
    },
    [checkDuplicateIP, setIPValidationMessage]
  );

  /**
   * Renders form fields based on the unit type.
   */
  const renderFields = useCallback(() => {
    const fields = type === "employee" ? employeeFields : machineFields;

    return fields
      .map((field) => {
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

        // Shared computer checkbox
        if (field.name === "sharedComputer" && type === "employee") {
          return (
            <FormField
              key={field.name}
              name={field.name}
              value={formData.sharedComputer || false}
              onChange={handleChange}
              type="checkbox"
            />
          );
        }

        // Primary user select
        if (
          field.name === "primaryUser" &&
          type === "employee" &&
          formData.sharedComputer
        ) {
          return (
            <FormField
              key={field.name}
              name={field.name}
              value={formData.primaryUser || ""}
              onChange={handleChange}
              type="select"
              options={employees.map((emp) => ({
                value: emp.name,
                label: `${emp.name} (${emp.ip})`,
              }))}
              required
            />
          );
        }

        // Note field as textarea
        if (field.name === "note") {
          return (
            <FormField
              key={field.name}
              name={field.name}
              value={
                formData[field.name] !== undefined
                  ? String(formData[field.name])
                  : ""
              }
              onChange={handleChange}
              type="textarea"
            />
          );
        }

        // Regular fields
        return (
          <FormField
            key={field.name}
            name={field.name}
            value={
              formData[field.name] !== undefined
                ? String(formData[field.name])
                : ""
            }
            onChange={handleChange}
            type={field.type}
            validationMessage={
              field.name === "ip" ? IPValidationMessage : undefined
            }
            required={"name".includes(field.name)}
          />
        );
      })
      .filter(Boolean);
  }, [
    employeeFields,
    machineFields,
    type,
    formData,
    handleChange,
    IPValidationMessage,
    employees,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Unit type toggle for create mode */}
      {mode === "create" && (
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Create New Unit</h1>
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                type === "employee" ? "text-blue-500" : "text-gray-400"
              }`}
            >
              Employee
            </span>
            <div
              onClick={() =>
                setType((prev) =>
                  prev === "employee" ? "machine" : "employee"
                )
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
      )}

      {/* Render form fields */}
      {renderFields()}

      {/* Display error message if any */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Form buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {mode === "create" ? "Create" : "Update"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}

        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UnitForm;
