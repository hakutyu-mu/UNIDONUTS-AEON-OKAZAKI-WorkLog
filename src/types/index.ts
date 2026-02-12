export interface Employee {
    id: string;
    name: string;
    tags: string[];
    isActive: boolean;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

export interface Shift {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    breakMinutes: number;
    isManager: boolean; // Snapshot of employee role at the time of shift
    hourlyRateParams: {
        base: number;
        managerBonus: number;
        overtimeMultiplier: number;
    };
}

export interface ShiftSummary {
    shift: Shift;
    employeeName: string;
    durationMinutes: number; // 拘束時間 (min)
    workMinutes: number;    // 実務時間 (min)
    basePay: number;
    overtimePay: number;
    totalPay: number;
    isValidBreak: boolean;
}
