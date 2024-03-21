import { Injectable, WritableSignal, signal } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const DB_USERS = 'myDbUsers';

export interface User {
  id: number;
  name: string;
  email: string;
  state: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection;

  public users: WritableSignal<User[]> = signal<User[]>([]);

  constructor() {}

  async initializePlugin() {
    debugger
    this.db = await this.sqlite.createConnection(
      DB_USERS,
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();
    console.log("this.db",this.db)

    const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  state INTEGER
  );
  `;

    await this.db.execute(schema);
    this.loadUsers();

    return true;
  }

  public getUsers() {
    return this.users;
  }

  async createUser(user: User) {
    console.log('DATA: ', user);
    const query = `INSERT INTO users (name, email, state) VALUES ('${user.name}','${user.email}',1)`;
    console.log("query: ",query)
    const result = await this.db.execute(query);
    this.loadUsers();
    return result;
  }

  async loadUsers() {
    const users = await this.db.query('SELECT * FROM users');
    this.users.set(users.values || []);
  }

  async updateUser(user: User) {
    const query = `UPDATE users SET name = '${user.name}', email = '${user.email}', state = '${user.state}' WHERE id = ${user.id}`;
    const result = await this.db.execute(query);
    this.loadUsers();
    return result;
  }

  async deleteUserById(id: number) {
    const query = `DELETE users  WHERE id = ${id}`;
    const result = await this.db.execute(query);
    this.loadUsers();
    return result;
  }
}
