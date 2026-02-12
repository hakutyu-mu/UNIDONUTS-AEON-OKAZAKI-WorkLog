import React, { useMemo } from 'react';
import type { Shift, Employee } from '../../types';
import { Card } from '../ui/Card';


interface BreakOrderProps {
    shifts: Shift[];
    employees: Employee[];
}

export const BreakOrder: React.FC<BreakOrderProps> = ({ shifts, employees }) => {
    const sortedShifts = useMemo(() => {
        return shifts
            .filter(s => s.breakMinutes > 0)
            .sort((a, b) => {
                // 終了時刻が早い順
                // 日付またぎ考慮 (簡易)
                const timeA = a.endTime.replace(':', '');
                const timeB = b.endTime.replace(':', '');
                return parseInt(timeA) - parseInt(timeB);
            });
    }, [shifts]);

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';

    return (
        <Card title="休憩の順番 (終了時刻順)" className="h-full">
            <div className="bg-secondary-light/30 rounded-lg p-3">
                {sortedShifts.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center">勤務データがありません</p>
                ) : (
                    <ul className="space-y-2">
                        {sortedShifts.map((shift, index) => (
                            <li key={shift.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {getEmployeeName(shift.employeeId)}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="text-xs text-gray-400">終了:</span>
                                    {shift.endTime}
                                    <span className="ml-2 text-xs text-gray-400">休:</span>
                                    {shift.breakMinutes}分
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};
