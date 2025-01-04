import { useNexusState } from '@/lib/hooks/useNexusState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScriptStatus {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  error?: string;
}

interface NexusState {
  scripts: Record<string, ScriptStatus>;
  isInitialized: boolean;
  error: Error | null;
}

export function ScriptManager() {
  const state = useNexusState();
  const scriptStatus = state.scripts as Record<string, ScriptStatus>;

  if (!scriptStatus) {
    return null;
  }

  const totalScripts = Object.keys(scriptStatus).length;
  const activeScripts = Object.values(scriptStatus).filter(script => script.status === 'running').length;
  const progress = totalScripts > 0 ? (activeScripts / totalScripts) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Script Manager</CardTitle>
        <CardDescription>Monitor and manage Nexus scripts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Active Scripts</span>
            <span>{activeScripts} / {totalScripts}</span>
          </div>
          <Progress value={progress} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Outdated</span>
              <p className="text-2xl font-bold">{Object.values(scriptStatus).filter(script => script.status === 'outdated').length}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Missing</span>
              <p className="text-2xl font-bold">{Object.values(scriptStatus).filter(script => script.status === 'missing').length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 