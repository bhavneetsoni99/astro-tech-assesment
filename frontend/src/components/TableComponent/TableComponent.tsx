import React, { memo, useRef, useEffect } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { LoadingSpinner } from "../LoadingSpinner";
import styles from "./tableComponent.styles.module.css";
import { TableRow } from "../../types";
import type { SortDirection } from "../../utils";
import downloadIcon from "../../assets/download.svg";

interface TableProps {
  tableName: 'players' | 'pitches';
  columns: string[][];
  data: TableRow[];
  totalCount?: number;
  hasMoreData?: boolean;
  isLoading?: boolean;
  error?: string;
  onRowClick?: (rowId: number | string) => void;
  onLoadMore?: () => void;
  sortColumn?: number | null;
  sortDirection?: SortDirection;
  onSort?: (columnIndex: number) => void;
  handleDownlad?: () => void;
}

const ROW_ESTIMATED_HEIGHT = 48;

export const TableComponent: React.FC<TableProps> = memo(({
  tableName,
  columns,
  data,
  totalCount = data.length,
  hasMoreData = false,
  isLoading = false,
  error,
  onRowClick,
  onLoadMore,
  sortColumn = null,
  sortDirection = null,
  onSort,
  handleDownlad
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasData = data.length > 0;
  const noDataMessage = `No ${tableName === 'players' ? 'players' : 'pitches'} found.`;
  const singularHeading = `1 ${tableName === 'players' ? 'Player' : 'Pitch'}`;
  const multipleHeading = `${totalCount} ${tableName === 'players' ? 'Players' : 'Pitches'}`;

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_ESTIMATED_HEIGHT,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const shouldVirtualize = virtualItems.length > 0 || data.length === 0;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !onLoadMore || !hasMoreData || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreData, isLoading, onLoadMore]);

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
            <span>Showing {data.length} of {totalCount}</span>
          </div>
        )}
        {handleDownlad && 
          <button className={styles.downloadButton} onClick={handleDownlad}>
            <img className="download" src={downloadIcon}></img>
          </button>
        }
      </div>
      <div className={styles.tableContainer} ref={tableContainerRef}>
        {isLoading && <LoadingSpinner />}
        <table aria-labelledby="table-heading">
          <thead>
            <tr>
              {columns.map(([column, cName], index) => (
                <th
                  key={column}
                  scope="col"
                  className={`${styles.sortableHeader} 
                  ${sortColumn === index ? styles.activeSort : ""}
                  ${styles[cName]}`}
                  onClick={() => onSort?.(index)}
                  onKeyDown={(e) => e.key === "Enter" && onSort?.(index)}
                  tabIndex={onSort ? 0 : undefined}
                  aria-sort={
                    sortColumn === index
                      ? sortDirection === "asc" ? "ascending" : "descending"
                      : undefined
                  }
                >
                  {column}
                  {sortColumn === index && (
                    <span className={styles.sortIndicator}>
                      {sortDirection === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          {hasData && (
            <tbody>
              {shouldVirtualize ? (
                <>
                  {virtualItems[0]?.start > 0 && (
                    <tr style={{ height: virtualItems[0].start }} />
                  )}
                  {virtualItems.map((virtualRow: VirtualItem) => {
                    const row = data[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        data-testid={`row-${row.id}`}
                        className={`${virtualRow.index % 2 === 0 ? styles.evenRow : styles.oddRow} ${onRowClick ? styles.clickable : ''}`}
                        style={{ height: virtualRow.size }}
                        {...(onRowClick && {
                          tabIndex: 0,
                          onClick: () => onRowClick(row.id),
                          onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => e.key === 'Enter' && onRowClick(row.id),
                        })}
                      >
                        {row.cells.map((cell, cellIndex) => (
                          <td key={columns[cellIndex][0]}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                  {totalSize - virtualItems[virtualItems.length - 1].end > 0 && (
                    <tr style={{ height: totalSize - virtualItems[virtualItems.length - 1].end }} />
                  )}
                </>
              ) : (
                data.map((row, index) => (
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
                      <td key={columns[cellIndex][0]}>{cell}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
        {hasMoreData && <div ref={sentinelRef} style={{ height: 1 }} />}
      </div>
    </div>
  );
});
