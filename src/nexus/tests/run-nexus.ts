import { NexusAutoFix } from '../auto-fix/NexusAutoFix';
import { UnifiedMonitor } from '../monitor/UnifiedMonitor';
import { config } from 'dotenv';

// Load environment variables
config();

async function main() {
    console.log('Starting Nexus system...');
    
    // Initialize components
    const autoFix = new NexusAutoFix();
    const monitor = new UnifiedMonitor();
    
    // Set up event listeners for the monitor
    monitor.on('stateUpdate', (state) => {
        console.log('System state update:', state);
    });
    
    monitor.on('anomalyDetected', async (anomaly) => {
        console.log('Anomaly detected:', anomaly);
        console.log('Initiating auto-fix process...');
        
        try {
            const fixes = await autoFix.fixAll();
            console.log('Auto-fix results:', fixes);
        } catch (error) {
            console.error('Auto-fix failed:', error);
        }
    });
    
    // Start monitoring
    try {
        await monitor.startMonitoring();
        console.log('Nexus system is now active and monitoring all components.');
    } catch (error) {
        console.error('Failed to start monitoring:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 