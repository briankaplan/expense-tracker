import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Shield, ShieldAlert, ShieldCheck, FolderLock, GitBranch, FileText } from 'lucide-react';

interface GuardStatus {
    folderStructure: boolean;
    checksums: boolean;
    backups: boolean;
    gitBackup: boolean;
    protectedFiles: boolean;
    writeProtection: boolean;
}

interface GuardLog {
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
}

const PROTECTED_FILES = ['.env', '.nexus_guard.ts', 'config/teller.ts'];
const ALLOWED_DIRS = ['./src', './app', './config', './scripts', './components'];

export function NexusGuardDashboard() {
    const [guardStatus, setGuardStatus] = useState<GuardStatus>({
        folderStructure: true,
        checksums: true,
        backups: true,
        gitBackup: true,
        protectedFiles: true,
        writeProtection: true
    });
    const [logs, setLogs] = useState<GuardLog[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Simulated guard status updates
        const interval = setInterval(() => {
            updateGuardStatus();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const updateGuardStatus = () => {
        // In a real implementation, this would fetch status from the Nexus Guard system
        const newStatus = {
            folderStructure: Math.random() > 0.1,
            checksums: Math.random() > 0.1,
            backups: Math.random() > 0.1,
            gitBackup: Math.random() > 0.1,
            protectedFiles: Math.random() > 0.1,
            writeProtection: Math.random() > 0.1
        };

        setGuardStatus(newStatus);
        addLog({
            timestamp: new Date().toISOString(),
            type: Object.values(newStatus).every(Boolean) ? 'success' : 'warning',
            message: 'Guard status updated'
        });
    };

    const addLog = (log: GuardLog) => {
        setLogs(prev => [log, ...prev].slice(0, 100));
    };

    const toggleGuard = () => {
        setIsActive(!isActive);
        addLog({
            timestamp: new Date().toISOString(),
            type: !isActive ? 'success' : 'warning',
            message: `Guard system ${!isActive ? 'activated' : 'deactivated'}`
        });
    };

    const runBackup = () => {
        addLog({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: 'Manual backup initiated'
        });
        // Implement backup logic here
    };

    const verifySystem = () => {
        addLog({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: 'System verification started'
        });
        updateGuardStatus();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Shield className={isActive ? "text-green-500" : "text-red-500"} size={24} />
                    <h2 className="text-xl font-bold">Nexus Guard System</h2>
                </div>
                <div className="space-x-4">
                    <Button
                        variant={isActive ? "destructive" : "default"}
                        onClick={toggleGuard}
                    >
                        {isActive ? '🛑 Deactivate Guard' : '🛡️ Activate Guard'}
                    </Button>
                    <Button variant="outline" onClick={verifySystem}>
                        🔍 Verify System
                    </Button>
                    <Button variant="outline" onClick={runBackup}>
                        💾 Run Backup
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <FolderLock className="text-blue-500" />
                        <h3 className="font-semibold">Protected Resources</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>Folder Structure</span>
                            <Badge variant={guardStatus.folderStructure ? "success" : "destructive"}>
                                {guardStatus.folderStructure ? "Valid" : "Invalid"}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>File Checksums</span>
                            <Badge variant={guardStatus.checksums ? "success" : "destructive"}>
                                {guardStatus.checksums ? "Valid" : "Invalid"}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Protected Files</span>
                            <Badge variant={guardStatus.protectedFiles ? "success" : "destructive"}>
                                {guardStatus.protectedFiles ? "Secure" : "At Risk"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <ShieldCheck className="text-green-500" />
                        <h3 className="font-semibold">Security Status</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>Write Protection</span>
                            <Badge variant={guardStatus.writeProtection ? "success" : "destructive"}>
                                {guardStatus.writeProtection ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Backups</span>
                            <Badge variant={guardStatus.backups ? "success" : "destructive"}>
                                {guardStatus.backups ? "Current" : "Outdated"}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Git Backup</span>
                            <Badge variant={guardStatus.gitBackup ? "success" : "destructive"}>
                                {guardStatus.gitBackup ? "Synced" : "Pending"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <ShieldAlert className="text-yellow-500" />
                        <h3 className="font-semibold">Protection Stats</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>Protected Files</span>
                            <span className="font-mono">{PROTECTED_FILES.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Allowed Directories</span>
                            <span className="font-mono">{ALLOWED_DIRS.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Backup Retention</span>
                            <span className="font-mono">5 versions</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <FileText className="text-gray-500" />
                        <h3 className="font-semibold">Guard Activity Log</h3>
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-4 space-y-2">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg ${
                                    log.type === 'error'
                                        ? 'bg-red-50 text-red-700'
                                        : log.type === 'warning'
                                        ? 'bg-yellow-50 text-yellow-700'
                                        : log.type === 'success'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-blue-50 text-blue-700'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <span className="font-mono text-sm">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="text-sm">{log.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
} 