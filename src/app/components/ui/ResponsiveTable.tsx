'use client';

import React from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  hideOnMobile?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

const ResponsiveTable = ({ columns, data, onRowClick }: ResponsiveTableProps) => {
  return (
    <>
      {/* デスクトップ用テーブル */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル用カードレイアウト */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div
            key={index}
            className={`bg-white p-4 rounded-lg border border-gray-200 ${
              onRowClick ? 'cursor-pointer hover:shadow-md' : ''
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {columns
              .filter(column => !column.hideOnMobile)
              .map((column) => (
                <div key={column.key} className="flex justify-between items-start py-1">
                  <span className="text-sm font-medium text-gray-600 w-1/3">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 w-2/3 text-right">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;