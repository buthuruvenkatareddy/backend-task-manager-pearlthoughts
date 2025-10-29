# Task Manager - Offline-First API

> **Backend Developer Internship Task - PearlThoughts**  
> Production-ready offline-first task management system with intelligent sync queue, conflict resolution, and modern UI.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-3178C6?style=flat&logo=typescript)
![Express](https://img.shields.io/badge/Express-v5.0-000000?style=flat&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-v5.1-003B57?style=flat&logo=sqlite)
![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passing-success?style=flat)

---

## Candidate Information

Name: Venkat Reddy Buthuru, 
E-mail: buthuruvenkatreddy@gmail.com,


---

## Project Overview

A production-ready offline-first task management API that enables users to create, update, and manage tasks even without internet connectivity. The system intelligently queues operations and synchronizes them when the connection is restored, with built-in conflict resolution using a last-write-wins strategy.

### Key Features

1. Offline-First Architecture - Full functionality without internet  
2. Intelligent Sync Queue - Automatic operation queuing and batch processing  
3. Conflict Resolution - Last-write-wins with timestamp comparison  
4. Soft Deletes - Data integrity with recoverable deletes  
5. Batch Sync - Efficient 50-item batch processing  
6. RESTful API - 8 well-structured endpoints  
7. Modern UI - Beautiful responsive frontend with real-time updates  
8. Type-Safe - Full TypeScript implementation  
9. Well-Tested - 17/17 tests passing (100% success rate)  

---

##  Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/backend-task-manager-pearlthoughts.git
cd backend-task-manager-pearlthoughts

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run development server
npm run dev
```


## Architecture

### System Design

```
┌─────────────────────────────────────────────────┐
│           Frontend (HTML/CSS/JS)                │
│  • Task creation, update, deletion              │
│  • Real-time sync status monitoring             │
│  • Toast notifications                          │
│  • Auto-refresh every 5 seconds                 │
└────────────────┬────────────────────────────────┘
                 │ HTTP REST API
┌────────────────▼────────────────────────────────┐
│         Express.js Server (TypeScript)          │
│  • RESTful routing                              │
│  • Request validation                           │
│  • Error handling middleware                    │
│  • CORS configuration                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              Service Layer                      │
│  ┌──────────────────┬──────────────────────┐   │
│  │  TaskService     │   SyncService        │   │
│  │  • CRUD ops      │   • Queue mgmt       │   │
│  │  • Validation    │   • Batch sync       │   │
│  │  • Sync queue    │   • Conflict res.    │   │
│  └──────────────────┴──────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            SQLite Database                      │
│  • tasks table (task data)                      │
│  • sync_queue table (pending operations)        │
└─────────────────────────────────────────────────┘
```

### Database Schema

#### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  server_id TEXT,
  last_synced_at DATETIME
);
```

#### Sync Queue Table
```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## How Offline-First Works

### 1. Offline Task Creation Flow
```
User creates task (offline)
    ↓
Save to local SQLite database
    ↓
Mark task as sync_status: 'pending'
    ↓
Add operation to sync_queue
    ↓
Task available immediately to user
```

### 2. Coming Online & Sync Flow
```
Internet connection detected
    ↓
Get all pending items from sync_queue
    ↓
Group into batches (50 items each)
    ↓
Send batches to server sequentially
    ↓
Server processes and returns results
    ↓
Update sync_status to 'synced'
    ↓
Remove from sync_queue
    ↓
Update UI with sync status
```

### 3. Conflict Resolution (Last-Write-Wins)
```
Local task vs Server task
    ↓
Compare updated_at timestamps
    ↓
If local.updated_at > server.updated_at
    → Use local version
Else
    → Use server version
    ↓
Apply winner's data
    ↓
Update local database
```

---

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Results
```
✓ TaskService: CRUD operations (8 tests)
  ✓ should create a new task with default values
  ✓ should add task to sync queue after creation
  ✓ should update an existing task
  ✓ should return null for non-existent task
  ✓ should soft delete a task
  ✓ should return false for non-existent task on delete
  ✓ should return only non-deleted tasks
  ✓ should return tasks with pending or error sync status

✓ SyncService: Queue and sync logic (6 tests)
  ✓ should add items to sync queue
  ✓ should process sync batches correctly
  ✓ should resolve conflicts using last-write-wins
  ✓ should update sync status after successful sync
  ✓ should handle sync errors with retry logic
  ✓ should move to dead letter queue after max retries

✓ Integration: End-to-end flows (3 tests)
  ✓ should handle complete offline-to-online flow
  ✓ should sync multiple operations in correct order
  ✓ should handle concurrent operations correctly

──────────────────────────────────────────────────
Test Files: 3 passed (3)
     Tests: 17 passed (17)
  Duration: 121ms
```

---

## Project Structure

```
backend-task-manager-pearlthoughts/
├── src/
│   ├── db/
│   │   └── database.ts              # Database connection & methods
│   ├── middleware/
│   │   └── errorHandler.ts          # Global error handler
│   ├── routes/
│   │   ├── tasks.ts                 # Task CRUD endpoints
│   │   └── sync.ts                  # Sync endpoints
│   ├── services/
│   │   ├── taskService.ts           # Task business logic
│   │   └── syncService.ts           # Sync & conflict resolution
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   └── challenge-constraints.ts # Business rules
│   └── server.ts                    # Express app entry point
├── tests/
│   ├── taskService.test.ts          # Task service tests
│   ├── syncService.test.ts          # Sync service tests
│   └── integration.test.ts          # E2E integration tests
├── public/
│   └── index.html                   # Frontend UI
├── data/
│   └── tasks.sqlite3                # SQLite database (gitignored)
├── docs/                            # Documentation files
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config
├── vitest.config.ts                 # Test config
└── README.md                        # This file
```


## Available Scripts

```bash
npm run dev         # Start development server with hot reload
npm run build       # Compile TypeScript to JavaScript
npm start           # Run production build
npm test            # Run test suite
npm run test:ui     # Run tests with visual UI
npm run lint        # Check code quality with ESLint
npm run format      # Format code with Prettier
npm run typecheck   # Validate TypeScript types
```


## License

This project was created as part of the Backend Developer Internship selection process for PearlThoughts. All rights reserved.

---

## Author

Venkat Reddy Buthuru  

Thank you for reviewing my submission!
