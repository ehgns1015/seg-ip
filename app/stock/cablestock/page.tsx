// app/stock/cablestock/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import axios from "axios";
import Link from "next/link";
import {
  CableStockData,
  CableStockItem,
  ConsumptionData,
  ConsumptionItem,
} from "@/app/types/cablestock";

// Extended consumption item interface
interface ExtendedConsumptionItem extends ConsumptionItem {
  toLinno: string;
  linnoChanged: boolean;
  instock: number;
  usedLinno: string;
  instockLinno: string;
  usedQuantity: number;
  instockQuantity: number;
}

/**
 * CableStockPage component displays historical cable stock data.
 * Users can select two months to view consumption data in a modal.
 */
export default function CableStockPage() {
  const [stockData, setStockData] = useState<CableStockData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFromMonth, setSelectedFromMonth] = useState<string | null>(
    null
  );
  const [selectedToMonth, setSelectedToMonth] = useState<string | null>(null);
  const [consumptionData, setConsumptionData] =
    useState<ConsumptionData | null>(null);
  const [showConsumptionModal, setShowConsumptionModal] =
    useState<boolean>(false);

  /**
   * Loads stock data when component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/cablestock");
        setStockData(response.data);

        // Extract month list
        const monthsMap: { [key: string]: boolean } = {};
        response.data.forEach((item: CableStockData) => {
          monthsMap[item.month] = true;
        });
        const monthList = Object.keys(monthsMap).sort(compareMonths);
        setMonths(monthList);

        // Extract type list
        const typesMap: { [key: string]: boolean } = {};
        response.data.forEach((monthData: CableStockData) => {
          monthData.items.forEach((item: CableStockItem) => {
            typesMap[item.type] = true;
          });
        });
        const typesList = Object.keys(typesMap).sort();
        setTypes(typesList);

        setError(null);
      } catch (error: unknown) {
        console.error("Data loading error:", error);

        let errorMessage = "Error loading cable stock data";
        if (axios.isAxiosError(error)) {
          const serverError = error.response?.data?.error;
          if (serverError) {
            errorMessage = serverError;
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Compares two months for chronological sorting.
   */
  const compareMonths = (a: string, b: string): number => {
    const [aMonth, aYear] = a.split("/");
    const [bMonth, bYear] = b.split("/");

    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
    return parseInt(aMonth) - parseInt(bMonth);
  };

  /**
   * Handles month selection for comparison.
   */
  const handleMonthClick = (month: string): void => {
    if (!selectedFromMonth) {
      setSelectedFromMonth(month);
    } else if (!selectedToMonth && month !== selectedFromMonth) {
      // Sort selected months chronologically
      const [fromMonth, toMonth] = [selectedFromMonth, month].sort(
        compareMonths
      );
      setSelectedFromMonth(fromMonth);
      setSelectedToMonth(toMonth);
      fetchConsumptionData(fromMonth, toMonth);
      setShowConsumptionModal(true);
    } else {
      // Reset on reselection
      setSelectedFromMonth(month);
      setSelectedToMonth(null);
      setConsumptionData(null);
    }
  };

  /**
   * Opens the consumption modal with the current selected months
   */
  const openConsumptionModal = () => {
    if (selectedFromMonth && selectedToMonth) {
      fetchConsumptionData(selectedFromMonth, selectedToMonth);
      setShowConsumptionModal(true);
    }
  };

  /**
   * Fetches consumption data between two months.
   */
  const fetchConsumptionData = async (
    fromMonth: string,
    toMonth: string
  ): Promise<void> => {
    try {
      setLoading(true);

      // Get data for both months
      const fromData = stockData.find((data) => data.month === fromMonth);
      const toData = stockData.find((data) => data.month === toMonth);

      if (!fromData || !toData) {
        setError("Could not find data for selected months");
        setLoading(false);
        return;
      }

      // Calculate consumption for each item in fromData
      const itemsFromFrom = fromData.items.map((fromItem) => {
        const toItem = toData.items.find((item) => item.type === fromItem.type);

        // Default values if item not found in to-month
        const toQuantity = toItem ? toItem.quantity : 0;
        const toLinno = toItem ? toItem.linno : "";

        // Calculate quantity difference
        const fromQuantity = fromItem.quantity;
        const quantityDifference = toQuantity - fromQuantity;

        // Calculate LINNO difference - treat as string comparison
        const linnoDifference = toLinno.localeCompare(fromItem.linno);

        // Per the requirements:
        // - If difference >= 0, goes in USED column
        // - If difference < 0, goes in INSTOCK column

        let usedQuantity = 0;
        let instockQuantity = 0;
        let usedLinno = "";
        let instockLinno = "";

        // Process quantity
        if (quantityDifference >= 0) {
          usedQuantity = quantityDifference;
        } else {
          instockQuantity = Math.abs(quantityDifference);
        }

        // Process LINNO (using string comparison)
        // For LINNO, we need to check the actual strings
        const linnoChanged = fromItem.linno !== toLinno;
        if (linnoChanged) {
          if (linnoDifference >= 0) {
            // to.LINNO >= from.LINNO (alphabetically)
            usedLinno = toLinno;
          } else {
            // to.LINNO < from.LINNO (alphabetically)
            instockLinno = toLinno;
          }
        }

        const consumptionRate =
          fromQuantity > 0
            ? ((Math.abs(quantityDifference) / fromQuantity) * 100).toFixed(2) +
              "%"
            : "0%";

        // Create a ConsumptionItem with additional properties
        const consumptionItem: ExtendedConsumptionItem = {
          type: fromItem.type,
          linno: fromItem.linno,
          fromQuantity: fromQuantity,
          toQuantity: toQuantity,
          consumption: Math.abs(quantityDifference), // Keep for compatibility
          consumptionRate: consumptionRate,
          toLinno: toLinno,
          linnoChanged: linnoChanged,
          instock: 0, // Keep for compatibility
          usedLinno: usedLinno,
          instockLinno: instockLinno,
          usedQuantity: usedQuantity,
          instockQuantity: instockQuantity,
        };

        return consumptionItem;
      });

      // Add items that exist only in toData (new items)
      const itemsOnlyInTo = toData.items
        .filter(
          (toItem) =>
            !fromData.items.some((fromItem) => fromItem.type === toItem.type)
        )
        .map((toItem) => {
          return {
            type: toItem.type,
            linno: "",
            toLinno: toItem.linno,
            linnoChanged: toItem.linno !== "",
            fromQuantity: 0,
            toQuantity: toItem.quantity,
            consumption: toItem.quantity, // For compatibility
            consumptionRate: "100%",
            instock: 0, // For compatibility
            usedLinno: toItem.linno, // New items go to USED by default
            instockLinno: "",
            usedQuantity: toItem.quantity, // New items go to USED by default
            instockQuantity: 0,
          } as ExtendedConsumptionItem;
        });

      // Combine both arrays
      const allItems = [...itemsFromFrom, ...itemsOnlyInTo];

      setConsumptionData({
        fromMonth,
        toMonth,
        items: allItems,
      });
    } catch (error: unknown) {
      console.error("Consumption data calculation error:", error);

      let errorMessage = "Error calculating consumption data";
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data?.error;
        if (serverError) {
          errorMessage = serverError;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retrieves item data for a specific type and month.
   */
  const getItem = (type: string, month: string): CableStockItem | null => {
    const monthData = stockData.find((data) => data.month === month);
    if (!monthData) return null;

    return monthData.items.find((item) => item.type === type) || null;
  };

  /**
   * Retrieves quantity for a specific type and month.
   */
  const getQuantity = (type: string, month: string): string | number => {
    const item = getItem(type, month);
    return item ? item.quantity : "-";
  };

  /**
   * Retrieves LINNO for a specific type and month.
   */
  const getLinno = (type: string, month: string): string => {
    const item = getItem(type, month);
    return item && item.linno ? item.linno : "-";
  };

  return (
    <Layout title="Cable Stock Management">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cable Stock Management</h1>
          <div className="flex space-x-2">
            {selectedFromMonth && selectedToMonth && (
              <button
                onClick={openConsumptionModal}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="mr-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
                View Consumption
              </button>
            )}
            <Link
              href="/stock/cablestock/upload"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="mr-2"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
              </svg>
              Upload New Data
            </Link>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Select two months to view consumption data. Currently
          {selectedFromMonth
            ? ` selected: ${selectedFromMonth}`
            : " no month selected"}
          {selectedToMonth ? ` to ${selectedToMonth}` : ""}.
        </p>

        {loading && <div className="text-center py-4">Loading data...</div>}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {months.length === 0 && !loading && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
            No cable stock data available. Please upload data using the button
            above.
          </div>
        )}

        {months.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {/* Main header row with month titles */}
                <tr>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
                    rowSpan={2}
                  >
                    Type
                  </th>
                  {months.map((month) => (
                    <th
                      key={month}
                      className={`px-6 py-2 text-center text-xs font-medium uppercase tracking-wider cursor-pointer ${
                        selectedFromMonth === month || selectedToMonth === month
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500"
                      }`}
                      colSpan={2}
                      onClick={() => handleMonthClick(month)}
                    >
                      {month}
                    </th>
                  ))}
                </tr>
                {/* Sub-header row with LINNO and Quantity */}
                <tr>
                  {months.map((month) => (
                    <React.Fragment key={`sub-${month}`}>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          selectedFromMonth === month ||
                          selectedToMonth === month
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        LINNO
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          selectedFromMonth === month ||
                          selectedToMonth === month
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        Quantity
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {type}
                    </td>
                    {months.map((month) => (
                      <React.Fragment key={`${type}-${month}`}>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 ${
                            selectedFromMonth === month ||
                            selectedToMonth === month
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {getLinno(type, month)}
                        </td>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 ${
                            selectedFromMonth === month ||
                            selectedToMonth === month
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {getQuantity(type, month)}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Consumption Modal */}
        {showConsumptionModal && consumptionData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Consumption Analysis: {consumptionData.fromMonth} →{" "}
                  {consumptionData.toMonth}
                </h2>
                <button
                  onClick={() => setShowConsumptionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50"
                          rowSpan={2}
                        >
                          Type
                        </th>
                        <th
                          colSpan={2}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {consumptionData.fromMonth}
                        </th>
                        <th
                          colSpan={2}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {consumptionData.toMonth}
                        </th>
                        <th
                          colSpan={2}
                          className="px-6 py-3 text-center text-xs font-medium text-red-500 uppercase tracking-wider"
                        >
                          USED
                        </th>
                        <th
                          colSpan={2}
                          className="px-6 py-3 text-center text-xs font-medium text-green-500 uppercase tracking-wider"
                        >
                          INSTOCK
                        </th>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          LINNO
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          LINNO
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-red-500 uppercase tracking-wider">
                          LINNO
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-red-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-green-500 uppercase tracking-wider">
                          LINNO
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-green-500 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consumptionData.items
                        .sort((a, b) => {
                          // Sort by UsedQuantity (descending), then by InstockQuantity (descending)
                          const aItem = a as any;
                          const bItem = b as any;

                          if (aItem.usedQuantity !== bItem.usedQuantity) {
                            return bItem.usedQuantity - aItem.usedQuantity;
                          }
                          return bItem.instockQuantity - aItem.instockQuantity;
                        })
                        .map((item) => {
                          const extendedItem =
                            item as ExtendedConsumptionItem & {
                              usedQuantity: number;
                              instockQuantity: number;
                            };
                          return (
                            <tr key={item.type} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                                {item.type}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                {item.linno}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                {item.fromQuantity}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                {extendedItem.toLinno}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                {item.toQuantity}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-500 italic">
                                {extendedItem.usedLinno || "-"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-500 font-semibold">
                                {extendedItem.usedQuantity > 0
                                  ? extendedItem.usedQuantity
                                  : "-"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-green-500 italic">
                                {extendedItem.instockLinno || "-"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-green-500 font-semibold">
                                {extendedItem.instockQuantity > 0
                                  ? extendedItem.instockQuantity
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowConsumptionModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
