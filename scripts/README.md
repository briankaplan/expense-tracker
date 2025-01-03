# Nexus Development Control Center

Nexus is a comprehensive development control system that provides:
- Real-time development dashboard
- State synchronization
- Recovery management
- Verification orchestration
- Session state tracking

## Quick Start

```bash
# Open dashboard
npm run nexus dashboard
# or
npm run n d

# Show status
npm run nexus status
# or
npm run n s

# Run verification
npm run nexus verify
# or
npm run n v
```

## Available Commands

### Dashboard
- `nexus dashboard (d)` - Open development dashboard
- `nexus status (s)` - Show current development status

### Verification
- `nexus verify (v)` - Run verification checks

### Recovery
- `nexus recovery create` - Create recovery point
- `nexus recovery list` - List recovery points
- `nexus recovery restore` - Restore from recovery point

### Sync
- `nexus sync start` - Start sync service
- `nexus sync stop` - Stop sync service
- `nexus sync status` - Show sync status

### Help
- `nexus help (h)` - Show command reference

## Examples

```bash
# Create recovery point
npm run n r create

# List recovery points
npm run n r list

# Start sync service
npm run n sy start

# Show help
npm run n h
``` 