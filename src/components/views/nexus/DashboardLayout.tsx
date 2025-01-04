import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScriptManager } from './ScriptManager';
import { SystemStatus } from './SystemStatus';
import { AIAssistant } from './AIAssistant';
import { CommandCenter } from './CommandCenter';
import { executeCommand } from '@/lib/services/nexus';

export function DashboardLayout() {
  const handleExecuteCommand = async (command: string) => {
    try {
      await executeCommand(command);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nexus Development Center</h1>
      
      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="commands">
          <CommandCenter onExecuteCommand={handleExecuteCommand} />
        </TabsContent>

        <TabsContent value="scripts">
          <ScriptManager />
        </TabsContent>

        <TabsContent value="ai">
          <AIAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
} 