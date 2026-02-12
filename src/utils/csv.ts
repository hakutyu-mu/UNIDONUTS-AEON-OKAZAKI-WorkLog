import type { Shift, Employee } from '../types';
import { calculateSalary } from './calculator';

export const exportShiftsToCSV = (shifts: Shift[], employees: Employee[]) => {
    // Header
    const headers = [
        '日付',
        '名前',
        '開始時刻',
        '終了時刻',
        '休憩(分)',
        '実働時間(時間)',
        '通常給与',
        '残業給与',
        '合計給与',
        '管理者フラグ'
    ];

    // Rows
    const rows = shifts.map(shift => {
        const employee = employees.find(e => e.id === shift.employeeId);
        const summary = calculateSalary(shift, employee?.name);

        return [
            shift.date,
            summary.employeeName,
            shift.startTime,
            shift.endTime,
            shift.breakMinutes,
            (summary.workMinutes / 60).toFixed(2),
            summary.basePay,
            summary.overtimePay,
            summary.totalPay,
            shift.isManager ? 'Yes' : 'No'
        ];
    });

    // Combine
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // BOM for Excel compatibility (UTF-8)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv' });

    // Download trigger
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `unidonuts_shifts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
