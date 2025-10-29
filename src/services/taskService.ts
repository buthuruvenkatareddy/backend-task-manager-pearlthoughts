import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types';
import { Database } from '../db/database';

export class TaskService {
  constructor(private db: Database) {}

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const task: Task = {
      id,
      title: taskData.title || '',
      description: taskData.description || '',
      completed: taskData.completed || false,
      created_at: new Date(now),
      updated_at: new Date(now),
      is_deleted: false,
      sync_status: 'pending',
      server_id: undefined,
      last_synced_at: undefined
    };

    const sql = `
      INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      task.id,
      task.title,
      task.description,
      task.completed ? 1 : 0,
      now,
      now,
      0,
      'pending'
    ]);

    // Add to sync queue
    await this.addToSyncQueue(task.id, 'create', task);

    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const existingTask = await this.getTask(id);
    if (!existingTask) {
      return null;
    }

    const now = new Date().toISOString();
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(updates.completed ? 1 : 0);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateFields.push('sync_status = ?');
    updateValues.push('pending');

    updateValues.push(id);

    const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    await this.db.run(sql, updateValues);

    const updatedTask = await this.getTask(id);
    
    // Add to sync queue
    if (updatedTask) {
      await this.addToSyncQueue(id, 'update', updatedTask);
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const existingTask = await this.getTask(id);
    if (!existingTask) {
      return false;
    }

    const now = new Date().toISOString();
    const sql = `
      UPDATE tasks 
      SET is_deleted = 1, updated_at = ?, sync_status = ?
      WHERE id = ?
    `;

    await this.db.run(sql, [now, 'pending', id]);
    
    // Add to sync queue
    await this.addToSyncQueue(id, 'delete', { ...existingTask, is_deleted: true });
    
    return true;
  }

  async getTask(id: string): Promise<Task | null> {
    const sql = `SELECT * FROM tasks WHERE id = ? AND is_deleted = 0`;
    const row = await this.db.get(sql, [id]);

    if (!row) {
      return null;
    }

    return this.mapRowToTask(row);
  }

  async getAllTasks(): Promise<Task[]> {
    const sql = `SELECT * FROM tasks WHERE is_deleted = 0 ORDER BY created_at DESC`;
    const rows = await this.db.all(sql);
    return rows.map(row => this.mapRowToTask(row));
  }

  async getTasksNeedingSync(): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE sync_status IN ('pending', 'error') 
      ORDER BY updated_at ASC
    `;
    const rows = await this.db.all(sql);
    return rows.map(row => this.mapRowToTask(row));
  }

  private async addToSyncQueue(taskId: string, operation: 'create' | 'update' | 'delete', data: Partial<Task>): Promise<void> {
    const queueId = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO sync_queue (id, task_id, operation, data, created_at, retry_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      queueId,
      taskId,
      operation,
      JSON.stringify(data),
      now,
      0
    ]);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed === 1,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      is_deleted: row.is_deleted === 1,
      sync_status: row.sync_status,
      server_id: row.server_id,
      last_synced_at: row.last_synced_at ? new Date(row.last_synced_at) : undefined
    };
  }
}