import { useNexus } from '@/contexts/NexusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function ScriptManager() {
  const { state } = useNexus();
  const { scriptStatus } = state;

  const total = scriptStatus.total || 1; // Prevent division by zero
  const activePercent = (scriptStatus.active / total) * 100;
  const outdatedPercent = (scriptStatus.outdated / total) * 100;
  const missingPercent = (scriptStatus.missing / total) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Script Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Scripts</span>
              <span className="text-green-600">{scriptStatus.active}</span>
            </div>
            <Progress value={activePercent} className="bg-green-200" />

            <div className="flex justify-between text-sm mt-4">
              <span>Outdated Scripts</span>
              <span className="text-yellow-600">{scriptStatus.outdated}</span>
            </div>
            <Progress value={outdatedPercent} className="bg-yellow-200" />

            <div className="flex justify-between text-sm mt-4">
              <span>Missing Scripts</span>
              <span className="text-red-600">{scriptStatus.missing}</span>
            </div>
            <Progress value={missingPercent} className="bg-red-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 