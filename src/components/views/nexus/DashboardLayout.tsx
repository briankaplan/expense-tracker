import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { CommandCenter } from './CommandCenter';
import { SystemStatus } from './SystemStatus';
import { ScriptManager } from './ScriptManager';
import { AIAssistant } from './AIAssistant';

export function DashboardLayout() {
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
          <CommandCenter />
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