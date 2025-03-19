"use client";
import Layout from "@/app/components/Layout";
import InventoryForm from "@/app/components/InventoryForm";

/**
 * CreateInventoryPage component allows users to create a new inventory item.
 *
 * @component
 * @returns {JSX.Element} The Create Inventory page JSX
 */
export default function CreateInventoryPage() {
  return (
    <Layout title="Create New Inventory Item">
      <div className="max-w-2xl mx-auto p-4">
        <InventoryForm mode="create" />
      </div>
    </Layout>
  );
}
