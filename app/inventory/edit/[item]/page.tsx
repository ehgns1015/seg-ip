"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/components/Layout";
import InventoryForm from "@/app/components/InventoryForm";
import Loading from "@/app/loading";
import { inventoryApiService } from "@/app/services/inventory-api";
import type { InventoryItem } from "@/app/types/inventory";

/**
 * EditInventoryPage component allows users to edit an existing inventory item.
 * It fetches the item details based on the item name in the URL parameter.
 *
 * @component
 * @returns {JSX.Element} The Edit Inventory page JSX
 */
export default function EditInventoryPage() {
  const { item } = useParams<{ item: string }>();
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!item) return;

        // Decode the item name from the URL
        const decodedItem = decodeURIComponent(item);

        setLoading(true);
        const data = await inventoryApiService.getItemByName(decodedItem);
        setInventoryItem(data);
      } catch (err) {
        console.error("Error fetching inventory item:", err);
        setError(inventoryApiService.handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [item]);

  if (loading) {
    return <Loading />;
  }

  if (error || !inventoryItem) {
    return (
      <Layout title="Edit Inventory Item">
        <div className="max-w-2xl mx-auto p-4">
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error || "Item not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${inventoryItem.item}`}>
      <div className="max-w-2xl mx-auto p-4">
        <InventoryForm mode="edit" initialData={inventoryItem} />
      </div>
    </Layout>
  );
}
