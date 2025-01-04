import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import _ from 'lodash';

interface ProjectContext {
    name: string;
    description: string;
    type: string;
    framework: string;
    mainFeatures: string[];
    currentPhase: string;
    techStack: {
        frontend: string[];
        backend: string[];
        database: string[];
        deployment: string[];
    };
}

interface DevelopmentMemory {
    projectContext: ProjectContext;
    features: {
        name: string;
        status: 'planned' | 'in-progress' | 'completed';
        description: string;
        dependencies: string[];
        implementation: {
            files: string[];
            components: string[];
            apis: string[];
        };
    }[];
    codebase: {
        directories: {
            path: string;
            purpose: string;
            criticalFiles: string[];
        }[];
        patterns: {
            name: string;
            description: string;
            example: string;
        }[];
    };
    decisions: {
        timestamp: string;
        context: string;
        decision: string;
        rationale: string;
    }[];
}

export class NexusCoordinator {
    private openai: OpenAI;
    private memory: DevelopmentMemory;
    private readonly MEMORY_FILE = '.nexus/development-memory.json';
    private readonly CONTEXT_FILE = '.nexus/project-context.json';

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Initialize memory and context
        this.initializeSystem();
    }

    private async initializeSystem() {
        try {
            // Load or create development memory
            this.memory = await this.loadMemory();
            console.log(chalk.green('Development memory loaded'));
        } catch (error) {
            console.error(chalk.red('Failed to initialize system:', error));
            process.exit(1);
        }
    }

    async initializeProject(input: string): Promise<void> {
        console.log(chalk.blue('\n🚀 Initializing Project Understanding...'));

        try {
            // Analyze project input with AI
            const projectContext = await this.analyzeProjectInput(input);
            
            // Update memory with new project context
            this.memory.projectContext = projectContext;
            
            // Analyze existing codebase if any
            if (existsSync('package.json')) {
                await this.analyzeExistingCodebase();
            }

            // Save updated memory
            await this.saveMemory();

            console.log(chalk.green('\n✨ Project initialized successfully!'));
            this.displayProjectSummary();
        } catch (error) {
            console.error(chalk.red('Failed to initialize project:', error));
            throw error;
        }
    }

    private async analyzeProjectInput(input: string): Promise<ProjectContext> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a project architect AI. Analyze the project description and extract key technical details.
                        Format the response as a JSON object matching the ProjectContext interface.`
                },
                {
                    role: 'user',
                    content: `Analyze this project description and create a detailed technical specification: ${input}`
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0]?.message?.content || '{}');
    }

    private async analyzeExistingCodebase(): Promise<void> {
        console.log(chalk.blue('\n📊 Analyzing existing codebase...'));

        try {
            // Analyze directory structure
            const directories = await this.analyzeDirectories();
            
            // Analyze code patterns
            const patterns = await this.analyzeCodePatterns();
            
            // Update memory
            this.memory.codebase = {
                directories,
                patterns
            };
        } catch (error) {
            console.error(chalk.red('Error analyzing codebase:', error));
            throw error;
        }
    }

    async processInstruction(instruction: string): Promise<void> {
        console.log(chalk.blue('\n🧠 Processing instruction...'));

        try {
            // Analyze instruction with context
            const analysis = await this.analyzeInstruction(instruction);
            
            // Plan actions
            const actions = await this.planActions(analysis);
            
            // Execute actions
            await this.executeActions(actions);
            
            // Update memory
            await this.recordDecision(instruction, analysis);
            
            // Save memory
            await this.saveMemory();

            console.log(chalk.green('\n✅ Instruction processed successfully!'));
        } catch (error) {
            console.error(chalk.red('Error processing instruction:', error));
            throw error;
        }
    }

    private async analyzeInstruction(instruction: string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical lead AI. Analyze the instruction in the context of the current project state.'
                },
                {
                    role: 'user',
                    content: `Project Context: ${JSON.stringify(this.memory.projectContext)}
                             Current Features: ${JSON.stringify(this.memory.features)}
                             Instruction: ${instruction}
                             Provide a detailed analysis and implementation plan.`
                }
            ],
            temperature: 0.3
        });

        return response.choices[0]?.message?.content || '';
    }

    private async planActions(analysis: string): Promise<string[]> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Create a specific, ordered list of development actions based on the analysis.'
                },
                {
                    role: 'user',
                    content: `Analysis: ${analysis}
                             Project State: ${JSON.stringify(this.memory.projectContext)}
                             Create a detailed action plan.`
                }
            ],
            temperature: 0.3
        });

        return JSON.parse(response.choices[0]?.message?.content || '[]');
    }

    async getProjectStatus(): Promise<void> {
        console.log(chalk.blue('\n📊 Project Status Summary'));
        console.log('\nProject Context:');
        console.log(chalk.cyan(JSON.stringify(this.memory.projectContext, null, 2)));
        
        console.log('\nFeatures Status:');
        this.memory.features.forEach(feature => {
            const statusColor = {
                planned: chalk.yellow,
                'in-progress': chalk.blue,
                completed: chalk.green
            }[feature.status];
            
            console.log(statusColor(`${feature.name}: ${feature.status}`));
        });

        console.log('\nRecent Decisions:');
        this.memory.decisions.slice(-5).forEach(decision => {
            console.log(chalk.cyan(`- ${decision.decision} (${decision.timestamp})`));
        });
    }

    private async recordDecision(context: string, decision: string): Promise<void> {
        this.memory.decisions.push({
            timestamp: new Date().toISOString(),
            context,
            decision,
            rationale: decision
        });
    }

    private displayProjectSummary(): void {
        console.log(chalk.blue('\n📋 Project Summary'));
        console.log(chalk.cyan('\nProject Name:', this.memory.projectContext.name));
        console.log(chalk.cyan('Description:', this.memory.projectContext.description));
        console.log(chalk.cyan('Framework:', this.memory.projectContext.framework));
        console.log(chalk.cyan('\nMain Features:'));
        this.memory.projectContext.mainFeatures.forEach(feature => {
            console.log(chalk.yellow(`- ${feature}`));
        });
        console.log(chalk.cyan('\nTech Stack:'));
        Object.entries(this.memory.projectContext.techStack).forEach(([category, technologies]) => {
            console.log(chalk.yellow(`${category}:`));
            technologies.forEach(tech => console.log(`  - ${tech}`));
        });
    }

    // Helper methods
    private async loadMemory(): Promise<DevelopmentMemory> {
        if (existsSync(this.MEMORY_FILE)) {
            return JSON.parse(await fs.readFile(this.MEMORY_FILE, 'utf8'));
        }

        // Return default memory structure
        return {
            projectContext: {
                name: '',
                description: '',
                type: '',
                framework: '',
                mainFeatures: [],
                currentPhase: 'initialization',
                techStack: {
                    frontend: [],
                    backend: [],
                    database: [],
                    deployment: []
                }
            },
            features: [],
            codebase: {
                directories: [],
                patterns: []
            },
            decisions: []
        };
    }

    private async saveMemory(): Promise<void> {
        await fs.mkdir(path.dirname(this.MEMORY_FILE), { recursive: true });
        await fs.writeFile(this.MEMORY_FILE, JSON.stringify(this.memory, null, 2));
    }

    private async analyzeDirectories(): Promise<{ path: string; purpose: string; criticalFiles: string[]; }[]> {
        // Add directory analysis logic
        return [];
    }

    private async analyzeCodePatterns(): Promise<{ name: string; description: string; example: string; }[]> {
        // Add code pattern analysis logic
        return [];
    }

    private async executeActions(actions: string[]): Promise<void> {
        for (const action of actions) {
            console.log(chalk.yellow(`Executing: ${action}`));
            // Add action execution logic
        }
    }
} 