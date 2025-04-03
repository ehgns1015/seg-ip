import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { StockItem, StockFormData, Location } from "@/app/types/stock";
import { stockApiService } from "@/app/services/stock-api";

interface StockFormProps {
  initialData?: Partial<StockItem>;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * StockForm component for creating or editing stock items.
 *
 * @component
 * @param {StockFormProps} props - The component props
 * @returns {JSX.Element} The stock form component
 */
const StockForm: React.FC<StockFormProps> = ({
  initialData,
  mode,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();

  // Initialize form state with default values or values from initialData
  const [formData, setFormData] = useState<StockFormData>({
    item: initialData?.item || "",
    quantity: initialData?.quantity || 0,
    EOS: initialData?.EOS || false,
    location: initialData?.location || "Wiley",
    note: initialData?.note || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available locations
  const locations: Location[] = ["Wiley", "Redding", "Jane"];

  /**
   * Handles form submission.
   * Creates a new item or updates an existing one depending on the mode.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a copy of form data with trimmed values
      const trimmedData = {
        ...formData,
        item: formData.item.trim(),
        note: formData.note?.trim() || "",
      };

      if (mode === "create") {
        await stockApiService.createItem(trimmedData);
      } else if (mode === "edit" && initialData?.item) {
        await stockApiService.updateItem(initialData.item, trimmedData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/stock");
      }
    } catch (err) {
      setError(stockApiService.handleError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input field changes.
   * Updates the form data based on the input type.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">
        {mode === "create" ? "Add New Item" : "Edit Item"}
      </h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div>
        <label
          htmlFor="item"
          className="block text-sm font-medium text-gray-700"
        >
          Item Name
        </label>
        <input
          type="text"
          id="item"
          name="item"
          value={formData.item}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          required
          disabled={mode === "edit"} // Item name can't be changed in edit mode
        />
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="EOS"
          name="EOS"
          checked={formData.EOS}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="EOS" className="ml-2 block text-sm text-gray-900">
          End of Service (EOS)
        </label>
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <select
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          required
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-700"
        >
          Note
        </label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Item"
            : "Update Item"}
        </button>

        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StockForm;
