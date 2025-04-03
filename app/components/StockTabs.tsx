import type { Location } from "@/app/types/stock";

interface StockTabsProps {
  activeLocation: Location;
  onLocationChange: (location: Location) => void;
}

/**
 * StockTabs component for switching between different stock locations.
 *
 * @component
 * @param {StockTabsProps} props - The component props
 * @returns {JSX.Element} The stock tabs component
 */
const StockTabs: React.FC<StockTabsProps> = ({
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

export default StockTabs;
