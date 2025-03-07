"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { labeling } from "@/app/functions/functions";

// Unit Interface Definition: Defines the structure of a unit with relevant attributes
interface Unit {
  ip: string;
  name: string;
  type: "employee" | "machine";
  [key: string]: string | boolean; // Any other additional fields can be added dynamically
}

/**
 * UnitList component fetches, filters, and displays a list of units (employees or machines).
 * It allows users to view unit details, search by name or IP, and edit existing units.
 *
 * @component
 * @returns {JSX.Element} The Unit List page JSX
 *
 * @example
 * <UnitList />
 */
export default function UnitList() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]); // State to store the list of units
  const [search, setSearch] = useState(""); // State to store the search query
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null); // State to store the selected unit for viewing details
  const [noteText, setNoteText] = useState<string>("");

  /**
   * Fetch unit data from the API when the component mounts.
   * It updates the `units` state with the retrieved data.
   *
   * @returns {Promise<void>} This function does not return any value.
   */
  useEffect(() => {
    document.title = "SEG IP Management";
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/units");
        setUnits(response.data); // Update the state with the fetched units
      } catch (error) {
        console.error("Error fetching units:", error); // Log any error encountered during data fetching
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handler for unit block click event. Sets the selected unit to view its details.
   *
   * @param {Unit} unit - The unit object that was clicked
   * @returns {void}
   */
  const handleBlockClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setNoteText(unit.note ? (unit.note as string) : "");
  };

  /**
   * Closes the modal by setting the selected unit to null.
   *
   * @returns {void}
   */
  const handleCloseModal = () => {
    setSelectedUnit(null);
  };

  /**
   * Navigates to the edit page for the selected unit.
   * The unit’s name is used in the URL to edit a specific unit.
   *
   * @returns {void}
   */
  const handleEdit = () => {
    if (selectedUnit) {
      router.push(`/units/edit/${selectedUnit.name}`); // Navigate to the edit page of the selected unit
    }
  };

  /**
   * Updates the search state when the user types in the search input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event triggered by the input field
   * @returns {void}
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value); // Update the search state with the new search query
  };

  /**
   * Filters and sorts the unit list based on the search query.
   * It matches the query against the unit’s name or IP address and sorts the units by their IP address.
   *
   * @returns {Unit[]} A sorted and filtered list of units based on the search query
   */
  const filteredUnits = units
    .filter(
      (unit) =>
        unit.name.toLowerCase().includes(search.toLowerCase()) || // Filter units by name
        unit.ip.includes(search) // Filter units by IP address
    )
    .sort((a, b) => {
      // Sort the units by IP address
      const ipA = a.ip.split(".").map(Number);
      const ipB = b.ip.split(".").map(Number);
      for (let i = 0; i < 4; i++) {
        if (ipA[i] < ipB[i]) return -1;
        if (ipA[i] > ipB[i]) return 1;
      }
      return 0;
    });

  return (
    <div className="container mx-auto p-4">
      {/* Header and search input */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Unit List</h1>
        <input
          type="text"
          placeholder="Search by name or IP"
          className="p-2 border rounded"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Unit list displayed in a grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <div
            key={unit.ip}
            className="bg-white p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => handleBlockClick(unit)} // When a unit block is clicked, select the unit
          >
            <h3 className="text-lg font-semibold">{unit.name}</h3>
            <p className="text-sm text-gray-500">{unit.ip}</p>
            <p className="text-sm text-gray-600">{unit.department}</p>
          </div>
        ))}
      </div>

      {/* Modal to display the selected unit's details */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <h3 className="text-2xl font-bold mb-4">{selectedUnit.name}</h3>

            {/* Display regular unit details */}
            {Object.keys(selectedUnit).map((key) => {
              // Skip these fields from display
              if (["name", "_id", "type", "note"].includes(key)) {
                return null;
              }

              return (
                <p key={key}>
                  <strong>{labeling(key)}</strong>: {selectedUnit[key]}
                </p>
              );
            })}

            {/* Special handling for Note field - always display in TextBox */}
            <div className="mt-4">
              <label className="block mb-2 font-medium">
                {labeling("note")}
              </label>
              <textarea
                className="w-full p-2 border rounded resize-vertical"
                rows={4}
                value={noteText}
                readOnly
              />
            </div>

            {/* Modal buttons */}
            <div className="mt-4 space-x-4 flex justify-end">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed 'Home' button at the bottom right */}
      <Link
        href="/"
        className="fixed bottom-4 right-4 w-24 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
      >
        Home
      </Link>

      {/* Fixed 'Create New' button at the bottom right */}
      <Link
        href="/create"
        className="fixed bottom-4 right-32 w-32 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
      >
        Create New
      </Link>
    </div>
  );
}
