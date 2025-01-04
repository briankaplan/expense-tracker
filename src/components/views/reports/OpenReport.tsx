'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface OpenReportProps {
  type: 'business' | 'personal';
  onGenerate: () => void;
}

export function OpenReport({ type, onGenerate }: OpenReportProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>No Open Reports</CardTitle>
        <CardDescription>
          {type === 'business'
            ? 'Create a new business expense report to track and manage your business expenses.'
            : 'Create a new personal expense report to track and manage your personal expenses.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-6">
        <div className="rounded-full bg-muted p-6">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button onClick={onGenerate}>
          <FileText className="mr-2 h-4 w-4" />
          Generate {type.charAt(0).toUpperCase() + type.slice(1)} Report
        </Button>
      </CardFooter>
    </Card>
  );
} 