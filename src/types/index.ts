import { Timestamp } from 'firebase/firestore';

export type DocumentId = string;

export interface FirestoreDocument {
  id: DocumentId;
}

export interface TimestampFields {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  activeVehicleId?: DocumentId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User extends UserDocument {
  uid: DocumentId;
}

export type FuelType = 'Gasolina' | 'Álcool' | 'Flex' | 'Diesel' | 'Elétrico';

export interface VehicleDocument extends FirestoreDocument, TimestampFields {
  userId: DocumentId;
  plate: string;
  brand: string;
  model: string;
  engine: string;
  fuelType: FuelType;
  currentOdometer: number;
}

export type Vehicle = VehicleDocument;

export type MaintenanceType = 'preventive' | 'corrective';

export interface MaintenanceTimestamps {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface MaintenanceDocument extends FirestoreDocument {
  vehicleId: DocumentId;
  type: MaintenanceType;
  description: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  date: string;
  partsDetail?: string;
  attachmentUri?: string;
  odometer?: number;
  timestamps?: MaintenanceTimestamps;
}

export type Maintenance = MaintenanceDocument;

export interface FuelLogDocument extends FirestoreDocument, TimestampFields {
  vehicleId: DocumentId;
  date: string;
  liters: number;
  totalCost: number;
  odometer: number;
}

export type FuelLog = FuelLogDocument;

export type AlertType = 'date' | 'odometer';
export type AlertStatus = 'pending' | 'completed';

export interface AlertDocument extends FirestoreDocument, TimestampFields {
  vehicleId: DocumentId;
  type: AlertType;
  title: string;
  targetDate?: string;
  targetOdometer?: number;
  status: AlertStatus;
  maintenanceId?: DocumentId;
}

export type Alert = AlertDocument;

export interface AppCollections {
  user: User;
  vehicles: VehicleDocument[];
  maintenance: MaintenanceDocument[];
  fuelLogs: FuelLogDocument[];
  alerts: AlertDocument[];
}

export interface AppDataDocument {
  data: AppCollections;
}

export type AppData = AppDataDocument;

export type VehicleFormData = Omit<VehicleDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
  id?: DocumentId;
};

export type MaintenanceFormData = Omit<MaintenanceDocument, 'id' | 'totalCost' | 'vehicleId'> & {
  id?: DocumentId;
};

export type FuelLogFormData = Omit<FuelLogDocument, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'> & {
  id?: DocumentId;
};

export type AlertFormData = Omit<AlertDocument, 'id' | 'status' | 'vehicleId' | 'createdAt' | 'updatedAt'> & {
  id?: DocumentId;
  status?: AlertStatus;
};

export const defaultVehicle: Vehicle = {
  id: '',
  userId: '',
  plate: '',
  brand: '',
  model: '',
  engine: '',
  fuelType: 'Flex',
  currentOdometer: 0,
};

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
};

export const defaultFuelLog: FuelLog = {
  id: '',
  vehicleId: '',
  date: '',
  liters: 0,
  totalCost: 0,
  odometer: 0,
};

export const defaultAlert: Alert = {
  id: '',
  vehicleId: '',
  type: 'odometer',
  title: '',
  targetDate: '',
  targetOdometer: 0,
  status: 'pending',
};
