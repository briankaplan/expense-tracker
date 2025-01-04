interface NexusStatus {
  isRunning: boolean;
  lastSync: string | null;
  activeFeatures: string[];
  errors: string[];
}

export async function executeCommand(command: string): Promise<void> {
  const response = await fetch('/api/nexus/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute command');
  }
}

export async function getNexusStatus(): Promise<NexusStatus> {
  const response = await fetch('/api/nexus/status');
  
  if (!response.ok) {
    throw new Error('Failed to get Nexus status');
  }

  return response.json();
} 