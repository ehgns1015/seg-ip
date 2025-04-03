import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { StockItem } from "@/app/types/stock";
import { stockApiService } from "@/app/services/stock-api";

interface StockListProps {
  items: StockItem[];
  onItemDeleted: () => void;
}

/**
 * StockList component for displaying stock items in a table.
 * Provides edit and delete functionality for each item.
 *
 * @component
 * @param {StockListProps} props - The component props
 * @returns {JSX.Element} The stock list component
 */
const StockList: React.FC<StockListProps> = ({ items, onItemDeleted }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Handle edit button click
  const handleEdit = (item: string) => {
    router.push(`/stock/edit/${encodeURIComponent(item)}`);
  };

  // Handle delete button click
  const handleDelete = async (item: string) => {
    if (confirm(`Are you sure you want to delete "${item}"?`)) {
      try {
        setIsDeleting(item);
        await stockApiService.deleteItem(item);
        onItemDeleted();
      } catch (err) {
        setError(stockApiService.handleError(err));
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Check if there are no items at all
  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No stock items found</p>
        <button
          onClick={() => router.push("/stock/create")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EOS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.item} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.item}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.EOS
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.EOS ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.updatedFormatted ||
                    new Date(item.updated).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item.item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.item)}
                    className="text-red-600 hover:text-red-900"
                    disabled={isDeleting === item.item}
                  >
                    {isDeleting === item.item ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => router.push("/stock/create")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </div>
    </div>
  );
};

export default StockList;
