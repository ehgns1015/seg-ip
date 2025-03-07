import React from "react";
import { useRouter } from "next/navigation";
import { labeling } from "@/app/functions/functions";

import type { Unit } from "@/app/types";

interface UnitDetailModalProps {
  unit: Unit;
  onClose: () => void;
}

/**
 * Modal component for displaying unit details.
 * Shows all relevant information about a unit and provides edit functionality.
 *
 * @component
 * @param {UnitDetailModalProps} props - The component props
 * @returns {JSX.Element} The unit detail modal component
 */
const UnitDetailModal: React.FC<UnitDetailModalProps> = ({ unit, onClose }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/units/edit/${unit.name}`);
  };

  const excludedFields = ["name", "_id", "type", "note", "__v"];

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <h3 className="text-2xl font-bold mb-4">{unit.name}</h3>

        {/* Display regular unit details */}
        <div className="space-y-2 mb-4">
          {Object.keys(unit).map((key) => {
            // Skip excluded fields
            if (excludedFields.includes(key)) {
              return null;
            }

            // Skip empty values
            if (
              unit[key] === "" ||
              unit[key] === null ||
              unit[key] === undefined
            ) {
              return null;
            }

            // Format boolean values
            const displayValue =
              typeof unit[key] === "boolean"
                ? unit[key]
                  ? "Yes"
                  : "No"
                : unit[key];

            return (
              <p key={key} className="flex">
                <strong className="w-1/3 font-medium">{labeling(key)}:</strong>
                <span className="w-2/3">{displayValue}</span>
              </p>
            );
          })}
        </div>

        {/* Special handling for Note field - always display in TextBox */}
        <div className="mt-4">
          <label className="block mb-2 font-medium">{labeling("note")}</label>
          <textarea
            className="w-full p-2 border rounded resize-vertical"
            rows={4}
            value={unit.note || ""}
            readOnly
          />
        </div>

        {/* Modal buttons */}
        <div className="mt-6 space-x-4 flex justify-end">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailModal;
