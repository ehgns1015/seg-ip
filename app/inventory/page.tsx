"use client";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/app/components/Layout";
import InventoryTabs from "@/app/components/InventoryTabs";
import InventoryList from "@/app/components/InventoryList";
import Loading from "@/app/loading";
import { inventoryApiService } from "@/app/services/inventory-api";
import type { InventoryItem, Location } from "@/app/types/inventory";

/**
 * InventoryPage component displays the inventory management interface.
 * It shows tabs for different locations and lists inventory items for the selected location.
 *
 * @component
 * @returns {JSX.Element} The Inventory page JSX
 */
export default function InventoryPage() {
  const [activeLocation, setActiveLocation] = useState<Location>("Wiley");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch inventory items when active location changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await inventoryApiService.getAllItems(activeLocation);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
        setError("Failed to load inventory items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeLocation]);

  // Handle location tab change
  const handleLocationChange = (location: Location) => {
    setActiveLocation(location);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    return items.filter((item) =>
      item.item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Handle item deletion (reload the list)
  const handleItemDeleted = async () => {
    try {
      setLoading(true);
      const data = await inventoryApiService.getAllItems(activeLocation);
      setItems(data);
    } catch (err) {
      console.error("Error refreshing inventory items:", err);
      setError("Failed to refresh inventory items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Inventory Management"
      showHomeButton={true}
      showCreateButton={false}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

        {/* Search box above tabs */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <InventoryTabs
          activeLocation={activeLocation}
          onLocationChange={handleLocationChange}
        />

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : (
          <>
            {filteredItems.length === 0 && searchQuery !== "" ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No items match your search</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <InventoryList
                items={filteredItems}
                onItemDeleted={handleItemDeleted}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
