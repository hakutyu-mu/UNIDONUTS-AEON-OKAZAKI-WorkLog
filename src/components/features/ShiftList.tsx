import React, { useMemo } from 'react';
import type { Shift, Employee } from '../../types';
import { calculateSalary } from '../../utils/calculator';
import { db } from '../../db';
import { Trash2 } from 'lucide-react';

interface ShiftListProps {
    shifts: Shift[];
    employees: Employee[];
    onDelete: () => void;
}

export const ShiftList: React.FC<ShiftListProps> = ({ shifts, employees, onDelete }) => {
    const shiftSummaries = useMemo(() => {
        return shifts.map(shift => {
            const employee = employees.find(e => e.id === shift.employeeId);
            return calculateSalary(shift, employee?.name);
        });
    }, [shifts, employees]);

    const handleDelete = async (id: string) => {
        if (confirm('この勤務記録を削除しますか？')) {
            await db.shifts.delete(id);
            onDelete();
        }
    };

    const grandTotal = shiftSummaries.reduce((sum, s) => sum + s.totalPay, 0);

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#faf8f4]">
                    <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">勤務時間</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">休憩</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">実務</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">時給</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">給与詳細 (予価)</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {shiftSummaries.map((summary) => {
                        const baseRate = summary.shift.hourlyRateParams.base + (summary.shift.isManager ? summary.shift.hourlyRateParams.managerBonus : 0);
                        const overtimeRate = Math.round(baseRate * summary.shift.hourlyRateParams.overtimeMultiplier);
                        const hasOvertime = summary.overtimePay > 0;

                        return (
                            <tr key={summary.shift.id} className="hover:bg-[#faf8f4] transition-colors">
                                <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {summary.employeeName}
                                    {summary.shift.isManager && <span className="ml-1 text-xs text-primary">(管)</span>}
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                                    {summary.shift.startTime} - {summary.shift.endTime}
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                                    {summary.shift.breakMinutes}分
                                    {!summary.isValidBreak && <span className="text-red-500 ml-1">!</span>}
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    <div className="flex flex-col items-end">
                                        <span>{hasOvertime ? '8.00h' : `${(summary.workMinutes / 60).toFixed(2)}h`}</span>
                                        {hasOvertime && <span className="text-primary-dark">{((summary.workMinutes / 60) - 8).toFixed(2)}h</span>}
                                    </div>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    <div className="flex flex-col items-end">
                                        <span>{baseRate.toLocaleString()}円</span>
                                        {hasOvertime && <span className="text-primary-dark">{overtimeRate.toLocaleString()}円</span>}
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-500 text-right">
                                    <div className="flex flex-col items-end">
                                        <span>{summary.basePay.toLocaleString()}円</span>
                                        {hasOvertime && <span className="text-primary-dark">{summary.overtimePay.toLocaleString()}円</span>}
                                    </div>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                    {summary.totalPay.toLocaleString()}円
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(summary.shift.id)}
                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {shiftSummaries.length > 0 && (
                        <tr className="bg-[#faf8f4] font-bold">
                            <td colSpan={5} className="px-2 py-3 text-right text-gray-900">日次合計:</td>
                            <td colSpan={2} className="px-2 py-3 text-right text-primary-dark text-lg">{grandTotal.toLocaleString()}円</td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
