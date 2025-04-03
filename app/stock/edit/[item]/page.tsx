"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/components/Layout";
import StockForm from "@/app/components/StockForm";
import Loading from "@/app/loading";
import { stockApiService } from "@/app/services/stock-api";
import type { StockItem } from "@/app/types/stock";

/**
 * EditStockPage component allows users to edit an existing stock item.
 * It fetches the item details based on the item name in the URL parameter.
 *
 * @component
 * @returns {JSX.Element} The Edit Stock page JSX
 */
export default function EditStockPage() {
  const { item } = useParams<{ item: string }>();
  const [stockItem, setStockItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!item) return;

        // Decode the item name from the URL
        const decodedItem = decodeURIComponent(item);

        setLoading(true);
        const data = await stockApiService.getItemByName(decodedItem);
        setStockItem(data);
      } catch (err) {
        console.error("Error fetching stock item:", err);
        setError(stockApiService.handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [item]);

  if (loading) {
    return <Loading />;
  }

  if (error || !stockItem) {
    return (
      <Layout title="Edit Stock Item">
        <div className="max-w-2xl mx-auto p-4">
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error || "Item not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${stockItem.item}`}>
      <div className="max-w-2xl mx-auto p-4">
        <StockForm mode="edit" initialData={stockItem} />
      </div>
    </Layout>
  );
}
