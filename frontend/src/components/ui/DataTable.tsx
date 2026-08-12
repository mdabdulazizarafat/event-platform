'use client';

import React from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyText = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant/60 bg-surface-container-low/50">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider font-bold">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/40">
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={row.id ?? index}
                onClick={() => onRowClick?.(row)}
                className={`group hover:bg-surface-container-low/30 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-body-sm text-foreground">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-body-sm text-on-surface-variant italic">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
