"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * ButtonLink component renders a styled link button.
 * This component is reusable and allows dynamic configuration of the button's color and destination link.
 *
 * @param {Object} props - The properties for the button component
 * @param {string} props.href - The URL the button links to
 * @param {string} props.color - The background color of the button (e.g., "bg-blue-500")
 * @param {React.ReactNode} props.children - The text or content to display inside the button
 * @returns {JSX.Element} The styled link button JSX
 */
const ButtonLink: React.FC<{
  href: string;
  color: string;
  children: React.ReactNode;
}> = ({ href, color, children }) => {
  const hoverColor = color.replace(
    /bg-(\w+)-(\d+)/,
    "bg-$1-" + (parseInt("$2") + 100)
  );

  return (
    <Link
      href={href}
      className={`w-40 ${color} text-white py-3 px-6 rounded-lg hover:${hoverColor} text-center font-medium transition-colors duration-200`}
    >
      {children}
    </Link>
  );
};

/**
 * The Home component renders the IP Management System's main page,
 * displaying navigation buttons for creating new units and viewing existing units.
 *
 * @returns {JSX.Element} JSX for the Home page content
 */
export default function Home() {
  useEffect(() => {
    // Set the document title to "SEG IP Management"
    document.title = "SEG IP Management";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800">
          IP Management System
        </h1>

        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={500}
            height={200}
            priority
            className="w-auto h-auto"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
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
  );
}
