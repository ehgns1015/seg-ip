import React, { useState } from "react";
import type { Location } from "@/app/types/inventory";

interface InventoryTabsProps {
  activeLocation: Location;
  onLocationChange: (location: Location) => void;
}

/**
 * InventoryTabs component for switching between different inventory locations.
 *
 * @component
 * @param {InventoryTabsProps} props - The component props
 * @returns {JSX.Element} The inventory tabs component
 */
const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeLocation,
  onLocationChange,
}) => {
  // Array of available locations
  const locations: Location[] = ["Wiley", "Redding", "Jane"];

  return (
    <div className="mb-6">
      <div className="flex border-b">
        {locations.map((location) => (
          <button
            key={location}
            className={`px-4 py-2 text-sm font-medium ${
              activeLocation === location
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => onLocationChange(location)}
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryTabs;
