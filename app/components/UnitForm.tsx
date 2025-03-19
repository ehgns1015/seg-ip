import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { IPv4Regex, useIPValidation } from "@/app/hooks/useIPValidation";
import {
  validateInput,
  validateName,
  labeling,
} from "@/app/functions/functions";
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
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
   * Validates all fields, then sends a POST/PUT request to save the unit data.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset errors
    setError("");
    setFieldErrors({});

    // Validate the name field first (most important)
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      setFieldErrors({ name: nameValidation.errorMessage });
      setError("Please correct the errors before submitting");
      return;
    }

    // If needed, update the sanitized name
    if (formData.name !== nameValidation.sanitizedValue) {
      setFormData((prevData) => ({
        ...prevData,
        name: nameValidation.sanitizedValue,
      }));
    }

    // Prepare the validated data
    const validatedData: FormData = {
      ...formData,
      name: nameValidation.sanitizedValue,
    };

    // Validate all other string fields and trim trailing spaces
    let hasErrors = false;
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string" && key !== "name") {
        const { isValid, sanitizedValue, errorMessage } = validateInput(
          value,
          // Allow special characters in some fields
          ["note", "email"].includes(key),
          labeling(key)
        );

        if (!isValid) {
          setFieldErrors((prev) => ({ ...prev, [key]: errorMessage }));
          hasErrors = true;
        }

        validatedData[key] = sanitizedValue;
      }
    });

    if (hasErrors) {
      setError("Please correct the errors before submitting");
      return;
    }

    try {
      if (mode === "create") {
        await apiService.createUnit({ ...validatedData, type });
      } else if (mode === "edit" && initialData?.name) {
        // Create a properly typed dataToSubmit object
        const dataToSubmit: FormData = {
          ...validatedData,
          // Ensure primaryUser is null (not empty string) when sharedComputer is false
          primaryUser: validatedData.sharedComputer
            ? validatedData.primaryUser
            : null,
        };
        await apiService.updateUnit(initialData.name, dataToSubmit);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/units");
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
      router.push("/units");
    } catch (error) {
      setError(apiService.handleError(error));
      clearErrorAfterDelay();
    }
  };

  /**
   * Handles input field changes.
   * Updates form data and performs validation when fields are modified.
   */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;

      // Clear error for this field when user starts typing again
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      if (name === "sharedComputer") {
        const isChecked = (e.target as HTMLInputElement).checked;

        setFormData((prevData) => ({
          ...prevData,
          sharedComputer: isChecked,
          // if sharedComputer is false, clear primaryUser
          primaryUser: isChecked ? prevData.primaryUser : "",
        }));
      } else if (name === "name" && typeof value === "string") {
        // Special validation for name field
        const { sanitizedValue } = validateName(value);

        setFormData((prevData) => ({
          ...prevData,
          [name]: sanitizedValue,
        }));
      } else {
        // For other fields, just update with the current value
        // (We'll validate fully on submit or blur)
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
    [checkDuplicateIP, setIPValidationMessage, fieldErrors]
  );

  /**
   * Handles field blur to validate on the spot
   */
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;

      if (typeof value === "string") {
        if (name === "name") {
          const { isValid, sanitizedValue, errorMessage } = validateName(value);

          if (!isValid) {
            setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
          }

          // Update with sanitized value
          setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
        } else {
          const { isValid, sanitizedValue, errorMessage } = validateInput(
            value,
            ["note", "email"].includes(name),
            labeling(name)
          );

          if (!isValid) {
            setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
          }

          // Update with sanitized value
          setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
        }
      }
    },
    []
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
              onBlur={handleBlur}
              type="select"
              options={employees.map((emp) => ({
                value: emp.name,
                label: `${emp.name} (${emp.ip})`,
              }))}
              error={fieldErrors[field.name]}
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
              onBlur={handleBlur}
              type="textarea"
              error={fieldErrors[field.name]}
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
            onBlur={handleBlur}
            type={field.type}
            validationMessage={
              field.name === "ip" ? IPValidationMessage : undefined
            }
            error={fieldErrors[field.name]}
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
    handleBlur,
    IPValidationMessage,
    employees,
    fieldErrors,
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
