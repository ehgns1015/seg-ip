"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "@/app/components/Layout";
import UnitDetailModal from "@/app/components/UnitDetailModal";
import { apiService } from "@/app/services/api";
import { ipToInt } from "@/app/functions/functions";
import Loading from "@/app/loading";

// Unit Interface Definition
interface Unit {
  _id: string;
  ip: string;
  name: string;
  type: "employee" | "machine";
  department?: string;
  note?: string;
  [key: string]: any;
}

/**
 * UnitList component fetches, filters, and displays a list of units (employees or machines).
 * It allows users to view unit details, search by name or IP, and edit existing units.
 *
 * @component
 * @returns {JSX.Element} The Unit List page JSX
 */
export default function UnitList() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch unit data from the API when the component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getAllUnits();
        setUnits(data);
      } catch (error) {
        setError("Failed to load units");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Handler for unit block click event. Sets the selected unit to view its details.
   */
  const handleBlockClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
  }, []);

  /**
   * Closes the modal by setting the selected unit to null.
   */
  const handleCloseModal = useCallback(() => {
    setSelectedUnit(null);
  }, []);

  /**
   * Updates the search state when the user types in the search input field.
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  /**
   * Filters and sorts the unit list based on the search query.
   */
  const filteredUnits = useMemo(() => {
    return units
      .filter(
        (unit) =>
          unit.name.toLowerCase().includes(search.toLowerCase()) ||
          (unit.ip && unit.ip.includes(search))
      )
      .sort((a, b) => {
        // Handle empty IPs by putting them at the end
        if (!a.ip) return 1;
        if (!b.ip) return -1;

        // Convert IPs to integers for numerical comparison
        return ipToInt(a.ip) - ipToInt(b.ip);
      });
  }, [units, search]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout title="Units" showCreateButton>
      <div className="container mx-auto px-4">
        {/* Header and search input */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Unit List</h1>
          <input
            type="text"
            placeholder="Search by name or IP"
            className="p-2 border rounded w-full sm:w-64"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {filteredUnits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? "No units match your search" : "No units found"}
          </div>
        ) : (
          /* Unit list displayed in a grid layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <div
                key={unit._id}
                className="bg-white p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleBlockClick(unit)}
              >
                <h3 className="text-lg font-semibold">{unit.name}</h3>
                <p className="text-sm text-gray-500">{unit.ip || "No IP"}</p>
                {unit.department && (
                  <p className="text-sm text-gray-600">{unit.department}</p>
                )}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                    {unit.type || "employee"}
                  </span>
                  {unit.sharedComputer && (
                    <span className="inline-block ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      Shared
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit detail modal */}
      {selectedUnit && (
        <UnitDetailModal unit={selectedUnit} onClose={handleCloseModal} />
      )}
    </Layout>
  );
}
