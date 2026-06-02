import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  activeVehicleId?: string;
}

export type FuelType = 'Gasolina' | 'Álcool' | 'Flex' | 'Diesel' | 'Elétrico';

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  brand: string;
  model: string;
  engine: string;
  fuelType: FuelType;
  currentOdometer: number;
  createdAt?: Timestamp;
}

export const defaultVehicle: Vehicle = {
  id: '',
  userId: '',
  plate: '',
  brand: '',
  model: '',
  engine: '',
  fuelType: 'Flex',
  currentOdometer: 0,
}

export type MaintenanceType = 'preventive' | 'corrective';

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  date: string;
  partsDetail?: string;
  attachmentUri?: string;
  odometer?: number;
  timestamps?: {
    createdAt: Timestamp;
    updatedAt?: Timestamp;
  };
}

export const defaultMaintenance: Maintenance = {
  id: '',
  vehicleId: '',
  type: 'preventive',
  description: '',
  partsCost: 0,
  laborCost: 0,
  totalCost: 0,
  date: '',
  partsDetail: '',
  attachmentUri: '',
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  totalCost: number;
  odometer: number;
  createdAt?: Timestamp;
}

export const defaultFuelLog: FuelLog = {
  id: '',
  vehicleId: '',
  date: '',
  liters: 0,
  totalCost: 0,
  odometer: 0,
}

export type AlertType = 'date' | 'odometer';
export type AlertStatus = 'pending' | 'completed';

export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  title: string;
  targetDate?: string;
  targetOdometer?: number;
  status: AlertStatus;
  maintenanceId?: string;
  createdAt?: Timestamp;
}

export const defaultAlert: Alert = {
  id: '',
  vehicleId: '',
  type: 'odometer',
  title: '',
  targetDate: '',
  targetOdometer: 0,
  status: 'pending',
}

export interface AppData {
  data: {
    user: User;
    vehicles: Vehicle[];
    maintenance: Maintenance[];
    fuelLogs: FuelLog[];
    alerts: Alert[];
  }
}
