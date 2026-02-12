import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Employee, Shift } from '../types';

interface UniDonutsDB extends DBSchema {
    employees: {
        key: string;
        value: Employee;
        indexes: { 'by-name': string };
    };
    shifts: {
        key: string;
        value: Shift;
        indexes: { 'by-date': string; 'by-employee': string };
    };
}

const DB_NAME = 'unidonuts-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<UniDonutsDB>>;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<UniDonutsDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('employees')) {
                    const store = db.createObjectStore('employees', { keyPath: 'id' });
                    store.createIndex('by-name', 'name');
                }
                if (!db.objectStoreNames.contains('shifts')) {
                    const store = db.createObjectStore('shifts', { keyPath: 'id' });
                    store.createIndex('by-date', 'date');
                    store.createIndex('by-employee', 'employeeId');
                }
            },
        });
    }
    return dbPromise;
};

export const db = {
    employees: {
        getAll: async () => (await initDB()).getAll('employees'),
        get: async (id: string) => (await initDB()).get('employees', id),
        put: async (employee: Employee) => (await initDB()).put('employees', employee),
        delete: async (id: string) => (await initDB()).delete('employees', id),
    },
    shifts: {
        getAll: async () => (await initDB()).getAll('shifts'),
        getByDate: async (date: string) => (await initDB()).getAllFromIndex('shifts', 'by-date', date),
        put: async (shift: Shift) => (await initDB()).put('shifts', shift),
        delete: async (id: string) => (await initDB()).delete('shifts', id),
    },
};
