import { Alert, FuelLog, Maintenance, Vehicle } from '../../types';
import { ThemeColors } from '../../theme';

export interface ExpenseTotals {
  totalMaintenanceCost: number;
  totalFuelCost: number;
  totalExpenses: number;
}

export interface DistanceCostSummary {
  distance: number;
  costPerKm: number;
}

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

interface MonthlyExpenseBucket {
  key: string;
  label: string;
  value: number;
}

export function getExpenseTotals(maintenances: Maintenance[], fuelLogs: FuelLog[]): ExpenseTotals {
  const totalMaintenanceCost = maintenances.reduce((sum, item) => sum + item.totalCost, 0);
  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    totalMaintenanceCost,
    totalFuelCost,
    totalExpenses: totalMaintenanceCost + totalFuelCost,
  };
}

export function getDistanceCostSummary(
  vehicle: Vehicle | null,
  fuelLogs: FuelLog[],
  totalExpenses: number
): DistanceCostSummary {
  if (!vehicle || fuelLogs.length === 0) {
    return { distance: 0, costPerKm: 0 };
  }

  const odometers = fuelLogs.map(log => log.odometer);

  if (vehicle.currentOdometer > 0) {
    odometers.push(vehicle.currentOdometer);
  }

  const minOdometer = Math.min(...odometers);
  const maxOdometer = Math.max(...odometers);
  const distance = maxOdometer - minOdometer;

  return {
    distance,
    costPerKm: distance > 0 ? totalExpenses / distance : 0,
  };
}

export function getCategoryChartData(
  maintenances: Maintenance[],
  totalFuelCost: number,
  colors: ThemeColors
): ChartDatum[] {
  const preventiveCost = maintenances
    .filter(item => item.type === 'preventive')
    .reduce((sum, item) => sum + item.totalCost, 0);

  const correctiveCost = maintenances
    .filter(item => item.type === 'corrective')
    .reduce((sum, item) => sum + item.totalCost, 0);

  return [
    { label: 'Combustível', value: totalFuelCost, color: colors.info },
    { label: 'Manut. Preventiva', value: preventiveCost, color: colors.accentDark },
    { label: 'Manut. Corretiva', value: correctiveCost, color: colors.error },
  ];
}

export function getMonthlyExpenseHistory(
  maintenances: Maintenance[],
  fuelLogs: FuelLog[],
  now = new Date()
): ChartDatum[] {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyExpenses: MonthlyExpenseBucket[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    monthlyExpenses.push({
      key: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
      label: `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`,
      value: 0,
    });
  }

  [...maintenances, ...fuelLogs].forEach(item => {
    if (!item.date) return;

    const yearMonth = item.date.substring(0, 7);
    const month = monthlyExpenses.find(entry => entry.key === yearMonth);

    if (month) {
      month.value += item.totalCost;
    }
  });

  return monthlyExpenses.map(({ label, value }) => ({ label, value }));
}

export function getCriticalAlerts(vehicle: Vehicle | null, alerts: Alert[], now = new Date()): Alert[] {
  if (!vehicle) {
    return [];
  }

  return alerts.filter(alert => {
    if (alert.status === 'completed') {
      return false;
    }

    if (alert.type === 'odometer' && alert.targetOdometer) {
      return alert.targetOdometer - vehicle.currentOdometer <= 500;
    }

    if (alert.type === 'date' && alert.targetDate) {
      const targetTime = new Date(alert.targetDate).getTime();
      const diffDays = (targetTime - now.getTime()) / (1000 * 60 * 60 * 24);

      return diffDays <= 7;
    }

    return false;
  });
}
