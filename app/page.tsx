/**
 * The Home component renders the main page of the IP Management System.
 * This component sets the document title, displays a logo image, and includes two navigation links (Create New, View Units).
 *
 * @component
 * @returns {JSX.Element} The Home component JSX
 *
 * @example
 * <Home />
 */
"use client";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";

/**
 * ButtonLink component renders a styled link button.
 * This component is reusable and allows dynamic configuration of the button's color and destination link.
 *
 * @param {Object} props - The properties for the button component
 * @param {string} props.href - The URL the button links to
 * @param {string} props.color - The background color of the button (e.g., "bg-blue-500" or "bg-green-500")
 * @param {React.ReactNode} props.children - The text or content to display inside the button
 *
 * @returns {JSX.Element} The styled link button JSX
 *
 * @example
 * <ButtonLink href="/create" color="bg-blue-500">Create New</ButtonLink>
 */
const ButtonLink: React.FC<{
  href: string;
  color: string;
  children: React.ReactNode;
}> = ({ href, color, children }) => (
  <Link
    href={href}
    className={`w-32 ${color} text-white py-2 px-4 rounded hover:${
      color === "bg-blue-500" ? "bg-blue-600" : "bg-green-600"
    } text-center`}
  >
    {children}
  </Link>
);

/**
 * The Home component renders the IP Management System's main page,
 * displaying a "Create New" button and a "View Units" button.
 * It sets the document title to "SEG IP Management" and renders the content with Tailwind CSS styling.
 *
 * - Uses the useEffect hook to set the document title when the component is first rendered.
 * - The page includes the company logo and two clickable buttons.
 *
 * @returns {JSX.Element} JSX for the Home page content
 */
export default function Home() {
  useEffect(() => {
    // Set the document title to "SEG IP Management"
    document.title = "SEG IP Management";
  },[]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Head>
        <meta name="description" content="SEG IP Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SEG IP Management</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">IP Management System</h1>
          <div className="mb-8 flex justify-center">
            <Image src="/images/logo.png" alt="Logo" width="500" height="0"/>
          </div>
          <div className="flex flex-col items-center gap-4">
            {/* Buttons for "Create New" and "View Units" */}
            <ButtonLink href="/create" color="bg-blue-500">
              Create New
            </ButtonLink>
            <ButtonLink href="/units" color="bg-green-500">
              View Units
            </ButtonLink>
            <ButtonLink href="/ip-list" color="bg-yellow-500">
              Available IP
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
