import React from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import pageStyles from "../../styles/page.module.css";

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  error?: string;
  empty?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  error,
  empty,
  isLoading,
  children,
}) => {
  if (error) return <div className={pageStyles.error}>Error: {error}</div>;

  return (
    <div className={pageStyles.page}>
      {(title || subtitle) && (
        <div>
          {title && <h2 className={pageStyles.pageTitle}>{title}</h2>}
          {subtitle && <p className={pageStyles.pageSubtitle}>{subtitle}</p>}
        </div>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : empty && !React.Children.count(children) ? (
        <div className={pageStyles.empty}>{empty}</div>
      ) : (
        children
      )}
    </div>
  );
};
