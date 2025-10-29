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

Name: Venkat Reddy Buthuru  
E-mail: <buthuruvenkatreddy@gmail.com>

---


DEPLOYMENT LINK: https://task-manager-api-ieoe.onrender.com/


## Project Overview

A production-ready offline-first task management API that enables users to create, update, and manage tasks even without internet connectivity. The system intelligently queues operations and synchronizes them when the connection is restored, with built-in conflict resolution using a last-write-wins strategy.

### Key Features

- Offline-First Architecture - Full functionality without internet
- Intelligent Sync Queue - Automatic operation queuing and batch processing
- Conflict Resolution - Last-write-wins with timestamp comparison
- Soft Deletes - Data integrity with recoverable deletes
- Batch Sync - Efficient 50-item batch processing
- RESTful API - 8 well-structured endpoints
- Modern UI - Beautiful responsive frontend with real-time updates
- Type-Safe - Full TypeScript implementation
- Well-Tested - 17/17 tests passing (100% success rate)

---

## Quick Start

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

Access the application:

- Frontend: <http://localhost:3000>
- API: <http://localhost:3000/api>

---

## Architecture

### System Design

```text
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

---

## How Offline-First Works

### 1. Offline Task Creation Flow

```text

```

### 2. Coming Online & Sync Flow

```text
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

```

### 3. Conflict Resolution (Last-Write-Wins)

```text
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

```text

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

---

## Key Implementation Highlights

### 1. Offline-First Design

- All operations work locally first
- Network independence ensures reliability
- Seamless sync when connectivity returns

### 2. Intelligent Sync Queue

- Operations queued with metadata
- Batch processing for efficiency
- Retry logic with exponential backoff
- Dead letter queue after 3 failures

### 3. Conflict Resolution

- Timestamp-based comparison
- Last-write-wins strategy
- Operation priority (delete > update > create)
- Logged decisions for debugging

### 4. Error Handling

- Global error middleware
- Try-catch in all async operations
- Meaningful error messages
- Graceful degradation

### 5. Type Safety

- Full TypeScript implementation
- Interfaces for all data structures
- Type guards where needed
- No `any` types used

---

## License

This project was created as part of the Backend Developer Internship selection process for PearlThoughts. All rights reserved.

---

## Author

**Venkat Reddy Buthuru**  

**Thank you for reviewing my submission!**
