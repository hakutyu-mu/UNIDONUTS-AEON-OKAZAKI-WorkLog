import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import type { Employee } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Trash2, Edit2, Plus, User } from 'lucide-react';

interface EmployeeManagerProps {
    onUpdate: () => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ onUpdate }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
    const [error, setError] = useState('');

    const loadEmployees = async () => {
        const list = await db.employees.getAll();
        setEmployees(list.sort((a, b) => a.name.localeCompare(b.name)));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleSave = async () => {
        if (!currentEmployee.name?.trim()) {
            setError('名前を入力してください');
            return;
        }

        const employee: Employee = {
            id: currentEmployee.id || crypto.randomUUID(),
            name: currentEmployee.name.trim(),
            tags: currentEmployee.tags || [],
            isActive: true,
            createdAt: currentEmployee.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.employees.put(employee);
        await loadEmployees();
        onUpdate();
        setIsEditing(false);
        setCurrentEmployee({});
        setError('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('本当に削除しますか？')) {
            await db.employees.delete(id);
            await loadEmployees();
            onUpdate();
        }
    };

    const startEdit = (employee: Employee) => {
        setCurrentEmployee(employee);
        setIsEditing(true);
    };

    const startAdd = () => {
        setCurrentEmployee({});
        setIsEditing(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    従業員管理
                </h2>
                {!isEditing && (
                    <Button onClick={startAdd} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        新規追加
                    </Button>
                )}
            </div>

            {isEditing && (
                <Card className="mb-4 bg-surface border-primary-light">
                    <div className="space-y-4">
                        <Input
                            label="名前"
                            value={currentEmployee.name || ''}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
                            error={error}
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isManager"
                                checked={currentEmployee.tags?.includes('管理者')}
                                onChange={(e) => {
                                    const tags = currentEmployee.tags?.filter(t => t !== '管理者') || [];
                                    if (e.target.checked) tags.push('管理者');
                                    setCurrentEmployee({ ...currentEmployee, tags });
                                }}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="isManager" className="text-sm text-gray-700">管理者権限（時給アップ）</label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>キャンセル</Button>
                            <Button onClick={handleSave}>保存</Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid gap-2">
                {employees.map((emp) => (
                    <div key={emp.id} className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm border border-secondary-dark/10">
                        <div>
                            <span className="font-medium text-gray-900">{emp.name}</span>
                            {emp.tags.includes('管理者') && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-secondary-light text-primary-dark rounded-full">管理者</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => startEdit(emp)}
                                className="p-1 text-gray-500 hover:text-primary transition-colors"
                                title="編集"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(emp.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="削除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {employees.length === 0 && !isEditing && (
                    <p className="text-center text-gray-500 py-4">従業員が登録されていません</p>
                )}
            </div>
        </div>
    );
};
