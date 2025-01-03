import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Read state files
    const projectState = JSON.parse(
      readFileSync(join(process.cwd(), '.project-state.json'), 'utf8')
    );
    const sessionState = JSON.parse(
      readFileSync(join(process.cwd(), '.session-state.json'), 'utf8')
    );

    return new Response(JSON.stringify({
      systemStatus: {
        initialized: true,
        lastCheck: new Date().toISOString(),
        activeFeatures: projectState.activeFeatures || [],
        pendingTasks: sessionState.currentContext?.pendingTasks || []
      },
      scriptStatus: {
        total: projectState.scripts?.total || 0,
        active: projectState.scripts?.active || 0,
        outdated: projectState.scripts?.outdated || 0,
        missing: projectState.scripts?.missing || 0
      },
      aiStatus: {
        lastSuggestion: sessionState.currentContext?.lastAISuggestion || '',
        pendingSuggestions: sessionState.currentContext?.pendingAISuggestions || []
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 