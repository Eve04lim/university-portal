'use client';

import { ResponsiveCard, ResponsiveTable } from '../../ui';
import { Grade, TableColumn } from '../types';
import { getGradeColor, getCategoryColor } from '../utils';

interface GradeTableProps {
  grades: Grade[];
  onRowClick: (grade: Grade) => void;
}

const GradeTable = ({ grades, onRowClick }: GradeTableProps) => {
  const tableColumns: TableColumn[] = [
    {
      key: 'subjectName',
      label: '科目',
      render: (value: unknown, row: Grade) => (
        <div>
          <div className="font-medium text-gray-900">{row.subjectName}</div>
          <div className="text-sm text-gray-500">{row.subjectCode}</div>
        </div>
      )
    },
    {
      key: 'professor',
      label: '担当教員',
      hideOnMobile: true
    },
    {
      key: 'semester',
      label: '学期',
      render: (value: unknown, row: Grade) => `${row.year}年 ${row.semester}`
    },
    {
      key: 'credits',
      label: '単位',
    },
    {
      key: 'category',
      label: 'カテゴリ',
      hideOnMobile: true,
      render: (value: unknown) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'grade',
      label: '成績',
      render: (value: unknown) => (
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'gpa',
      label: 'GPA',
      render: (value: unknown, row: Grade) => 
        row.grade !== '履修中' ? (value as number).toFixed(1) : '-'
    },
    {
      key: 'finalScore',
      label: '点数',
      hideOnMobile: true,
      render: (value: unknown, row: Grade) => 
        row.grade !== '履修中' ? (value as number).toString() : '-'
    }
  ];

  return (
    <ResponsiveCard className="overflow-hidden">
      <ResponsiveTable<Grade>
        columns={tableColumns}
        data={grades}
        onRowClick={onRowClick}
        emptyMessage="条件に一致する成績がありません"
      />
    </ResponsiveCard>
  );
};

export default GradeTable;