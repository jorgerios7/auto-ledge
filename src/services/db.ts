import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db as firestoreDb } from './firebase';
import { AppData, Vehicle, Maintenance, FuelLog, Alert } from '../types';

export const db = {
  getUserDoc: async (userId: string) => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  createUserDoc: async (userId: string, email: string, displayName: string, photoURL: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId);
    await setDoc(docRef, {
      email,
      displayName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      photoURL
    });
  },

  updateUserDoc: async (userId: string, data: Partial<{ email: string; displayName: string; activeVehicleId: string | null }>): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  getAppData: async (userId: string): Promise<AppData | null> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');

    // 1. Fetch user doc
    const userDocRef = doc(firestoreDb, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return null;
    }

    const userDocData = userDocSnap.data();

    // 2. Fetch all subcollections in parallel
    const vehiclesPromise = getDocs(collection(firestoreDb, 'users', userId, 'vehicles'));
    const maintenancePromise = getDocs(collection(firestoreDb, 'users', userId, 'maintenance'));
    const fuelLogsPromise = getDocs(collection(firestoreDb, 'users', userId, 'fuelLogs'));
    const alertsPromise = getDocs(collection(firestoreDb, 'users', userId, 'alerts'));

    const [vehiclesSnap, maintenanceSnap, fuelLogsSnap, alertsSnap] = await Promise.all([
      vehiclesPromise,
      maintenancePromise,
      fuelLogsPromise,
      alertsPromise
    ]);

    const vehicles = vehiclesSnap.docs.map(d => d.data() as Vehicle);
    const maintenance = maintenanceSnap.docs.map(d => d.data() as Maintenance);
    const fuelLogs = fuelLogsSnap.docs.map(d => d.data() as FuelLog);
    const alerts = alertsSnap.docs.map(d => d.data() as Alert);

    return {
      data: {
        user: {
          uid: userId,
          email: userDocData.email,
          displayName: userDocData.displayName,
          activeVehicleId: userDocData.activeVehicleId || undefined,
          createdAt: userDocData.createdAt,
          updatedAt: userDocData.updatedAt || undefined,
        },
        vehicles,
        maintenance,
        fuelLogs,
        alerts
      }
    };
  },

  saveVehicle: async (userId: string, vehicle: Vehicle): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId, 'vehicles', vehicle.id);
    const dataToSave = {
      ...vehicle,
      createdAt: vehicle.createdAt || Timestamp.now()
    };
    await setDoc(docRef, dataToSave);
  },

  deleteVehicle: async (userId: string, vehicleId: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');

    // 1. Delete vehicle document
    await deleteDoc(doc(firestoreDb, 'users', userId, 'vehicles', vehicleId));

    // 2. Batch delete related maintenance, fuel logs, and alerts
    const batch = writeBatch(firestoreDb);
    const subcollections = ['maintenance', 'fuelLogs', 'alerts'];

    for (const collName of subcollections) {
      const q = query(
        collection(firestoreDb, 'users', userId, collName),
        where('vehicleId', '==', vehicleId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
    }

    await batch.commit();
  },

  saveMaintenance: async (userId: string, maintenance: Maintenance): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId, 'maintenance', maintenance.id);
    await setDoc(docRef, maintenance);
  },

  deleteMaintenance: async (userId: string, maintenanceId: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    await deleteDoc(doc(firestoreDb, 'users', userId, 'maintenance', maintenanceId));
  },

  saveFuelLog: async (userId: string, fuelLog: FuelLog): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId, 'fuelLogs', fuelLog.id);
    const dataToSave = {
      ...fuelLog,
      createdAt: fuelLog.createdAt || Timestamp.now()
    };
    await setDoc(docRef, dataToSave);
  },

  deleteFuelLog: async (userId: string, fuelLogId: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    await deleteDoc(doc(firestoreDb, 'users', userId, 'fuelLogs', fuelLogId));
  },

  saveAlert: async (userId: string, alert: Alert): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const docRef = doc(firestoreDb, 'users', userId, 'alerts', alert.id);
    const dataToSave = {
      ...alert,
      createdAt: alert.createdAt || Timestamp.now()
    };
    await setDoc(docRef, dataToSave);
  },

  deleteAlert: async (userId: string, alertId: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    await deleteDoc(doc(firestoreDb, 'users', userId, 'alerts', alertId));
  },

  deleteAppData: async (userId: string): Promise<void> => {
    if (!firestoreDb) throw new Error('Firestore not initialized');
    const batch = writeBatch(firestoreDb);

    // Fetch and delete all subcollection docs
    const subcollections = ['vehicles', 'maintenance', 'fuelLogs', 'alerts'];
    for (const collName of subcollections) {
      const collRef = collection(firestoreDb, 'users', userId, collName);
      const snapshot = await getDocs(collRef);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
    }

    // Delete user doc itself
    batch.delete(doc(firestoreDb, 'users', userId));
    await batch.commit();
  }
};
