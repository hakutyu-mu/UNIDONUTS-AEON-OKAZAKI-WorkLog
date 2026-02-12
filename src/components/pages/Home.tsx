import React, { useState, useEffect, useCallback } from 'react';
import type { Shift, Employee } from '../../types';
import { db } from '../../db';
import { ShiftInput } from '../features/ShiftInput';
import { ShiftList } from '../features/ShiftList';
import { BreakOrder } from '../features/BreakOrder';
import { EmployeeManager } from '../features/EmployeeManager';
import { exportShiftsToCSV } from '../../utils/csv';

import { format } from 'date-fns';
import { Calendar, Download, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const Home: React.FC = () => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showEmployeeManager, setShowEmployeeManager] = useState(false);

    const loadData = useCallback(async () => {
        const [shiftsData, employeesData] = await Promise.all([
            db.shifts.getByDate(date),
            db.employees.getAll()
        ]);
        setShifts(shiftsData);
        setEmployees(employeesData);
    }, [date]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-10 border-b border-secondary-dark/20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight">
                        <span style={{ color: '#dac7a0' }}>UNI</span>
                        <span style={{ color: '#95604b' }} className="ml-1">DONUTS</span>
                        <span className="text-sm font-normal opacity-60 text-gray-500 ml-2">Work Log</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowEmployeeManager(!showEmployeeManager)}
                        >
                            {showEmployeeManager ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                            <span className="ml-1 hidden sm:inline">{showEmployeeManager ? '閉じる' : '設定'}</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">

                {/* Date Navigator */}
                <div className="flex justify-center items-center gap-4 bg-white p-3 rounded-lg shadow-sm w-full md:w-auto mx-auto border border-secondary-dark/20">
                    <button onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() - 1);
                        setDate(format(d, 'yyyy-MM-dd'));
                    }} className="p-2 hover:bg-gray-100 rounded-full">←</button>

                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        <Calendar className="w-5 h-5 text-primary" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 font-bold text-gray-800"
                        />
                    </div>

                    <button onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() + 1);
                        setDate(format(d, 'yyyy-MM-dd'));
                    }} className="p-2 hover:bg-gray-100 rounded-full">→</button>
                </div>

                {showEmployeeManager && (
                    <div className="bg-white p-4 rounded-lg shadow-md border border-primary-light animation-fade-in">
                        <EmployeeManager onUpdate={loadData} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Input */}
                    <div className="lg:col-span-4 space-y-6">
                        <ShiftInput employees={employees} currentDate={date} onSave={loadData} />
                        <BreakOrder shifts={shifts} employees={employees} />
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-8 space-y-4 lg:mt-0 mt-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 my-subtitle-margin">勤務一覧</h2>
                            {/* CSV Export Placeholder */}
                            <Button className="my-csv-margin" variant="outline" size="sm" onClick={() => exportShiftsToCSV(shifts, employees)}>
                                <Download className="w-4 h-4 mr-1" />
                                CSV出力
                            </Button>
                        </div>
                        <ShiftList shifts={shifts} employees={employees} onDelete={loadData} />
                    </div>
                </div>
            </main>
        </div>
    );
};
