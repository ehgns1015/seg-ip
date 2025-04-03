// app/stock/cablestock/upload/page.tsx
"use client";
import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import axios from "axios";
import { CableStockData } from "@/app/types/cablestock";

/**
 * CableStockUploadPage component provides an interface for uploading
 * cable stock Excel files with drag and drop functionality.
 *
 * @returns {JSX.Element} The rendered Cable Stock Upload page
 */
export default function CableStockUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates the Excel file format and naming convention.
   * Updated to handle different file name formats.
   *
   * @param {File} file - The file to validate
   * @returns {boolean} Whether the file is valid
   */
  const validateFile = (file: File): boolean => {
    // Validate filename format - updated for (MM.DD.YYYY) format
    const isValidFormat =
      /CABLE STOCK(?:\()(?:\d{2})\.(?:\d{2})\.(?:\d{4})(?:\))\.xlsx$/i.test(
        file.name
      );

    if (!isValidFormat) {
      setError(
        "Invalid filename format. Expected format: CABLE STOCK(MM.DD.YYYY).xlsx"
      );
      return false;
    }

    // Validate file type
    const isExcel =
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isExcel) {
      setError("File must be an Excel (.xlsx) document.");
      return false;
    }

    return true;
  };

  /**
   * Handles file selection from the file input.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        if (e.target) e.target.value = "";
      }
    }
  };

  /**
   * Handles drag over event to provide visual feedback.
   *
   * @param {DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event to reset visual feedback.
   *
   * @param {DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handles file drop event to process the dropped file.
   *
   * @param {DragEvent<HTMLDivElement>} e - The drop event
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  /**
   * Opens the file browser when the drop area is clicked.
   */
  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles form submission and file upload.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
   */
  // Update the handleSubmit function in app/inventory/cablestock/upload/page.tsx
  // At the top of app/inventory/cablestock/upload/page.tsx
  // Add this import statement
  // Then update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      // Extract month/year from filename
      const fileNameMatch = file.name.match(
        /CABLE STOCK(?:\()(\d{2})\.(\d{2})\.(\d{4})(?:\))\.xlsx/i
      );

      if (!fileNameMatch) {
        setError(
          "Invalid filename format. Expected: CABLE STOCK(MM.DD.YYYY).xlsx"
        );
        return;
      }

      // Use proper destructuring to avoid unused variable warnings
      const [, month, , year] = fileNameMatch;
      const monthKey = `${month}/${year}`;

      // Get all cable stock data and check if this month exists
      try {
        const response = await axios.get("/api/cablestock");
        const existingData = response.data;

        // Properly typed to avoid "any" type errors
        const monthExists = existingData.some(
          (item: CableStockData) => item.month === monthKey
        );

        if (monthExists) {
          // Month exists, show confirmation dialog
          const formData = new FormData();
          formData.append("file", file);
          setPendingUpload(formData);
          setShowOverwriteModal(true);
          return;
        } else {
          // Month doesn't exist, proceed with upload
          await uploadFile();
        }
      } catch (error) {
        console.error("Error checking for existing months:", error);
        setError("Error checking if month already exists");
      }
    } catch (error: unknown) {
      console.error("Submission error:", error);
      setError("Error processing submission");
    }
  };

  /**
   * Performs the actual file upload.
   */
  const uploadFile = async () => {
    if (!file && !pendingUpload) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let formData;
      if (pendingUpload) {
        formData = pendingUpload;
      } else {
        formData = new FormData();
        formData.append("file", file!);
      }

      const response = await axios.post("/api/cablestock/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(
        `${response.data.month} data successfully uploaded. (${response.data.itemCount} items)`
      );
      setFile(null);
      setPendingUpload(null);
      setShowOverwriteModal(false);

      // Redirect to list page after 3 seconds
      setTimeout(() => {
        router.push("/stock/cablestock");
      }, 3000);
    } catch (error: unknown) {
      console.error("Upload error:", error);

      // Default error message
      let errorMessage = "Error uploading file.";

      // Extract more specific error if available
      if (axios.isAxiosError(error)) {
        const serverErrorMessage = error.response?.data?.error;
        if (serverErrorMessage) {
          errorMessage = serverErrorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Cable Stock Upload">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Cable Stock Upload</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
            )}

            {success && (
              <div className="bg-green-100 text-green-700 p-4 rounded">
                {success}
                <p className="mt-2 text-sm">
                  Redirecting to stock view page...
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File (CABLE STOCK(MM.DD.YYYY).xlsx)
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drag and drop area */}
              <div
                onClick={handleDropAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-48 border-2 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : file
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                } border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors`}
              >
                <svg
                  className={`w-12 h-12 mb-3 ${
                    isDragging
                      ? "text-blue-500"
                      : file
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>

                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Excel file only (.xlsx)
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Filename must follow the format: CABLE STOCK(MM.DD.YYYY).xlsx
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Excel file must contain columns for Category, Type, LINNO, and
                Quantity.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push("/stock/cablestock")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={!file || loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Overwrite Confirmation Modal */}
        {showOverwriteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Please Check</h3>
              <p className="mb-6">
                Data for this month already exists. Do you want to overwrite it?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={uploadFile}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => {
                    setShowOverwriteModal(false);
                    setPendingUpload(null);
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
