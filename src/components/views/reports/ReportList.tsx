'use client';

import { ReportCard } from './ReportCard';
import { OpenReport } from './OpenReport';

interface ReportListProps {
  type: 'business' | 'personal';
  showClosed: boolean;
}

export function ReportList({ type, showClosed }: ReportListProps) {
  return (
    <div className="space-y-6">
      {/* Open Reports Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Open Reports</h2>
        <OpenReport type={type} />
      </div>

      {/* Closed Reports Section */}
      {showClosed && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Closed Reports</h2>
          <div className="grid gap-4">
            {/* Map through closed reports */}
            <ReportCard 
              status="closed"
              type={type}
              // ... other props
            />
          </div>
        </div>
      )}
    </div>
  );
} 