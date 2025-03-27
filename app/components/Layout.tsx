import React, { ReactNode, useEffect } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHomeButton?: boolean;
  showCreateButton?: boolean;
}

/**
 * Layout component for consistent page layout across the application.
 * It sets the document title and optionally shows Home and Create buttons.
 *
 * @component
 * @param {LayoutProps} props - The component props
 * @returns {JSX.Element} The layout component
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  title = "SEG IP Management",
  showHomeButton = true,
  showCreateButton = false,
}) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {children}

      {/* Fixed navigation buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        {showHomeButton && (
          <Link
            href="/"
            className="w-24 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
          >
            Home
          </Link>
        )}

        {showCreateButton && (
          <Link
            href="/ip-list/units/create"
            className="w-32 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
          >
            Create New
          </Link>
        )}
      </div>
    </div>
  );
};

export default Layout;
