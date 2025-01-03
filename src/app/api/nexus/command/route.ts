import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    
    // Run nexus command
    const { stdout, stderr } = await execAsync(`npm run n ${command}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      output: stdout,
      error: stderr
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