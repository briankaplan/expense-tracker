import { useState } from 'react';
import { useNexus } from '@/contexts/NexusContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CommandCenter() {
  const { runCommand } = useNexus();
  const [command, setCommand] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;
    await runCommand(command);
    setCommand('');
  };

  const quickCommands = [
    { label: 'Check Status', command: 'status' },
    { label: 'Verify Scripts', command: 'verify-scripts' },
    { label: 'Run Brain', command: 'brain' },
    { label: 'Show Alerts', command: 'alerts' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Commands</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {quickCommands.map(cmd => (
            <Button 
              key={cmd.command}
              variant="outline"
              onClick={() => runCommand(cmd.command)}
            >
              {cmd.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Command</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command..."
              className="flex-1"
            />
            <Button type="submit">Run</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 