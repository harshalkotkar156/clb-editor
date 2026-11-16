import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const execAsync = promisify(exec);

// language config — docker image, filename, compile + run commands
const LANGUAGE_CONFIG = {
  python: {
    image: 'python:3.11-alpine',
    filename: 'main.py',
    compileCmd: null,
    runCmd: 'python main.py',
    memory: '128m'
  },
  javascript: {
    image: 'node:20-alpine',
    filename: 'main.js',
    compileCmd: null,
    runCmd: 'node main.js',
    memory: '128m'
  },
  c: {
    image: 'gcc:13',
    filename: 'main.c',
    compileCmd: 'gcc main.c -o main',
    runCmd: './main',
    memory: '256m'
  },
  cpp: {
    image: 'gcc:13',
    filename: 'main.cpp',
    compileCmd: 'g++ main.cpp -o main',
    runCmd: './main',
    memory: '512m'
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    filename: 'Main.java',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main',
    memory: '256m'
  }
};

const MAX_TIME = parseInt(process.env.MAX_EXECUTION_TIME || '10'); // seconds

export async function runCode({ language, code, stdin = '' }) {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  let filename = config.filename;
  let compileCmd = config.compileCmd;
  let runCmd = config.runCmd;

  // Support LeetCode Java classes (e.g. public class Solution / class Solution)
  if (language === 'java') {
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/) || code.match(/class\s+([A-Za-z0-9_]+)/);
    const className = classMatch ? classMatch[1] : 'Main';
    filename = `${className}.java`;
    compileCmd = `javac ${className}.java`;
    runCmd = `java ${className}`;
  }

  // create a unique temp directory for this job
  const jobDir = path.join(os.tmpdir(), `job-${uuidv4()}`);
  await fs.mkdir(jobDir, { recursive: true });

  const codeFile = path.join(jobDir, filename);
  const stdinFile = path.join(jobDir, 'input.txt');

  let startTime = Date.now();

  try {
    await fs.writeFile(codeFile, code, 'utf8');
    await fs.writeFile(stdinFile, stdin, 'utf8');

    startTime = Date.now();

    let dockerCmd;
    if (compileCmd) {
      dockerCmd = `docker run --rm \
        --network none \
        --cap-drop=ALL \
        --security-opt=no-new-privileges \
        --memory="${config.memory}" \
        --cpus="0.5" \
        --ulimit nproc=50 \
        -v "${jobDir}:/code" \
        --workdir /code \
        ${config.image} \
        sh -c "${compileCmd} && timeout ${MAX_TIME} ${runCmd} < input.txt"`;
    } else {
      dockerCmd = `docker run --rm \
        --network none \
        --cap-drop=ALL \
        --security-opt=no-new-privileges \
        --memory="${config.memory}" \
        --cpus="0.5" \
        --ulimit nproc=50 \
        -v "${jobDir}:/code" \
        --workdir /code \
        ${config.image} \
        sh -c "timeout ${MAX_TIME} ${runCmd} < input.txt"`;
    }

    const { stdout, stderr } = await execAsync(dockerCmd, {
      timeout: (MAX_TIME + 5) * 1000,
      maxBuffer: 1024 * 1024
    });

    const executionTime = Date.now() - startTime;

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: 0,
      executionTime
    };

  } catch (err) {
    const executionTime = Math.max(0, Date.now() - startTime);

    if (err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      return {
        stdout: err.stdout || '',
        stderr: 'Output Limit Exceeded — your program generated too much output.',
        exitCode: 1,
        executionTime
      };
    }

    const isTimeout = err.killed || err.signal === 'SIGTERM' || err.code === 124;
    if (isTimeout) {
      return {
        stdout: err.stdout || '',
        stderr: 'Time Limit Exceeded — your code ran longer than allowed.',
        exitCode: 124,
        executionTime: MAX_TIME * 1000
      };
    }

    const numericExitCode = typeof err.code === 'number' ? err.code : 1;

    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: numericExitCode,
      executionTime
    };

  } finally {
    await fs.rm(jobDir, { recursive: true, force: true }).catch(() => {});
  }
}