"use client";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/app/components/Layout";
import StockTabs from "@/app/components/StockTabs";
import StockList from "@/app/components/StockList";
import Loading from "@/app/loading";
import { stockApiService } from "@/app/services/stock-api";
import type { StockItem, Location } from "@/app/types/stock";

/**
 * StockPage component displays the stock management interface.
 * It shows tabs for different locations and lists stock items for the selected location.
 *
 * @component
 * @returns {JSX.Element} The Stock page JSX
 */
export default function StockPage() {
  const [activeLocation, setActiveLocation] = useState<Location>("Wiley");
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch stock items when active location changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await stockApiService.getAllItems(activeLocation);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stock items:", err);
        setError("Failed to load stock items");
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
      const data = await stockApiService.getAllItems(activeLocation);
      setItems(data);
    } catch (err) {
      console.error("Error refreshing stock items:", err);
      setError("Failed to refresh stock items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Stock Management"
      showHomeButton={true}
      showCreateButton={false}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Stock Management</h1>

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

        <StockTabs
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
              <StockList
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
