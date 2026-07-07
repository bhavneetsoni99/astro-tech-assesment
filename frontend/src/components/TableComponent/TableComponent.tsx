import React, { memo } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import styles from "./tableComponent.styles.module.css";
import { TableRow } from "../../types";

interface TableProps {
  tableName: 'players' | 'pitches';
  columns: string[];
  data: TableRow[];
  totalCount?: number;
  hasMoreData?: boolean;
  isLoading?: boolean;
  error?: string;
  onRowClick?: (rowId: number | string) => void;
  onLoadMore?: () => void;
}

export const TableComponent: React.FC<TableProps> = memo(({
  tableName,
  columns,
  data,
  totalCount = data.length,
  hasMoreData = false,
  isLoading = false,
  error,
  onRowClick,
  onLoadMore = () => { },
}) => {

  const hasData = data.length > 0;
  const noDataMessage = `No ${tableName === 'players' ? 'players' : 'pitches'} found.`;
  const singularHeading = `1 ${tableName === 'players' ? 'Player' : 'Pitch'}`;
  const multipleHeading = `${totalCount} ${tableName === 'players' ? 'Players' : 'Pitches'}`;

  if (error) {
    return (
      <div className={styles.tableComponent}>
        <div className={styles.error} role="alert">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.tableComponent}>
      <div className={styles.tableHeading}>
        <h2 id="table-heading" className={!hasData ? styles.noData : ''}>
          {hasData ? (data.length === 1 ? singularHeading : multipleHeading) : noDataMessage}
        </h2>
        {hasMoreData && (
          <div className={styles.dataInfo}>
            <span>Showing {data.length} of {totalCount} </span>
            <button role="button"
              className={styles.clickable}
              onClick={onLoadMore}
              onKeyDown={(e) => e.key === 'Enter' && onLoadMore()}
            >
              Load More
            </button>
          </div>
        )}
      </div>
      <div className={styles.tableContainer}>
        {isLoading && (<LoadingSpinner />)}

        <table aria-labelledby="table-heading">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">{column}</th>
              ))}
            </tr>
          </thead>
          {hasData && (
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.id}
                  data-testid={`row-${row.id}`}
                  className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${onRowClick ? styles.clickable : ''}`}
                  {...(onRowClick && {
                    tabIndex: 0,
                    onClick: () => onRowClick(row.id),
                    onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => e.key === 'Enter' && onRowClick(row.id),
                  })}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td key={columns[cellIndex]}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
});

