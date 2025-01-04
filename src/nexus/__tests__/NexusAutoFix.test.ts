import { NexusAutoFix } from '../core/NexusAutoFix';
import { AutoFixConfig } from '../types/autofix';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

jest.mock('fs/promises');
jest.mock('child_process');
jest.mock('openai');

describe('NexusAutoFix', () => {
  let autoFix: NexusAutoFix;
  const mockConfig: AutoFixConfig = {
    backupDir: '.test-backups',
    maxBackups: 3,
    structure: {
      'src/components': ['Button.tsx', 'Card.tsx'],
      'src/lib': ['utils.ts', 'api.ts']
    },
    ignorePaths: ['node_modules', '.git']
  };

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    autoFix = new NexusAutoFix(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  describe('initialization', () => {
    it('should throw error if OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new NexusAutoFix(mockConfig)).toThrow('OPENAI_API_KEY is required');
    });

    it('should initialize with default config if none provided', () => {
      const defaultAutoFix = new NexusAutoFix();
      expect(defaultAutoFix).toBeInstanceOf(NexusAutoFix);
    });
  });

  describe('createBackup', () => {
    it('should create backup directory and copy files', async () => {
      const mockMkdir = fs.mkdir as jest.Mock;
      const mockReaddir = fs.readdir as jest.Mock;

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([]);

      await autoFix['createBackup']();

      expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('should remove oldest backup when exceeding maxBackups', async () => {
      const mockMkdir = fs.mkdir as jest.Mock;
      const mockReaddir = fs.readdir as jest.Mock;
      const mockRm = fs.rm as jest.Mock;

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(['backup1', 'backup2', 'backup3', 'backup4']);
      mockRm.mockResolvedValue(undefined);

      await autoFix['createBackup']();

      expect(mockRm).toHaveBeenCalledWith(
        expect.stringContaining('backup1'),
        { recursive: true }
      );
    });
  });

  describe('fixFileStructure', () => {
    it('should create directories and move files to correct locations', async () => {
      const mockMkdir = fs.mkdir as jest.Mock;
      const mockRename = fs.rename as jest.Mock;

      mockMkdir.mockResolvedValue(undefined);
      mockRename.mockResolvedValue(undefined);

      const result = await autoFix['fixFileStructure']();

      expect(result.fixed).toBe(true);
      expect(mockMkdir).toHaveBeenCalledTimes(Object.keys(mockConfig.structure).length);
    });

    it('should handle errors during file structure fix', async () => {
      const mockMkdir = fs.mkdir as jest.Mock;
      mockMkdir.mockRejectedValue(new Error('Failed to create directory'));

      const result = await autoFix['fixFileStructure']();

      expect(result.fixed).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('fixDependencies', () => {
    it('should remove duplicate dependencies and update outdated ones', async () => {
      const mockReadFile = fs.readFile as jest.Mock;
      mockReadFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'react': '^17.0.0',
          'lodash': '^4.17.0'
        },
        devDependencies: {
          'react': '^17.0.0',
          '@types/react': '^17.0.0'
        }
      }));

      const result = await autoFix['fixDependencies']();

      expect(result.fixed).toBe(true);
      expect(result.changes).toContain('Removed duplicate dependency: react');
    });
  });

  describe('fixImports', () => {
    it('should fix import paths and handle missing imports', async () => {
      const mockContent = `
        import { something } from '../src/components';
        import { other } from 'src/lib';
      `;
      const mockReadFile = fs.readFile as jest.Mock;
      mockReadFile.mockResolvedValue(mockContent);

      const result = await autoFix['fixImports']();

      expect(result.fixed).toBe(true);
    });
  });

  describe('fixTypeScriptErrors', () => {
    it('should fix TypeScript errors using AI suggestions', async () => {
      const mockTscOutput = 'file.ts(10,5): error TS2322: Type string is not assignable to type number.';
      const mockExecuteCommand = jest.spyOn(autoFix as any, 'executeCommand');
      mockExecuteCommand.mockResolvedValue(mockTscOutput);

      const result = await autoFix['fixTypeScriptErrors']();

      expect(result.fixed).toBe(true);
    });
  });

  describe('verifyFixes', () => {
    it('should verify all fixes were applied correctly', async () => {
      const mockExecuteCommand = jest.spyOn(autoFix as any, 'executeCommand');
      mockExecuteCommand.mockResolvedValue('');

      await expect(autoFix['verifyFixes']()).resolves.not.toThrow();
    });

    it('should throw error if verification fails', async () => {
      const mockExecuteCommand = jest.spyOn(autoFix as any, 'executeCommand');
      mockExecuteCommand.mockResolvedValue('error: something went wrong');

      await expect(autoFix['verifyFixes']()).rejects.toThrow('Verification failed after fixes');
    });
  });
}); 