'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ReportList } from './ReportList';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

type ReportType = 'business' | 'personal';
type ReportStatus = 'open' | 'closed';

interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  totalAmount: number;
  expenseCount: number;
  missingReceipts: number;
  missingComments: number;
  dateCreated: string;
  dateClosed?: string;
  categories: { [key: string]: number };
  merchants: { [key: string]: number };
}

export function ReportsView() {
  const [selectedType, setSelectedType] = useState<ReportType>('business');
  const [showClosed, setShowClosed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button
          variant="outline"
          onClick={() => setShowClosed(!showClosed)}
          className="gap-2"
        >
          {showClosed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showClosed ? 'Hide Closed Reports' : 'Show Closed Reports'}
        </Button>
      </div>

      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as ReportType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business Reports</TabsTrigger>
          <TabsTrigger value="personal">Personal Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <ReportList 
            type="business"
            showClosed={showClosed}
          />
        </TabsContent>
        <TabsContent value="personal">
          <ReportList 
            type="personal"
            showClosed={showClosed}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 