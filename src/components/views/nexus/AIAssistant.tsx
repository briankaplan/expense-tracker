'use client';

import { useNexus } from '@/contexts/NexusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AIAssistant() {
  const { state, runCommand } = useNexus();
  const { aiStatus } = state;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Last Suggestion</h3>
              <p className="text-sm text-muted-foreground">
                {aiStatus.lastSuggestion || 'No recent suggestions'}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Pending Suggestions</h3>
              <ul className="space-y-2">
                {aiStatus.pendingSuggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => runCommand('ai next')}
              >
                Get Next Steps
              </Button>
              <Button
                variant="outline"
                onClick={() => runCommand('ai analyze')}
              >
                Analyze Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 