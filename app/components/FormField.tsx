import React from "react";
import { labeling } from "@/app/functions/functions";

interface FormFieldProps {
  name: string;
  value: string | boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: string;
  options?: Array<{ value: string; label: string }>;
  validationMessage?: string;
  required?: boolean;
}

/**
 * Reusable form field component that renders the appropriate input element
 * based on the field type (text, checkbox, textarea, select).
 *
 * @component
 * @param {Object} props - The component props
 * @returns {JSX.Element} The appropriate form field component
 */
const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  onChange,
  type = "text",
  options,
  validationMessage,
  required = false,
}) => {
  const label = labeling(name);

  if (type === "textarea") {
    return (
      <div>
        <label htmlFor={name} className="block mb-2 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          className="w-full p-2 border rounded resize-vertical"
          rows={4}
          required={required}
        />
        {validationMessage && (
          <p className="text-sm mt-2 text-gray-600">{validationMessage}</p>
        )}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className="flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={value as boolean}
          onChange={onChange}
          className="mr-2 h-5 w-5"
          required={required}
        />
        <label htmlFor={name} className="font-medium">
          {label}
        </label>
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div>
        <label htmlFor={name} className="block mb-2 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          className="w-full p-2 border rounded"
          required={required}
        >
          <option value="">-- Select {label} --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {validationMessage && (
          <p className="text-sm mt-2 text-gray-600">{validationMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={name} className="block mb-2 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value as string}
        onChange={onChange}
        className="w-full p-2 border rounded"
        required={required}
      />
      {validationMessage && (
        <p className="text-sm mt-2 text-gray-600">{validationMessage}</p>
      )}
    </div>
  );
};

export default FormField;
