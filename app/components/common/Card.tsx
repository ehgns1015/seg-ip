import React from "react";

interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className = "",
}) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {title && (
      <div className="p-4 border-b">
        {typeof title === "string" ? (
          <h2 className="text-xl font-semibold">{title}</h2>
        ) : (
          title
        )}
      </div>
    )}
    <div className="p-4">{children}</div>
    {footer && <div className="p-4 border-t">{footer}</div>}
  </div>
);
