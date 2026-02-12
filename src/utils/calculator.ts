import type { Shift, ShiftSummary } from '../types';
import { differenceInMinutes, parse } from 'date-fns';

// 勤務時間の計算とバリデーション
export const calculateTime = (startTime: string, endTime: string, breakMinutes: number) => {
    // HH:mm 形式をパースするための基準日（日付またぎ非対応のV1仕様）
    const baseDate = new Date();
    const start = parse(startTime, 'HH:mm', baseDate);
    const end = parse(endTime, 'HH:mm', baseDate);

    // 終了時刻が開始時刻より前の場合は日付またぎとみなす（簡易対応）
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }

    const durationMinutes = differenceInMinutes(end, start);
    const workMinutes = Math.max(0, durationMinutes - breakMinutes);
    const workHours = workMinutes / 60;

    return { durationMinutes, workMinutes, workHours };
};

// 休憩ルールのバリデーション
export const validateBreak = (workMinutes: number, breakMinutes: number): boolean => {
    const workHours = workMinutes / 60;

    if (workHours >= 8) {
        return breakMinutes >= 60;
    }
    if (workHours >= 6) {
        return breakMinutes >= 45;
    }
    return true;
};

// 給与計算
export const calculateSalary = (shift: Shift, employeeName: string = ''): ShiftSummary => {
    const { durationMinutes, workMinutes, workHours } = calculateTime(shift.startTime, shift.endTime, shift.breakMinutes);

    const baseRate = shift.hourlyRateParams.base + (shift.isManager ? shift.hourlyRateParams.managerBonus : 0);
    const overtimeRate = Math.round(baseRate * shift.hourlyRateParams.overtimeMultiplier);

    const baseWorkHours = Math.min(workHours, 8);
    const overtimeWorkHours = Math.max(0, workHours - 8);

    const basePay = Math.round(baseWorkHours * baseRate);
    const overtimePay = Math.round(overtimeWorkHours * overtimeRate);
    const totalPay = basePay + overtimePay;

    return {
        shift,
        employeeName,
        durationMinutes,
        workMinutes,
        basePay,
        overtimePay,
        totalPay,
        isValidBreak: validateBreak(workMinutes, shift.breakMinutes),
    };
};
