"use client";
import { useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import UnitForm from "@/app/components/UnitForm";
import type { FormData } from "@/app/types";

/**
 * CreatePage component allows the user to create a new unit (either an employee or a machine).
 * The form dynamically adjusts based on the selected type, and the data is submitted via a POST request to save the unit.
 *
 * @component
 * @returns {JSX.Element} The Create New Unit page JSX
 */
export default function CreatePage() {
  const [employeeFields, setEmployeeFields] = useState<FormData[]>([]);
  const [machineFields, setMachineFields] = useState<FormData[]>([]);

  useEffect(() => {
    // Parse the field configurations from environment variables
    const employeeFieldsData = process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS)
      : [];
    const machineFieldsData = process.env.NEXT_PUBLIC_MACHINE_FIELDS
      ? JSON.parse(process.env.NEXT_PUBLIC_MACHINE_FIELDS)
      : [];

    setEmployeeFields(employeeFieldsData);
    setMachineFields(machineFieldsData);
  }, []);

  return (
    <Layout title="Create New Unit">
      <div className="max-w-2xl mx-auto">
        <UnitForm
          mode="create"
          employeeFields={employeeFields}
          machineFields={machineFields}
        />
      </div>
    </Layout>
  );
}
