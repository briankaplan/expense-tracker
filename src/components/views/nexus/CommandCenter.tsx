import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CommandCenterProps {
  onExecuteCommand: (command: string) => Promise<void>;
}

export function CommandCenter({ onExecuteCommand }: CommandCenterProps) {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!command.trim()) return;
    
    setIsExecuting(true);
    try {
      await onExecuteCommand(command);
      setCommand('');
    } catch (error) {
      console.error('Failed to execute command:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter Nexus command..."
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            disabled={isExecuting}
          />
          <Button 
            onClick={handleExecute}
            disabled={!command.trim() || isExecuting}
          >
            Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 