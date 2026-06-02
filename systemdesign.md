**Project System Design: clb-editor**

Overview
--------
This document describes the high-level and low-level design of the clb-editor project (backend + frontend) focusing on the code-execution pipeline: how user-submitted code flows from the client, through the API, into a job queue (BullMQ/Redis), is executed by sandboxed Docker containers by workers, and how results are persisted and returned to the user.

**Goals**
- Explain main components and their responsibilities
- Describe the code-execution flow end-to-end
- Provide low-level details for the queue, worker, sandbox runner, and data models
- Call out operational/security considerations and suggested improvements

**Repository (relevant parts)**
- Backend: `backend/src/` — API, queue, workers, runner, models
- Frontend: `frontend/src/` — UI components and API clients

**High-Level Architecture (HLD)**

Components
- Frontend (UI): sends code execution requests to backend API, polls for results or listens to events.
- API Server (Express): authenticates users, validates input, persists an Execution record in MongoDB and enqueues a job on BullMQ.
- Redis: BullMQ backend and connection broker.
- BullMQ queue: `code-execution` queue is used to accept code-run jobs.
- Worker(s): Node.js process(es) that consume jobs from BullMQ, update Execution status, call the sandbox runner, and store results.
- Sandbox Runner: isolates and executes submitted code in Docker containers with resource limits and timeouts.
- MongoDB: stores `Execution` documents representing job lifecycle and results.

Deployment Topology (typical)
- API server(s) behind a load balancer.
- Redis (single or cluster) for queues and pub/sub.
- MongoDB (replica set) for persistence.
- One or more worker instances (can horizontally scale) connected to the same Redis and MongoDB.
- Docker engine available to worker hosts (or use container-in-container approach / remote execution service).

Sequence (End-to-end flow)
1. User submits code via frontend (POST /api/execute).
2. API authenticates request (auth middleware) and validates payload (language, code length).
3. API creates an `Execution` document in MongoDB with `status: queued` and a generated `jobId`.
4. API enqueues a job into BullMQ (`codeQueue.add('run-code', { jobId, language, code, stdin })`).
5. A worker process (BullMQ Worker) picks up the job from `code-execution`.
6. Worker updates the Execution document to `status: running`.
7. Worker calls the sandbox `runCode({ language, code, stdin })`.
   - Runner writes files to a temp dir, mounts it into a Docker container, applies resource limits and network restrictions, runs compile/run commands, captures stdout/stderr and exit code.
8. Runner returns result object { stdout, stderr, exitCode, executionTime }.
9. Worker updates the Execution document with outputs, `status: completed|failed`, `exitCode`, and `executionTime`.
10. Frontend polls `GET /api/status/:jobId` (or queries `/api/history`) to retrieve results.

Key Files (backend)
- Queue config: `backend/src/queues/codeQueue.js` — creates `Queue('code-execution', { connection: redis })`.
- Worker: `backend/src/workers/codeWorker.js` — `Worker('code-execution', handler, { connection: redis, concurrency: 5 })`.
- Runner: `backend/src/sandbox/runner.js` — builds `docker run` commands (images, resource limits, timeout), executes via `child_process.exec`.
- Controller & routes: `backend/src/controller/execute.js` and `backend/src/routes/execute.js` (endpoints: `POST /api/execute`, `GET /api/status/:jobId`, `GET /api/history`).
- Redis config: `backend/src/config/redis.js` — ioredis connection used by BullMQ.
- Execution model: `backend/src/models/Execution.js` — Mongoose schema with fields: jobId, user, language, code, stdin, status, stdout, stderr, exitCode, executionTime, createdAt, completedAt.

Low-Level Design (LLD)

1) API behavior (`executeCode` controller)
- Validates `language`, `code`, `stdin`, and enforces `MAX_CODE_LENGTH`.
- Generates `jobId` (UUID) and creates an `Execution` document (initial `status: queued`).
- Adds job to BullMQ `code-execution` queue with payload `{ jobId, language, code, stdin }`.
- Returns HTTP 202 with `jobId` and message to poll status.

2) BullMQ queue configuration
- Queue name: `code-execution`.
- Connection: shared IORedis client.
- Default job options: `attempts: 1` (no retry), `removeOnComplete`/`removeOnFail` with age=3600.
- Worker options: `concurrency: 5` in `codeWorker.js` — allows simultaneous processing of up to 5 jobs per worker process.

3) Worker responsibilities
- Initialize DB connection (worker starts with `connectDB()`), attach to the queue.
- For each job:
  - Update Execution doc to `running`.
  - Call `runCode()` in `sandbox/runner.js`.
  - On success/failure update Execution with outputs and status.
  - Emit logs to stdout and use BullMQ events for worker-level telemetry (completed/failed/error).

4) Sandbox Runner (`runCode`)
- Language configuration maps language → docker image, file name, compile/run commands.
- Creates a secure temp directory for each job (os.tmpdir + UUID), writes code and `input.txt`.
- Builds a `docker run` command with options:
  - `--rm` to auto-remove container
  - `--network none` to disable networking
  - `--memory="128m"` and `--cpus="0.5"` to limit resources
  - `--ulimit nproc=50` to limit processes
  - `-v "${jobDir}:/code"` to mount code into container
  - `--workdir /code` inside container
  - Uses `timeout ${MAX_TIME}` inside the container and a node-level timeout as a safeguard
- For compiled languages it runs compile then run in a chained shell command. For interpreted, runs directly.
- Captures `stdout`, `stderr`. Handles timeouts and maps signals to a TLE exitCode (124). Cleans up job directory.

5) Data model (Execution)
- `jobId: String` (unique)
- `user: ObjectId` reference
- `language, code, stdin` — inputs
- `status` — enum: queued, running, completed, failed
- `stdout, stderr, exitCode, executionTime, createdAt, completedAt`

6) Authentication and access
- Endpoints are protected via `authMiddleware` — only authenticated users can submit and query jobs.

Operational & Security Considerations
- Sandbox isolation: Docker with `--network none` and strict cgroups limits is used. This is suitable for many cases but still relies on Docker daemon security; consider stronger isolation (gVisor, Firecracker, separate sandbox machines) for untrusted code at scale.
- Resource exhaustion: Limit `concurrency` per worker, set reasonable memory and CPU quotas, and use overall orchestration (Kubernetes pod resource limits).
- Timeouts: MAX_EXECUTION_TIME env var (default 10s) enforced both inside container and via node exec timeout.
- File cleanup: runner removes job temp directories in finally block to avoid disk buildup.
- Rate limiting and quotas: Add user-based rate limiting to prevent abuse (API + per-user job caps).
- Input size limits: controller enforces `MAX_CODE_LENGTH`.
- Logging & Monitoring: Collect worker metrics (jobs/sec, failures), container runtime logs, Redis health, and MongoDB metrics. Use an APM (Prometheus + Grafana) and centralized logs.
- Secrets: Keep Docker image lists and other secrets out of source — use env vars and secret management.

Scaling & Reliability
- Horizontal scaling: increase worker instances (each connects to the same Redis queue). Concurrency per worker allows tuning.
- Redis: use a HA Redis (sentinel or cluster) for production.
- Persistence: MongoDB replica set with backups.
- Worker restarts: BullMQ will re-queue jobs if a worker dies mid-job only if job wasn't removed/completed; since default attempts=1, design decision prevents auto-retry of user code — but if worker crashes during run you may want to re-enqueue.

Improvements & Future Work
- Push notifications: implement WebSocket or Server-Sent Events (SSE) to push results instead of polling `GET /api/status/:jobId`.
- Job progress/streaming: stream stdout while job runs for better UX (requires streaming from worker to client via Redis pub/sub or socket broker).
- Secure remote executor: move execution to dedicated sandbox cluster (FaaS-like) to decouple from worker host Docker daemon.
- Granular retry and failure analysis: allow controlled job retry for transient worker errors.
- Quota & billing: per-user quotas, prioritization (premium queues), and rate-limiting.

Notes & Environment
- Key env vars: `REDIS_HOST`, `REDIS_PORT`, `MAX_EXECUTION_TIME`.
- Docker images used by runner: e.g. `python:3.11-alpine`, `node:20-alpine`, `gcc:13`, `eclipse-temurin:21-jdk-alpine`.

References
- Queue definition: `backend/src/queues/codeQueue.js`
- Worker implementation: `backend/src/workers/codeWorker.js`
- Sandbox runner: `backend/src/sandbox/runner.js`
- Controller/routes: `backend/src/controller/execute.js`, `backend/src/routes/execute.js`
- Redis config: `backend/src/config/redis.js`
- Execution model: `backend/src/models/Execution.js`

Appendix: Example Job Payload
{
  "jobId": "uuid-v4",
  "language": "python",
  "code": "print('hello')",
  "stdin": ""
}

Appendix: Example `docker run` pattern (from runner)
docker run --rm --network none --memory="128m" --cpus="0.5" --ulimit nproc=50 -v "<jobDir>:/code" --workdir /code <image> sh -c "timeout <MAX> <runCmd> < input.txt"

-- end of document
