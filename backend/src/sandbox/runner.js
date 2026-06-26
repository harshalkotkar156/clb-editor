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
    compileCmd: null,                         // interpreted, no compile
    runCmd: 'python main.py'
  },
  javascript: {
    image: 'node:20-alpine',
    filename: 'main.js',
    compileCmd: null,
    runCmd: 'node main.js'
  },
  c: {
    image: 'gcc:13',
    filename: 'main.c',
    compileCmd: 'gcc main.c -o main',
    runCmd: './main'
  },
  cpp: {
    image: 'gcc:13',
    filename: 'main.cpp',
    compileCmd: 'g++ main.cpp -o main',
    runCmd: './main'
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    filename: 'Main.java',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main'
  }
};

const MAX_TIME = parseInt(process.env.MAX_EXECUTION_TIME || '10'); // seconds

export async function runCode({ language, code, stdin = '' }) {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // create a unique temp directory for this job
   const jobDir = path.join(os.tmpdir(), `job-${uuidv4()}`);
  await fs.mkdir(jobDir, { recursive: true });

  const codeFile = path.join(jobDir, config.filename);
  const stdinFile = path.join(jobDir, 'input.txt');

  try {
    // write code and input to disk
    await fs.writeFile(codeFile, code, 'utf8');
    await fs.writeFile(stdinFile, stdin, 'utf8');

    const startTime = Date.now();

    // build the docker command
    // --rm           → delete container after done
    // --network none → no internet access
    // --memory       → max 128MB RAM
    // --cpus          → max 0.5 CPU
    // -v             → mount job folder into container
    // --workdir      → set working directory inside container
    // timeout        → kill process after MAX_TIME seconds

    let dockerCmd;

    if (config.compileCmd) {
      // compiled language: compile first, then run
      // two commands chained — if compile fails, run won't happen
      dockerCmd = `docker run --rm \
        --network none \
        --memory="128m" \
        --cpus="0.5" \
        --ulimit nproc=50 \
        -v "${jobDir}:/code" \
        --workdir /code \
        ${config.image} \
        sh -c "${config.compileCmd} && timeout ${MAX_TIME} ${config.runCmd} < input.txt"`;
    } else {
      // interpreted language: run directly
      dockerCmd = `docker run --rm \
        --network none \
        --memory="128m" \
        --cpus="0.5" \
        --ulimit nproc=50 \
        -v "${jobDir}:/code" \
        --workdir /code \
        ${config.image} \
        sh -c "timeout ${MAX_TIME} ${config.runCmd} < input.txt"`;
    }

    const { stdout, stderr } = await execAsync(dockerCmd, {
      timeout: (MAX_TIME + 5) * 1000, // node-level timeout (slightly longer than docker's)
      maxBuffer: 1024 * 1024           // max 1MB output
    });

    const executionTime = Date.now() - startTime;

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: 0,
      executionTime
    };

  } catch (err) {
    // exec throws when exit code is non-zero
    const executionTime = Date.now() - (err.startTime || Date.now());

    // check if it was a timeout
    if (err.killed || err.signal === 'SIGTERM') {
      return {
        stdout: err.stdout || '',
        stderr: 'Time Limit Exceeded — your code ran longer than allowed.',
        exitCode: 124,
        executionTime: MAX_TIME * 1000
      };
    }

    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.code || 1,
      executionTime
    };

  } finally {
    // always clean up temp files
    await fs.rm(jobDir, { recursive: true, force: true });
  }
}