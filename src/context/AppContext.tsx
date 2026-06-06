import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth as firebaseAuth, googleWebClientId } from '../services/firebase';
import { db } from '../services/db';
import { Timestamp } from 'firebase/firestore';
import { User, Vehicle, Maintenance, FuelLog, Alert } from '../types';

let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('GoogleSignin native module not found (e.g. running in Expo Go). Google Sign-In helper will display a fallback warning.');
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  maintenances: Maintenance[];
  fuelLogs: FuelLog[];
  alerts: Alert[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  updateUserProfile: (name: string, email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;

  // Db actions
  saveVehicle: (vehicleData: Omit<Vehicle, 'id' | 'userId'> & { id?: string }) => Promise<void>;
  updateVehicleOdometer: (vehicleId: string, odometer: number) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  saveMaintenance: (maintData: Omit<Maintenance, 'id' | 'totalCost' | 'vehicleId'> & { id?: string }) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
  saveFuelLog: (fuelData: Omit<FuelLog, 'id' | 'vehicleId'> & { id?: string }) => Promise<void>;
  deleteFuelLog: (id: string) => Promise<void>;
  saveAlert: (alertData: Omit<Alert, 'id' | 'status' | 'vehicleId'> & { id?: string; status?: 'pending' | 'completed' }) => Promise<void>;
  completeAlert: (id: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;

  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicleState] = useState<Vehicle | null>(null);

  // Raw array states containing all records for all vehicles
  const [allMaintenance, setAllMaintenance] = useState<Maintenance[]>([]);
  const [allFuelLogs, setAllFuelLogs] = useState<FuelLog[]>([]);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);

  // Filtered array states containing only selected vehicle's records
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Helper to filter details and sort where applicable
  const filterDetailsForVehicle = (
    vehicleId: string,
    mList: Maintenance[],
    fList: FuelLog[],
    aList: Alert[]
  ) => {
    const filteredMaint = mList
      .filter(m => m.vehicleId === vehicleId)
      .sort((a, b) => b.date.localeCompare(a.date));
    const filteredFuel = fList
      .filter(f => f.vehicleId === vehicleId)
      .sort((a, b) => b.date.localeCompare(a.date));
    const filteredAlerts = aList.filter(a => a.vehicleId === vehicleId);

    setMaintenances(filteredMaint);
    setFuelLogs(filteredFuel);
    setAlerts(filteredAlerts);
  };

  // Initialize Google Sign-In config
  useEffect(() => {
    if (GoogleSignin && googleWebClientId) {
      try {
        GoogleSignin.configure({
          webClientId: googleWebClientId,
        });
      } catch (err) {
        console.warn('Failed to configure GoogleSignin:', err);
      }
    }
  }, []);

  // Monitor auth state changes
  useEffect(() => {
    let unsubscribe = () => { };

    if (firebaseAuth) {
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            await loadUserData(firebaseUser.uid);
          } catch (error) {
            console.error('Error fetching auth user profile:', error);
          }
        } else {
          setUser(null);
          clearData();
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const clearData = () => {
    setVehicles([]);
    setSelectedVehicleState(null);
    setAllMaintenance([]);
    setAllFuelLogs([]);
    setAllAlerts([]);
    setMaintenances([]);
    setFuelLogs([]);
    setAlerts([]);
  };

  const loadUserData = async (userId: string, activeVehicleId?: string) => {
    try {
      let appData = await db.getAppData(userId);
      if (!appData) {
        // Initialize AppData for a new user matching the new structure
        await db.createUserDoc(
          userId,
          firebaseAuth?.currentUser?.email || '',
          firebaseAuth?.currentUser?.displayName || 'Usuário',
          firebaseAuth?.currentUser?.photoURL || '',
        );
        appData = await db.getAppData(userId);
      }

      if (!appData) {
        throw new Error('Não foi possível carregar os dados do usuário.');
      }

      const targetActiveVehicleId = activeVehicleId || appData.data.user.activeVehicleId;

      const userProfile: User = {
        uid: appData.data.user.uid,
        email: appData.data.user.email,
        displayName: appData.data.user.displayName,
        activeVehicleId: targetActiveVehicleId,
        createdAt: appData.data.user.createdAt || Timestamp.now(),
        updatedAt: appData.data.user.updatedAt || Timestamp.now(),
      };

      setUser(userProfile);
      setVehicles(appData.data.vehicles || []);
      setAllMaintenance(appData.data.maintenance || []);
      setAllFuelLogs(appData.data.fuelLogs || []);
      setAllAlerts(appData.data.alerts || []);

      let activeVeh: Vehicle | null = null;
      const listVeh = appData.data.vehicles || [];
      if (listVeh.length > 0) {
        const found = listVeh.find(v => v.id === targetActiveVehicleId);
        activeVeh = found || listVeh[0];
      }
      setSelectedVehicleState(activeVeh);

      if (activeVeh) {
        filterDetailsForVehicle(
          activeVeh.id,
          appData.data.maintenance || [],
          appData.data.fuelLogs || [],
          appData.data.alerts || []
        );
      } else {
        setMaintenances([]);
        setFuelLogs([]);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      clearData();
    }
  };

  const setSelectedVehicle = async (vehicle: Vehicle | null) => {
    setSelectedVehicleState(vehicle);
    if (user) {
      try {
        const updatedUser: User = {
          ...user,
          activeVehicleId: vehicle ? vehicle.id : undefined,
        };
        setUser(updatedUser);

        if (vehicle) {
          filterDetailsForVehicle(vehicle.id, allMaintenance, allFuelLogs, allAlerts);
        } else {
          setMaintenances([]);
          setFuelLogs([]);
          setAlerts([]);
        }

        await db.updateUserDoc(user.uid, { activeVehicleId: vehicle ? vehicle.id : null });
      } catch (error) {
        console.error('Error saving active vehicle selection to Firestore:', error);
      }
    }
  };

  const refreshData = async () => {
    if (user) {
      await loadUserData(user.uid, selectedVehicle?.id || undefined);
    }
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        throw new Error('Firebase Auth not initialized.');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        await db.createUserDoc(userCredential.user.uid, userCredential.user.email || '', name, userCredential.user.photoURL || '');
      } else {
        throw new Error('Firebase Auth not initialized.');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Erro ao registrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        await firebaseSignOut(firebaseAuth);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (name: string, email: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }
    setLoading(true);
    try {
      if (firebaseAuth && firebaseAuth.currentUser) {
        const currentUser = firebaseAuth.currentUser;

        // 1. Update display name in Firebase Auth if changed
        if (name.trim() !== currentUser.displayName) {
          await updateProfile(currentUser, { displayName: name.trim() });
        }

        // 2. Update email in Firebase Auth if changed
        if (email.trim().toLowerCase() !== currentUser.email) {
          await updateEmail(currentUser, email.trim().toLowerCase());
        }
      }

      const updatedUser: User = {
        ...user,
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
      };

      setUser(updatedUser);
      await db.updateUserDoc(user.uid, { displayName: name.trim(), email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.error('Update user profile error:', error);
      throw new Error(error.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }
    setLoading(true);
    try {
      if (firebaseAuth && firebaseAuth.currentUser) {
        const currentUser = firebaseAuth.currentUser;
        const userId = user.uid;

        // 1. Delete Firestore user document and all subcollections
        await db.deleteAppData(userId);

        // 2. Delete Firebase Auth user
        await deleteUser(currentUser);
      } else {
        setUser(null);
        clearData();
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Erro ao excluir conta.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth não inicializado.');
      }

      if (!GoogleSignin) {
        throw new Error('O Login com Google não funciona no app Expo Go padrão. Por favor, rode o projeto usando uma build de desenvolvimento nativa com o comando "npx expo run:android" ou "npx expo run:ios" para gerar o binário nativo correspondente.');
      }

      await GoogleSignin.hasPlayServices();
      const response: any = await GoogleSignin.signIn();

      await GoogleSignin.configure({
        webClienteId: response.idToken
      })

      const idToken = response?.idToken || response?.data?.idToken;

      if (!idToken) {
        throw new Error('Não foi possível obter o token do Google.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(firebaseAuth, credential);
      const firebaseUser = userCredential.user;

      // Check if user document already exists in Firestore. If not, initialize it.
      const appData = await db.getAppData(firebaseUser.uid);
      if (!appData) {
        await db.createUserDoc(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || '',
          firebaseUser.photoURL || '',
        );
      }
    } catch (error: any) {
      console.error('Erro no Login com Google:', error);
      if (error.code === 'SIGN_IN_CANCELLED' || error.message?.includes('Sign in cancelled')) {
        throw new Error('Login cancelado pelo usuário.');
      }
      throw new Error(error.message || 'Erro ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  // Vehicles Actions
  const saveVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'userId'> & { id?: string }) => {
    if (!user) return;
    const vehicleId = vehicleData.id || `veh-${Date.now()}`;

    const existingVehicle = vehicles.find(v => v.id === vehicleId);
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: vehicleId,
      userId: user.uid,
      createdAt: existingVehicle?.createdAt || Timestamp.now()
    };

    let updatedVehicles: Vehicle[];
    const exists = vehicles.some(v => v.id === vehicleId);
    if (exists) {
      updatedVehicles = vehicles.map(v => v.id === vehicleId ? newVehicle : v);
    } else {
      updatedVehicles = [...vehicles, newVehicle];
    }
    setVehicles(updatedVehicles);

    let updatedUser = user;
    let nextSelectedVehicle = selectedVehicle;

    if (!selectedVehicle || selectedVehicle.id === vehicleId) {
      nextSelectedVehicle = newVehicle;
      setSelectedVehicleState(newVehicle);
      updatedUser = {
        ...user,
        activeVehicleId: vehicleId,
      };
      setUser(updatedUser);
      filterDetailsForVehicle(vehicleId, allMaintenance, allFuelLogs, allAlerts);
    }

    await db.saveVehicle(user.uid, newVehicle);
    if (updatedUser.activeVehicleId !== user.activeVehicleId) {
      await db.updateUserDoc(user.uid, { activeVehicleId: vehicleId });
    }
  };

  const updateVehicleOdometer = async (vehicleId: string, odometer: number) => {
    if (!user) return;

    setVehicles(prevVehicles =>
      prevVehicles.map(v => (v.id === vehicleId ? { ...v, currentOdometer: odometer } : v))
    );

    setSelectedVehicleState(prevSelected => {
      if (prevSelected && prevSelected.id === vehicleId) {
        return { ...prevSelected, currentOdometer: odometer };
      }
      return prevSelected;
    });

    await db.updateVehicleOdometer(user.uid, vehicleId, odometer);
  };

  const deleteVehicle = async (id: string) => {
    if (!user) return;

    const updatedVehicles = vehicles.filter(v => v.id !== id);
    setVehicles(updatedVehicles);

    const updatedMaint = allMaintenance.filter(m => m.vehicleId !== id);
    const updatedFuel = allFuelLogs.filter(f => f.vehicleId !== id);
    const updatedAlerts = allAlerts.filter(a => a.vehicleId !== id);

    setAllMaintenance(updatedMaint);
    setAllFuelLogs(updatedFuel);
    setAllAlerts(updatedAlerts);

    let nextSelected: Vehicle | null = null;
    let updatedUser = user;

    if (selectedVehicle?.id === id) {
      nextSelected = updatedVehicles.length > 0 ? updatedVehicles[0] : null;
      setSelectedVehicleState(nextSelected);
      updatedUser = {
        ...user,
        activeVehicleId: nextSelected ? nextSelected.id : undefined,
      };
      setUser(updatedUser);
    } else {
      nextSelected = selectedVehicle;
    }

    if (nextSelected) {
      filterDetailsForVehicle(nextSelected.id, updatedMaint, updatedFuel, updatedAlerts);
    } else {
      setMaintenances([]);
      setFuelLogs([]);
      setAlerts([]);
    }

    await db.deleteVehicle(user.uid, id);
    if (updatedUser.activeVehicleId !== user.activeVehicleId) {
      await db.updateUserDoc(user.uid, { activeVehicleId: nextSelected ? nextSelected.id : null });
    }
  };

  // Maintenance Actions
  const saveMaintenance = async (maintData: Omit<Maintenance, 'id' | 'totalCost' | 'vehicleId'> & { id?: string }) => {
    if (!user || !selectedVehicle) return;
    const maintId = maintData.id || `maint-${Date.now()}`;
    const totalCost = maintData.partsCost + maintData.laborCost;

    const existingMaint = allMaintenance.find(m => m.id === maintId);
    let newMaint: Maintenance;

    if (existingMaint) {
      let createdAtTimestamp: Timestamp;
      if (existingMaint.timestamps?.createdAt) {
        createdAtTimestamp = existingMaint.timestamps.createdAt;
      } else {
        try {
          createdAtTimestamp = Timestamp.fromDate(new Date(existingMaint.date));
        } catch {
          createdAtTimestamp = Timestamp.now();
        }
      }

      newMaint = {
        ...maintData,
        id: maintId,
        vehicleId: selectedVehicle.id,
        totalCost,
        timestamps: {
          createdAt: createdAtTimestamp,
          updatedAt: Timestamp.now(),
        }
      };
    } else {
      newMaint = {
        ...maintData,
        id: maintId,
        vehicleId: selectedVehicle.id,
        totalCost,
        timestamps: {
          createdAt: Timestamp.now(),
        }
      };
    }

    let updatedMaint: Maintenance[];
    if (existingMaint) {
      updatedMaint = allMaintenance.map(m => m.id === maintId ? newMaint : m);
    } else {
      updatedMaint = [...allMaintenance, newMaint];
    }
    setAllMaintenance(updatedMaint);

    let updatedVehicles = vehicles;
    let updatedSelectedVehicle = selectedVehicle;
    if (newMaint.odometer && newMaint.odometer > selectedVehicle.currentOdometer) {
      updatedSelectedVehicle = {
        ...selectedVehicle,
        currentOdometer: newMaint.odometer
      };
      setSelectedVehicleState(updatedSelectedVehicle);
      updatedVehicles = vehicles.map(v => v.id === selectedVehicle.id ? updatedSelectedVehicle : v);
      setVehicles(updatedVehicles);
    }

    filterDetailsForVehicle(updatedSelectedVehicle.id, updatedMaint, allFuelLogs, allAlerts);

    await db.saveMaintenance(user.uid, newMaint);
    if (updatedSelectedVehicle.currentOdometer !== selectedVehicle.currentOdometer) {
      await db.saveVehicle(user.uid, updatedSelectedVehicle);
    }
  };

  const deleteMaintenance = async (id: string) => {
    if (!user || !selectedVehicle) return;
    const updatedMaint = allMaintenance.filter(m => m.id !== id);
    setAllMaintenance(updatedMaint);

    filterDetailsForVehicle(selectedVehicle.id, updatedMaint, allFuelLogs, allAlerts);

    await db.deleteMaintenance(user.uid, id);
  };

  // Fuel Logs Actions
  const saveFuelLog = async (fuelData: Omit<FuelLog, 'id' | 'vehicleId'> & { id?: string }) => {
    if (!user || !selectedVehicle) return;
    const fuelId = fuelData.id || `fuel-${Date.now()}`;

    const existingFuel = allFuelLogs.find(f => f.id === fuelId);
    const newFuel: FuelLog = {
      ...fuelData,
      id: fuelId,
      vehicleId: selectedVehicle.id,
      createdAt: existingFuel?.createdAt || Timestamp.now()
    };

    let updatedFuel: FuelLog[];
    const exists = allFuelLogs.some(f => f.id === fuelId);
    if (exists) {
      updatedFuel = allFuelLogs.map(f => f.id === fuelId ? newFuel : f);
    } else {
      updatedFuel = [...allFuelLogs, newFuel];
    }
    setAllFuelLogs(updatedFuel);

    let updatedVehicles = vehicles;
    let updatedSelectedVehicle = selectedVehicle;
    if (newFuel.odometer > selectedVehicle.currentOdometer) {
      updatedSelectedVehicle = {
        ...selectedVehicle,
        currentOdometer: newFuel.odometer
      };
      setSelectedVehicleState(updatedSelectedVehicle);
      updatedVehicles = vehicles.map(v => v.id === selectedVehicle.id ? updatedSelectedVehicle : v);
      setVehicles(updatedVehicles);
    }

    filterDetailsForVehicle(updatedSelectedVehicle.id, allMaintenance, updatedFuel, allAlerts);

    await db.saveFuelLog(user.uid, newFuel);
    if (updatedSelectedVehicle.currentOdometer !== selectedVehicle.currentOdometer) {
      await db.saveVehicle(user.uid, updatedSelectedVehicle);
    }
  };

  const deleteFuelLog = async (id: string) => {
    if (!user || !selectedVehicle) return;
    const updatedFuel = allFuelLogs.filter(f => f.id !== id);
    setAllFuelLogs(updatedFuel);

    filterDetailsForVehicle(selectedVehicle.id, allMaintenance, updatedFuel, allAlerts);

    await db.deleteFuelLog(user.uid, id);
  };

  // Alerts Actions
  const saveAlert = async (alertData: Omit<Alert, 'id' | 'status' | 'vehicleId'> & { id?: string; status?: 'pending' | 'completed' }) => {
    if (!user || !selectedVehicle) return;
    const alertId = alertData.id || `alert-${Date.now()}`;

    const existingAlert = allAlerts.find(a => a.id === alertId);
    const newAlert: Alert = {
      ...alertData,
      id: alertId,
      vehicleId: selectedVehicle.id,
      status: alertData.status || 'pending',
      createdAt: existingAlert?.createdAt || Timestamp.now()
    };

    let updatedAlerts: Alert[];
    const exists = allAlerts.some(a => a.id === alertId);
    if (exists) {
      updatedAlerts = allAlerts.map(a => a.id === alertId ? newAlert : a);
    } else {
      updatedAlerts = [...allAlerts, newAlert];
    }
    setAllAlerts(updatedAlerts);

    filterDetailsForVehicle(selectedVehicle.id, allMaintenance, allFuelLogs, updatedAlerts);

    await db.saveAlert(user.uid, newAlert);
  };

  const completeAlert = async (id: string) => {
    if (!user || !selectedVehicle) return;
    const targetAlert = allAlerts.find(a => a.id === id);
    if (!targetAlert) return;

    const updatedAlert: Alert = { ...targetAlert, status: 'completed' as const };
    const updatedAlerts = allAlerts.map(a => (a.id === id ? updatedAlert : a));
    setAllAlerts(updatedAlerts);

    filterDetailsForVehicle(selectedVehicle.id, allMaintenance, allFuelLogs, updatedAlerts);

    await db.saveAlert(user.uid, updatedAlert);
  };

  const deleteAlert = async (id: string) => {
    if (!user || !selectedVehicle) return;
    const updatedAlerts = allAlerts.filter(a => a.id !== id);
    setAllAlerts(updatedAlerts);

    filterDetailsForVehicle(selectedVehicle.id, allMaintenance, allFuelLogs, updatedAlerts);

    await db.deleteAlert(user.uid, id);
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      vehicles,
      selectedVehicle,
      maintenances,
      fuelLogs,
      alerts,
      login,
      register,
      logout,
      setSelectedVehicle,
      updateUserProfile,
      deleteAccount,
      loginWithGoogle,
      saveVehicle,
      updateVehicleOdometer,
      deleteVehicle,
      saveMaintenance,
      deleteMaintenance,
      saveFuelLog,
      deleteFuelLog,
      saveAlert,
      completeAlert,
      deleteAlert,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
