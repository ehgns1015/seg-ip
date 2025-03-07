"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiService } from "@/app/services/api";
import type { FormData } from "@/app/models/formData";
import Layout from "@/app/components/Layout";
import UnitForm from "@/app/components/UnitForm";
import Loading from "@/app/loading";

/**
 * EditPage component is used to render a form for editing an existing unit's data.
 * It fetches the unit data based on the 'name' parameter from the URL and displays
 * a form to edit that unit.
 *
 * @component
 * @returns {JSX.Element} The EditPage JSX
 */
export default function EditPage() {
  const { name } = useParams<{ name: string }>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeFields, setEmployeeFields] = useState<FormData[]>([]);
  const [machineFields, setMachineFields] = useState<FormData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the unit data
        const unit = await apiService.getUnitByName(name);
        setFormData(unit);
        document.title = unit.ip || "Edit Unit";

        // Parse field configurations
        const employeeFieldsData = process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS
          ? JSON.parse(process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS)
          : [];
        const machineFieldsData = process.env.NEXT_PUBLIC_MACHINE_FIELDS
          ? JSON.parse(process.env.NEXT_PUBLIC_MACHINE_FIELDS)
          : [];

        setEmployeeFields(employeeFieldsData);
        setMachineFields(machineFieldsData);
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchData();
    }
  }, [name]);

  if (loading) {
    return <Loading />;
  }

  if (error || !formData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error || "Unit not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${formData.name}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Unit</h1>
        <UnitForm
          initialData={formData}
          mode="edit"
          employeeFields={employeeFields}
          machineFields={machineFields}
        />
      </div>
    </Layout>
  );
}
