import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import {
  CapacitorSQLite,
  JsonSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteChanges,
  capSQLiteValues,
} from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName: string;

  public dbready: BehaviorSubject<boolean>;
  public isWeb: boolean;
  public isIOS: boolean;

  public: WritableSignal<User[]> = signal<User[]>([]);

  constructor(private http: HttpClient) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.dbready = new BehaviorSubject(false);
  }

  async init() {
    const info = await Device.getInfo();
    console.log('Platform: ', info);

    const sqlite = CapacitorSQLite as any;

    if (info.platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.log('se necesitan permisos!');
      }
    } else if (info.platform == 'ios') {
      this.isIOS = true;
    } else if (info.platform == 'web') {
      sqlite.initWebStore();
    }

    this.setupDatabase();
  }

  async setupDatabase() {
    const dbSetup = await Preferences.get({ key: 'first_setup_key' });

    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      this.dbName = await this.getDbName();
      await CapacitorSQLite.initWebStore();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });

      this.dbready.next(true);
    }
  }

  downloadDatabase() {
    this.http
      .get('assets/db/db.json')
      .subscribe(async (jsonExport: JsonSQLite) => {
        const jsonstring = JSON.stringify(jsonExport);
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

        if (isValid.result) {
          this.dbName = jsonExport.database;
          CapacitorSQLite.importFromJson({ jsonstring });
          CapacitorSQLite.createConnection({ database: this.dbName });
          CapacitorSQLite.open({ database: this.dbName });

          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });

          this.dbready.next(true);
        }
      });
  }

  async getDbName() {
    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' });

      if (dbname.value) {
        return dbname.value;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async createUser(user: User) {
    let sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [user.name, user.email],
        },
      ],
    })
      .then((changes: capSQLiteChanges) => {
        if (this.isWeb) {
          CapacitorSQLite.saveToStore({ database: dbName });
        }

        console.log('changes:', changes);
        return changes;
      })
      .catch((err) => Promise.reject(err));
  }

  async loadUsers() {
    let sql = 'SELECT * FROM users';
    const dbName = await this.getDbName();

    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [],
    }).then((response: capSQLiteValues) => {
      let users: User[] = [];

      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      response.values.forEach((user: any) => {
        users.push({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      });
      return users;
    });
  }

  async updateUser(user: User) {
    let sql = 'UPDATE users SET name=?, email=? WHERE id=?';
    const dbName = await this.getDbName();

    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [user.name, user.email, user.id],
        },
      ],
    })
      .then((changes: capSQLiteChanges) => {
        if (this.isWeb) {
          CapacitorSQLite.saveToStore({ database: dbName });
        }

        console.log('changes:', changes);
        return changes;
      })
      .catch((err) => Promise.reject(err));
  }

  async deleteUserById(id: number) {
    let sql = 'DELETE FROM users WHERE id=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [id],
        },
      ],
    })
      .then((changes: capSQLiteChanges) => {
        if (this.isWeb) {
          CapacitorSQLite.saveToStore({ database: dbName });
        }

        console.log('changes:', changes);
        return changes;
      })
      .catch((err) => Promise.reject(err));
  }
}
