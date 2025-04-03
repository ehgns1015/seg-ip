"use client";
import Layout from "@/app/components/Layout";
import StockForm from "@/app/components/StockForm";

/**
 * CreateStockPage component allows users to create a new stock item.
 *
 * @component
 * @returns {JSX.Element} The Create Stock page JSX
 */
export default function CreateStockPage() {
  return (
    <Layout title="Create New Stock Item">
      <div className="max-w-2xl mx-auto p-4">
        <StockForm mode="create" />
      </div>
    </Layout>
  );
}
