import React, { useState, useEffect } from 'react';
import type { Employee, Shift } from '../../types';
import { db } from '../../db';
import { calculateTime, validateBreak } from '../../utils/calculator';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TimePicker } from '../ui/TimePicker';
import { Input } from '../ui/Input';

import { AlertTriangle, Save } from 'lucide-react';

interface ShiftInputProps {
    employees: Employee[];
    currentDate: string;
    onSave: () => void;
}

export const ShiftInput: React.FC<ShiftInputProps> = ({ employees, currentDate, onSave }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [date, setDate] = useState(currentDate);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [breakMinutes, setBreakMinutes] = useState('0'); // default 0 min
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');

    useEffect(() => {
        setDate(currentDate);
    }, [currentDate]);

    // Auto-calculate break time when shift times change
    useEffect(() => {
        if (startTime && endTime) {
            const { durationMinutes } = calculateTime(startTime, endTime, 0); // Calculate raw duration
            let newBreak = '0';

            // 8時間 (480分) 超過 -> 60分
            if (durationMinutes > 480) {
                newBreak = '60';
            }
            // 6時間 (360分) 超過 -> 45分
            else if (durationMinutes > 360) {
                newBreak = '45';
            }

            setBreakMinutes(newBreak);
        }
    }, [startTime, endTime]);

    useEffect(() => {
        // Validation & Preview
        setWarning('');
        if (startTime && endTime) {
            // Re-calc for validation warning with current breakMinutes
            const currentBreak = Number(breakMinutes);

            const { workMinutes } = calculateTime(startTime, endTime, currentBreak);
            const isValid = validateBreak(workMinutes, currentBreak);
            if (!isValid) {
                if (workMinutes / 60 >= 8) {
                    setWarning('実労働時間が8時間を超える場合は、60分以上の休憩が必要です。');
                } else if (workMinutes / 60 >= 6) {
                    setWarning('実労働時間が6時間を超える場合は、45分以上の休憩が必要です。');
                }
            }
        }
    }, [startTime, endTime, breakMinutes]);

    const handleSubmit = async () => {
        setError('');
        if (!selectedEmployeeId) {
            setError('従業員を選択してください');
            return;
        }
        if (!startTime || !endTime) {
            setError('開始・終了時刻を入力してください');
            return;
        }

        const employee = employees.find(e => e.id === selectedEmployeeId);
        if (!employee) return;

        const isManager = employee.tags.includes('管理者');

        const shift: Shift = {
            id: crypto.randomUUID(),
            employeeId: selectedEmployeeId,
            date,
            startTime,
            endTime,
            breakMinutes: Number(breakMinutes),
            isManager,
            hourlyRateParams: {
                base: 1200,
                managerBonus: 150,
                overtimeMultiplier: 1.25,
            }
        };

        await db.shifts.put(shift);
        onSave();

        // Reset form partially
        setSelectedEmployeeId('');
        setStartTime('');
        setEndTime('');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-secondary-dark/20 space-y-4">
            <h3 className="font-bold text-lg text-primary border-b border-secondary-dark/10 pb-2 mb-2">勤務入力</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    type="date"
                    label="日付"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <Select
                    label="従業員"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    options={[
                        { label: '選択してください', value: '' },
                        ...employees.map(e => ({ label: e.name, value: e.id }))
                    ]}
                    error={error && !selectedEmployeeId ? error : undefined}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <TimePicker
                    label="開始"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    step={300} // 5 min
                />
                <TimePicker
                    label="終了"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    step={300}
                />
            </div>

            <Input
                type="number"
                label="休憩 (分)"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                min={0}
            />

            {warning && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-600" />
                    <span>{warning}</span>
                </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

            <Button onClick={handleSubmit} className="w-full justify-center">
                <Save className="w-4 h-4 mr-2" />
                登録する
            </Button>
        </div>
    );
};
