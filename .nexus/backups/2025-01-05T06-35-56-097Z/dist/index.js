var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
var IntelligentFix = /** @class */ (function () {
    function IntelligentFix() {
        this.MAX_FIX_ATTEMPTS = 3;
        this.BACKUP_DIR = '.nexus/backups';
        this.currentBackup = null;
        var apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is required');
        }
        // Validate API key format
        if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
            throw new Error('Invalid OPENAI_API_KEY format');
        }
        this.openai = new OpenAI({
            apiKey: apiKey,
            maxRetries: 3,
            timeout: 30000, // 30 second timeout
        });
    }
    IntelligentFix.prototype.getAIFix = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, userPrompt, response, error_1;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 5]);
                        systemPrompt = "You are an expert TypeScript/React developer. ";
                        systemPrompt += "Fix the code issue while maintaining existing functionality. ";
                        systemPrompt += "Return ONLY the complete fixed code without any explanation.";
                        userPrompt = "Fix this ".concat(issue.type, " issue: ").concat(issue.message, "\n\n");
                        userPrompt += "Current code:\n".concat(issue.code, "\n\n");
                        userPrompt += "Context: This is fix attempt ".concat(issue.attempt);
                        if (issue.context) {
                            userPrompt += "\nAdditional context: ".concat(issue.context);
                        }
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: 'gpt-4',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userPrompt }
                                ],
                                temperature: 0.2, // Low temperature for more consistent fixes
                                max_tokens: 2000
                            })];
                    case 1:
                        response = _g.sent();
                        if (!((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content)) {
                            throw new Error('No completion received from OpenAI');
                        }
                        return [2 /*return*/, response.choices[0].message.content];
                    case 2:
                        error_1 = _g.sent();
                        if (!(((_d = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _d === void 0 ? void 0 : _d.status) === 429)) return [3 /*break*/, 4];
                        console.error(chalk.red('OpenAI rate limit exceeded. Waiting before retry...'));
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 20000); })];
                    case 3:
                        _g.sent(); // Wait 20 seconds
                        return [2 /*return*/, this.getAIFix(issue)]; // Retry once
                    case 4:
                        if (((_e = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _e === void 0 ? void 0 : _e.status) === 400 && error_1.message.includes('token')) {
                            console.error(chalk.red('Token limit exceeded. Truncating input...'));
                            // Truncate the code to the last 1000 characters if it's too long
                            return [2 /*return*/, this.getAIFix(__assign(__assign({}, issue), { code: ((_f = issue.code) === null || _f === void 0 ? void 0 : _f.slice(-1000)) || '' }))];
                        }
                        console.error(chalk.red('Failed to get AI fix:'), error_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    IntelligentFix.prototype.runIntelligentFix = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, allFixed, issues, _i, issues_1, issue, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(chalk.blue('\n🧠 Starting Intelligent Fix Process...\n'));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 13, , 15]);
                        // Create initial backup
                        return [4 /*yield*/, this.createBackup()];
                    case 2:
                        // Create initial backup
                        _a.sent();
                        attempts = 0;
                        allFixed = false;
                        _a.label = 3;
                    case 3:
                        if (!(!allFixed && attempts < this.MAX_FIX_ATTEMPTS)) return [3 /*break*/, 10];
                        attempts++;
                        console.log(chalk.yellow("\nAttempt ".concat(attempts, " of ").concat(this.MAX_FIX_ATTEMPTS)));
                        return [4 /*yield*/, this.runVerification()];
                    case 4:
                        issues = _a.sent();
                        if (issues.length === 0) {
                            console.log(chalk.green('\n✅ All verifications passed!'));
                            allFixed = true;
                            return [3 /*break*/, 10];
                        }
                        _i = 0, issues_1 = issues;
                        _a.label = 5;
                    case 5:
                        if (!(_i < issues_1.length)) return [3 /*break*/, 8];
                        issue = issues_1[_i];
                        return [4 /*yield*/, this.fixIssue(issue, attempts)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: 
                    // Clean up after fixes
                    return [4 /*yield*/, this.cleanupFixes()];
                    case 9:
                        // Clean up after fixes
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 10:
                        if (!!allFixed) return [3 /*break*/, 12];
                        console.log(chalk.red('\n❌ Could not fix all issues after maximum attempts'));
                        return [4 /*yield*/, this.restoreBackup()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 12: return [2 /*return*/, true];
                    case 13:
                        error_2 = _a.sent();
                        console.error(chalk.red('\n❌ Intelligent fix failed:'), error_2);
                        return [4 /*yield*/, this.restoreBackup()];
                    case 14:
                        _a.sent();
                        throw error_2;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    IntelligentFix.prototype.runVerification = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, verificationTypes, _i, verificationTypes_1, verifyType, errorOutput, parsedIssues;
            return __generator(this, function (_a) {
                console.log(chalk.blue('\n🔍 Running verification...\n'));
                issues = [];
                try {
                    verificationTypes = [
                        'verify:components',
                        'verify:imports',
                        'verify:types',
                        'verify:structure',
                        'verify:features'
                    ];
                    for (_i = 0, verificationTypes_1 = verificationTypes; _i < verificationTypes_1.length; _i++) {
                        verifyType = verificationTypes_1[_i];
                        try {
                            execSync("npm run ".concat(verifyType), { stdio: 'pipe' });
                        }
                        catch (error) {
                            errorOutput = error.toString();
                            parsedIssues = this.parseVerificationOutput(verifyType, errorOutput);
                            issues.push.apply(issues, parsedIssues);
                        }
                    }
                    if (issues.length > 0) {
                        console.log(chalk.yellow("\nFound ".concat(issues.length, " issues to fix")));
                        issues.forEach(function (issue) {
                            console.log(chalk.yellow("- ".concat(issue.type, " issue in ").concat(issue.file, ": ").concat(issue.message)));
                        });
                    }
                    else {
                        console.log(chalk.green('\n✅ No issues found'));
                    }
                    return [2 /*return*/, issues];
                }
                catch (error) {
                    console.error(chalk.red('Verification failed:'), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    IntelligentFix.prototype.fixIssue = function (issue, attempt) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, currentContent, fixedCode, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(chalk.blue("\n\uD83D\uDD27 Fixing ".concat(issue.type, " issue in ").concat(issue.file, "...\n")));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        filePath = path.join(process.cwd(), issue.file);
                        return [4 /*yield*/, fs.readFile(filePath, 'utf8')];
                    case 2:
                        currentContent = _a.sent();
                        return [4 /*yield*/, this.getAIFix(__assign(__assign({}, issue), { code: currentContent, attempt: attempt }))];
                    case 3:
                        fixedCode = _a.sent();
                        if (!fixedCode) return [3 /*break*/, 9];
                        // Backup original file
                        return [4 /*yield*/, fs.writeFile("".concat(filePath, ".bak"), currentContent)];
                    case 4:
                        // Backup original file
                        _a.sent();
                        // Apply fix
                        return [4 /*yield*/, fs.writeFile(filePath, fixedCode)];
                    case 5:
                        // Apply fix
                        _a.sent();
                        console.log(chalk.green("\u2705 Applied fix to ".concat(issue.file)));
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 7, , 9]);
                        execSync('npm run verify:all', { stdio: 'pipe' });
                        return [3 /*break*/, 9];
                    case 7:
                        error_3 = _a.sent();
                        console.log(chalk.red('\n❌ Fix introduced new issues, rolling back...'));
                        return [4 /*yield*/, fs.copyFile("".concat(filePath, ".bak"), filePath)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_4 = _a.sent();
                        console.error(chalk.red("Failed to fix ".concat(issue.file, ":")), error_4);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    IntelligentFix.prototype.parseVerificationOutput = function (verifyType, output) {
        var _a;
        var issues = [];
        var type = verifyType.replace('verify:', '');
        // Parse different verification outputs
        var lines = output.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.includes('❌') || line.includes('⚠️')) {
                var match = line.match(/in (.*?):/);
                if (match) {
                    issues.push({
                        type: type,
                        file: match[1],
                        message: ((_a = line.split(':').pop()) === null || _a === void 0 ? void 0 : _a.trim()) || 'Unknown issue'
                    });
                }
            }
        }
        return issues;
    };
    IntelligentFix.prototype.createBackup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, backupDir, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(chalk.blue('\n💾 Creating backup...'));
                        timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        backupDir = path.join(this.BACKUP_DIR, timestamp);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.mkdir(backupDir, { recursive: true })];
                    case 2:
                        _a.sent();
                        // Copy all project files except node_modules and .git
                        execSync("rsync -av --exclude 'node_modules' --exclude '.git' . ".concat(backupDir, "/"));
                        this.currentBackup = backupDir;
                        console.log(chalk.green('✅ Backup created successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error(chalk.red('Failed to create backup:'), error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IntelligentFix.prototype.restoreBackup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.currentBackup) {
                    console.log(chalk.yellow('No backup to restore'));
                    return [2 /*return*/];
                }
                console.log(chalk.blue('\n⏮️ Restoring from backup...'));
                try {
                    // Restore all files from backup
                    execSync("rsync -av --exclude 'node_modules' --exclude '.git' ".concat(this.currentBackup, "/ ."));
                    console.log(chalk.green('✅ Backup restored successfully'));
                }
                catch (error) {
                    console.error(chalk.red('Failed to restore backup:'), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    IntelligentFix.prototype.cleanupFixes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, files_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readdir(process.cwd())];
                    case 1:
                        files = _a.sent();
                        _i = 0, files_1 = files;
                        _a.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        if (!file.endsWith('.bak')) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.unlink(path.join(process.cwd(), file))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return IntelligentFix;
}());
export { IntelligentFix };
