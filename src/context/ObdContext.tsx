import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform, DeviceEventEmitter } from 'react-native';
import { useApp } from './AppContext';
import { base64Encode, base64Decode } from '../utils/base64';

export type ObdConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ObdDevice {
  id: string;
  name: string;
  rssi: number | null;
  type: 'ble' | 'classic';
  paired?: boolean;
}

export interface ObdTelemetry {
  coolantTemp: number | null;
  fuelLevel: number | null;
  odometer: number | null;
}

interface ObdContextType {
  connectionStatus: ObdConnectionStatus;
  scannedDevices: ObdDevice[];
  isScanning: boolean;
  coolantTemp: number | null;
  fuelLevel: number | null;
  odometer: number | null;
  mockMode: boolean;
  errorMessage: string | null;
  bluetoothMode: 'ble' | 'classic' | null;
  setBluetoothMode: (mode: 'ble' | 'classic' | null) => void;
  startScanning: (mode?: 'ble' | 'classic' | null) => Promise<void>;
  stopScanning: () => void;
  connectDevice: (deviceId: string, type?: 'ble' | 'classic') => Promise<void>;
  disconnectDevice: () => Promise<void>;
  connectSimulator: () => void;
  clearError: () => void;
}

const ObdContext = createContext<ObdContextType | undefined>(undefined);

// Safe BleManager dynamic load to prevent Expo Go crashes
let BleManagerClass: any = null;
try {
  BleManagerClass = require('react-native-ble-plx').BleManager;
} catch (error) {
  console.log('react-native-ble-plx native module not found. Run in custom dev build for native BLE.');
}

// Safe RNBluetoothClassic dynamic load to prevent Expo Go crashes
let RNBluetoothClassic: any = null;
try {
  RNBluetoothClassic = require('react-native-bluetooth-classic').default;
} catch (error) {
  console.log('react-native-bluetooth-classic native module not found. Run in custom dev build for Classic.');
}

export const ObdProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedVehicle, updateVehicleOdometer } = useApp();

  // Connection states
  const [connectionStatus, setConnectionStatus] = useState<ObdConnectionStatus>('disconnected');
  const [scannedDevices, setScannedDevices] = useState<ObdDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState<boolean>(false);
  const [bluetoothMode, setBluetoothMode] = useState<'ble' | 'classic' | null>(null);

  // Telemetry states
  const [coolantTemp, setCoolantTemp] = useState<number | null>(null);
  const [fuelLevel, setFuelLevel] = useState<number | null>(null);
  const [odometer, setOdometer] = useState<number | null>(null);

  // Native BLE references
  const bleManagerRef = useRef<any>(null);
  const connectedDeviceRef = useRef<any>(null);
  const txCharacteristicRef = useRef<any>(null);
  const rxCharacteristicRef = useRef<any>(null);

  // Native Classic Bluetooth references
  const connectedDeviceTypeRef = useRef<'ble' | 'classic' | null>(null);
  const classicDiscoverySubRef = useRef<any>(null);

  // Buffer and messaging refs
  const readBufferRef = useRef<string>('');
  const pendingCommandResolverRef = useRef<((value: string) => void) | null>(null);
  const pendingCommandRef = useRef<string | null>(null);

  // Polling / simulation timers
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for tracking variables in callbacks
  const connectionStatusRef = useRef<ObdConnectionStatus>('disconnected');
  const mockModeRef = useRef<boolean>(false);
  const selectedVehicleRef = useRef<any>(null);

  // Consecutive command timeout counter — stops runaway polling
  const consecutiveTimeoutsRef = useRef<number>(0);
  const MAX_CONSECUTIVE_TIMEOUTS = 5;

  // Sync refs
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  useEffect(() => {
    mockModeRef.current = mockMode;
  }, [mockMode]);

  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  // Instantiate BleManager once on mount if available
  useEffect(() => {
    if (BleManagerClass && !bleManagerRef.current) {
      try {
        bleManagerRef.current = new BleManagerClass();
      } catch (err) {
        console.warn('Failed to initialize BleManager:', err);
      }
    }

    return () => {
      // Cleanup timers
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (mockTimerRef.current) clearTimeout(mockTimerRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      
      // Stop scanner if active
      if (bleManagerRef.current) {
        try {
          bleManagerRef.current.stopDeviceScan();
        } catch (e) {}
      }

      // Stop Classic discovery if active
      if (classicDiscoverySubRef.current) {
        try {
          classicDiscoverySubRef.current.remove();
        } catch (e) {}
        classicDiscoverySubRef.current = null;
      }
      
      if (RNBluetoothClassic) {
        try {
          RNBluetoothClassic.cancelDiscovery();
        } catch (e) {}
      }
    };
  }, []);

  const clearError = () => setErrorMessage(null);

  // Android BLE permissions requesting flow
  const requestAndroidPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;

    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      if (apiLevel >= 31) {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
          );
        } catch (err) {
          console.error('Failed to request Android 12+ permissions:', err);
          return false;
        }
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.error('Failed to request Android location permission:', err);
          return false;
        }
      }
    }
    return false;
  };

  const startScanning = async (mode: 'ble' | 'classic' | null = bluetoothMode) => {
    if (!mode) return;
    setBluetoothMode(mode);
    setErrorMessage(null);
    setScannedDevices([]);

    const permissionsGranted = await requestAndroidPermissions();
    if (!permissionsGranted) {
      setErrorMessage('Permissões de Bluetooth necessárias não foram concedidas.');
      setConnectionStatus('error');
      return;
    }

    if (mode === 'ble') {
      if (!bleManagerRef.current) {
        setErrorMessage('Módulo Bluetooth LE indisponível (Expo Go). Conecte ao simulador para testar.');
        setConnectionStatus('error');
        return;
      }

      setIsScanning(true);

      try {
        // Start BLE Scan
        bleManagerRef.current.startDeviceScan(null, null, (error: any, device: any) => {
          if (error) {
            console.error('BLE device scan error:', error);
            setIsScanning(false);
            setErrorMessage('Erro ao escanear: ' + error.message);
            return;
          }

          if (device) {
            setScannedDevices(prev => {
              const existing = prev.find(d => d.id === device.id);
              const discoveredName = device.name || device.localName;
              
              // Caches the name: keeps any found name and prevents overwriting it with null
              let finalName = 'Dispositivo sem nome';
              if (discoveredName) {
                finalName = discoveredName;
              } else if (existing && existing.name !== 'Dispositivo sem nome') {
                finalName = existing.name;
              }

              const newDevice: ObdDevice = { 
                id: device.id, 
                name: finalName, 
                rssi: device.rssi, 
                type: 'ble' 
              };

              if (existing) {
                return prev.map(d => d.id === device.id ? newDevice : d);
              }
              return [...prev, newDevice];
            });
          }
        });

        // Stop scan after 10 seconds automatically
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          stopScanning();
        }, 10000);

      } catch (err: any) {
        console.error('Failed to start BLE scanning:', err);
        setIsScanning(false);
        setErrorMessage('Falha ao escanear: ' + err.message);
      }
    } else {
      if (!RNBluetoothClassic) {
        setErrorMessage('Módulo Bluetooth Classic indisponível (Expo Go). Conecte ao simulador para testar.');
        setConnectionStatus('error');
        return;
      }

      setIsScanning(true);

      try {
        // 1. Get bonded (paired) devices immediately
        const bonded = await RNBluetoothClassic.getBondedDevices();
        const pairedDevices: ObdDevice[] = bonded.map((dev: any) => ({
          id: dev.address.toUpperCase(),
          name: dev.name || 'Dispositivo Pareado',
          rssi: null,
          type: 'classic',
          paired: true
        }));
        setScannedDevices(pairedDevices);

        // 2. Add real-time listener for unpaired devices
        if (classicDiscoverySubRef.current) {
          classicDiscoverySubRef.current.remove();
        }
        classicDiscoverySubRef.current = DeviceEventEmitter.addListener(
          'onDeviceDiscovered',
          (event: any) => {
            if (event && event.device) {
              const dev = event.device;
              const upperAddress = dev.address.toUpperCase();
              setScannedDevices(prev => {
                const existing = prev.find(d => d.id === upperAddress);
                if (existing) {
                  return prev.map(d => d.id === upperAddress ? { ...d, name: dev.name || d.name } : d);
                }
                return [...prev, {
                  id: upperAddress,
                  name: dev.name || 'Dispositivo sem nome',
                  rssi: dev.rssi || null,
                  type: 'classic',
                  paired: false
                }];
              });
            }
          }
        );

        // 3. Start discovery (Android Classic scan)
        RNBluetoothClassic.startDiscovery().then(() => {
          setIsScanning(false);
          if (classicDiscoverySubRef.current) {
            classicDiscoverySubRef.current.remove();
            classicDiscoverySubRef.current = null;
          }
        }).catch((err: any) => {
          console.warn('Classic discovery finished with error:', err);
          setIsScanning(false);
          if (classicDiscoverySubRef.current) {
            classicDiscoverySubRef.current.remove();
            classicDiscoverySubRef.current = null;
          }
        });

      } catch (err: any) {
        console.error('Failed to start Classic scanning:', err);
        setIsScanning(false);
        if (classicDiscoverySubRef.current) {
          classicDiscoverySubRef.current.remove();
          classicDiscoverySubRef.current = null;
        }
        setErrorMessage('Falha ao escanear: ' + err.message);
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    
    // Stop BLE
    if (bleManagerRef.current) {
      try {
        bleManagerRef.current.stopDeviceScan();
      } catch (e) {}
    }

    // Stop Classic
    if (classicDiscoverySubRef.current) {
      try {
        classicDiscoverySubRef.current.remove();
      } catch (e) {}
      classicDiscoverySubRef.current = null;
    }
    if (RNBluetoothClassic) {
      try {
        RNBluetoothClassic.cancelDiscovery();
      } catch (e) {}
    }
  };

  // Base64 helper writing
  const sendObdCommand = (cmd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!connectedDeviceRef.current) {
        return reject(new Error('Dispositivo OBD2 não conectado.'));
      }

      const formattedCommand = cmd.endsWith('\r') ? cmd : cmd + '\r';
      pendingCommandRef.current = cmd;
      pendingCommandResolverRef.current = resolve;
      readBufferRef.current = '';

      // Command timeout (2.5 seconds)
      const timeout = setTimeout(() => {
        if (pendingCommandResolverRef.current === resolve) {
          consecutiveTimeoutsRef.current += 1;
          console.warn(`OBD2 Command timeout: ${cmd} (${consecutiveTimeoutsRef.current}/${MAX_CONSECUTIVE_TIMEOUTS})`);
          pendingCommandResolverRef.current = null;
          pendingCommandRef.current = null;
          resolve(''); // Resolve empty to continue the poll cycle without crashing
        }
      }, 2500);

      if (connectedDeviceTypeRef.current === 'ble') {
        if (!txCharacteristicRef.current) {
          clearTimeout(timeout);
          return reject(new Error('Canal de escrita BLE não disponível.'));
        }

        const base64Val = base64Encode(formattedCommand);

        const writeBle = async () => {
          try {
            const char = txCharacteristicRef.current;
            await connectedDeviceRef.current.writeCharacteristicWithoutResponseForService(
              char.serviceUUID,
              char.uuid,
              base64Val
            );
          } catch (error) {
            try {
              // Fallback to write with response if write without response fails
              const char = txCharacteristicRef.current;
              await connectedDeviceRef.current.writeCharacteristicWithResponseForService(
                char.serviceUUID,
                char.uuid,
                base64Val
              );
            } catch (err: any) {
              console.error('Failed to write characteristic:', err);
              clearTimeout(timeout);
              if (pendingCommandResolverRef.current === resolve) {
                pendingCommandResolverRef.current = null;
                pendingCommandRef.current = null;
                reject(new Error('Falha ao enviar comando para o adaptador: ' + err.message));
              }
            }
          }
        };

        writeBle();
      } else {
        // Classic mode
        const writeClassic = async () => {
          try {
            await connectedDeviceRef.current.write(formattedCommand);

            // Poll for response (read until '>' or '?')
            let response = '';
            const startTime = Date.now();
            const timeoutMs = 2500;

            while (Date.now() - startTime < timeoutMs) {
              if (!connectedDeviceRef.current) {
                break;
              }

              const available = await connectedDeviceRef.current.available();
              if (available > 0) {
                const chunk = await connectedDeviceRef.current.read();
                let chunkStr = '';
                if (typeof chunk === 'string') {
                  chunkStr = chunk;
                } else if (chunk && typeof chunk === 'object' && typeof chunk.data === 'string') {
                  chunkStr = chunk.data;
                } else if (chunk && typeof chunk === 'object' && typeof chunk.message === 'string') {
                  chunkStr = chunk.message;
                }

                response += chunkStr;
                if (response.includes('>') || response.includes('?')) {
                  break;
                }
              }
              // Wait 50ms before checking again
              await new Promise(r => setTimeout(r, 50));
            }

            clearTimeout(timeout);
            if (pendingCommandResolverRef.current === resolve) {
              consecutiveTimeoutsRef.current = 0; // Reset on successful read
              pendingCommandResolverRef.current = null;
              pendingCommandRef.current = null;
              resolve(response);
            }
          } catch (err: any) {
            console.error('Failed to communicate with Classic Bluetooth device:', err);
            clearTimeout(timeout);
            if (pendingCommandResolverRef.current === resolve) {
              pendingCommandResolverRef.current = null;
              pendingCommandRef.current = null;
              reject(new Error('Falha ao enviar comando para o adaptador: ' + err.message));
            }
          }
        };

        writeClassic();
      }
    });
  };

  // Process data from notifications
  const handleIncomingData = (data: string) => {
    readBufferRef.current += data;

    // ELM327 responds with '>' or '?' when command has finished executing
    if (readBufferRef.current.includes('>') || readBufferRef.current.includes('?')) {
      if (pendingCommandResolverRef.current) {
        consecutiveTimeoutsRef.current = 0; // Reset on successful BLE response
        pendingCommandResolverRef.current(readBufferRef.current);
        pendingCommandResolverRef.current = null;
        pendingCommandRef.current = null;
      }
      readBufferRef.current = '';
    }
  };

  // Parser helper
  const parseObdResponse = (command: string, response: string): number | null => {
    // Remove space, carriage returns and prompt character
    const clean = response.replace(/[\s\r\n>]/g, '').toUpperCase();

    if (command === '0105') { // Coolant temperature
      const index = clean.indexOf('4105');
      if (index !== -1 && clean.length >= index + 6) {
        const hex = clean.substring(index + 4, index + 6);
        const dec = parseInt(hex, 16);
        return isNaN(dec) ? null : dec - 40;
      }
    } else if (command === '012F') { // Fuel level
      const index = clean.indexOf('412F');
      if (index !== -1 && clean.length >= index + 6) {
        const hex = clean.substring(index + 4, index + 6);
        const dec = parseInt(hex, 16);
        return isNaN(dec) ? null : Math.round((dec * 100) / 255);
      }
    } else if (command === '01A6') { // Odometer (4 bytes)
      const index = clean.indexOf('41A6');
      if (index !== -1 && clean.length >= index + 12) {
        const hex = clean.substring(index + 4, index + 12);
        const dec = parseInt(hex, 16);
        return isNaN(dec) ? null : dec;
      }
    } else if (command === '0131') { // Fallback distance traveled
      const index = clean.indexOf('4131');
      if (index !== -1 && clean.length >= index + 8) {
        const hex = clean.substring(index + 4, index + 8);
        const dec = parseInt(hex, 16);
        return isNaN(dec) ? null : dec;
      }
    }

    return null;
  };

  // Device telemetry polling recursive loop
  const pollTelemetry = async () => {
    if (connectionStatusRef.current !== 'connected' || mockModeRef.current) return;

    // Stop polling if the device is not responding
    if (consecutiveTimeoutsRef.current >= MAX_CONSECUTIVE_TIMEOUTS) {
      console.warn(`OBD2: ${MAX_CONSECUTIVE_TIMEOUTS} timeouts consecutivos. Desconectando dispositivo.`);
      disconnectDevice();
      setErrorMessage('Dispositivo OBD2 não está respondendo. Verifique a conexão e tente novamente.');
      setConnectionStatus('error');
      return;
    }

    try {
      // 1. Poll temperature
      const tempRes = await sendObdCommand('0105');
      if (connectionStatusRef.current !== 'connected') return; // Guard after async call
      const temp = parseObdResponse('0105', tempRes);
      if (temp !== null) setCoolantTemp(temp);

      // 2. Poll fuel
      const fuelRes = await sendObdCommand('012F');
      if (connectionStatusRef.current !== 'connected') return;
      const fuel = parseObdResponse('012F', fuelRes);
      if (fuel !== null) setFuelLevel(fuel);

      // 3. Poll odometer (PID 01A6)
      const odoRes = await sendObdCommand('01A6');
      if (connectionStatusRef.current !== 'connected') return;
      let odo = parseObdResponse('01A6', odoRes);

      // 4. Fallback odometer (PID 0131)
      if (odo === null) {
        const fallbackRes = await sendObdCommand('0131');
        if (connectionStatusRef.current !== 'connected') return;
        odo = parseObdResponse('0131', fallbackRes);
      }

      if (odo !== null) {
        setOdometer(odo);
        
        // Save currentOdometer to DB if higher than existing
        const activeVeh = selectedVehicleRef.current;
        if (activeVeh && odo > activeVeh.currentOdometer) {
          const lastSavedInt = Math.floor(activeVeh.currentOdometer);
          const currentOdoInt = Math.floor(odo);

          // Optimize firestore write: write only when integer odometer changes
          if (currentOdoInt > lastSavedInt) {
            updateVehicleOdometer(activeVeh.id, currentOdoInt);
          }
        }
      }
    } catch (err: any) {
      console.warn('Telemetry polling error:', err);
    }

    // Schedule next loop only if still connected and device is responding
    if (connectionStatusRef.current === 'connected' && !mockModeRef.current) {
      pollTimerRef.current = setTimeout(pollTelemetry, 3000);
    }
  };

  // Initialize ELM327 protocol configuration
  const initializeElm327 = async (): Promise<boolean> => {
    try {
      // ATZ: Reset
      await sendObdCommand('ATZ');
      await new Promise(r => setTimeout(r, 500));
      
      // ATE0: Echo Off
      await sendObdCommand('ATE0');
      
      // ATH0: Headers Off
      await sendObdCommand('ATH0');
      
      // ATL0: Linefeeds Off
      await sendObdCommand('ATL0');
      
      // ATSP0: Protocol Select Auto
      await sendObdCommand('ATSP0');
      
      return true;
    } catch (err) {
      console.error('ELM327 init protocol failed:', err);
      return false;
    }
  };

  const connectDevice = async (deviceId: string, type: 'ble' | 'classic' = 'ble') => {
    stopScanning();
    setErrorMessage(null);
    setConnectionStatus('connecting');
    setMockMode(false);
    connectedDeviceTypeRef.current = type;
    consecutiveTimeoutsRef.current = 0; // Reset timeout counter on new connection attempt

    if (type === 'ble') {
      if (!bleManagerRef.current) {
        setErrorMessage('Módulo Bluetooth LE inacessível.');
        setConnectionStatus('error');
        return;
      }

      try {
        // 1. Connect
        const device = await bleManagerRef.current.connectToDevice(deviceId);
        connectedDeviceRef.current = device;

        // 2. Discover
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();
        
        let foundTx: any = null;
        let foundRx: any = null;

        // Scan all characteristics for a communication channel
        for (const service of services) {
          const characteristics = await device.characteristicsForService(service.uuid);
          for (const char of characteristics) {
            // Check notify/indicate properties for RX
            if (char.isNotifiable || char.isIndicatable) {
              foundRx = char;
            }
            // Check write properties for TX
            if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
              foundTx = char;
            }
            
            if (foundRx && foundTx) break;
          }
          if (foundRx && foundTx) break;
        }

        if (!foundRx || !foundTx) {
          throw new Error('Não foi possível identificar os canais TX/RX no adaptador.');
        }

        txCharacteristicRef.current = foundTx;
        rxCharacteristicRef.current = foundRx;

        // 3. Monitor notifications (RX Channel)
        device.monitorCharacteristicForService(
          foundRx.serviceUUID,
          foundRx.uuid,
          (error: any, char: any) => {
            if (error) {
              console.error('BLE notification channel error:', error);
              // Handle active disconnect
              disconnectDevice();
              setErrorMessage('Conexão perdida com o dispositivo.');
              setConnectionStatus('error');
              return;
            }
            if (char?.value) {
              const rawText = base64Decode(char.value);
              handleIncomingData(rawText);
            }
          }
        );

        // 4. Initialize protocol
        const initOk = await initializeElm327();
        if (!initOk) {
          throw new Error('Falha ao configurar comandos AT do adaptador ELM327.');
        }

        setConnectionStatus('connected');
        
        // Start polling
        pollTimerRef.current = setTimeout(pollTelemetry, 500);

      } catch (err: any) {
        console.error('BLE connection failed:', err);
        setConnectionStatus('error');
        setErrorMessage(err.message || 'Erro ao conectar ao adaptador OBD2 BLE.');
        
        if (connectedDeviceRef.current) {
          try {
            await connectedDeviceRef.current.cancelConnection();
          } catch (e) {}
          connectedDeviceRef.current = null;
        }
      }
    } else {
      // Classic Mode
      if (!RNBluetoothClassic) {
        setErrorMessage('Módulo Bluetooth Classic inacessível.');
        setConnectionStatus('error');
        return;
      }

      try {
        // 1. Connect
        const device = await RNBluetoothClassic.connectToDevice(deviceId, {
          connectorType: 'rfcomm',
          connectionType: 'delimited',
          delimiter: '\r',
          secure: true
        });
        connectedDeviceRef.current = device;

        // 2. Initialize protocol
        const initOk = await initializeElm327();
        if (!initOk) {
          throw new Error('Falha ao configurar comandos AT do adaptador ELM327.');
        }

        setConnectionStatus('connected');
        
        // Start polling
        pollTimerRef.current = setTimeout(pollTelemetry, 500);

      } catch (err: any) {
        console.error('Classic connection failed:', err);
        setConnectionStatus('error');
        setErrorMessage(err.message || 'Erro ao conectar ao adaptador OBD2 Bluetooth.');
        
        if (connectedDeviceRef.current) {
          try {
            await connectedDeviceRef.current.disconnect();
          } catch (e) {}
          connectedDeviceRef.current = null;
        }
      }
    }
  };

  // Simulator / Demonstration connection Mode
  const connectSimulator = () => {
    stopScanning();
    setErrorMessage(null);
    setConnectionStatus('connecting');
    
    // Simulate connection lag
    setTimeout(() => {
      setMockMode(true);
      setConnectionStatus('connected');
      
      // Baseline values
      const initialOdometer = selectedVehicleRef.current?.currentOdometer || 84250;
      let currentTemp = 72; // Start cooler
      let currentFuel = 76; // Start stable fuel
      let currentOdometer = initialOdometer;

      setCoolantTemp(currentTemp);
      setFuelLevel(currentFuel);
      setOdometer(currentOdometer);

      const runSimulation = () => {
        if (connectionStatusRef.current !== 'connected' || !mockModeRef.current) return;

        // Fluctuates temperature towards standard 90 C
        if (currentTemp < 88) {
          currentTemp += Math.floor(Math.random() * 3) + 1;
        } else {
          currentTemp = Math.round(89 + Math.sin(Date.now() / 20000) * 2);
        }
        setCoolantTemp(currentTemp);

        // Very slowly drops fuel level to show dynamic behavior
        currentFuel = Math.max(0, Number((currentFuel - 0.005).toFixed(3)));
        setFuelLevel(Math.round(currentFuel));

        // Increases odometer by 0.1 KM every simulation tick
        currentOdometer = Number((currentOdometer + 0.1).toFixed(2));
        setOdometer(currentOdometer);

        const activeVeh = selectedVehicleRef.current;
        if (activeVeh) {
          const lastSavedInt = Math.floor(activeVeh.currentOdometer);
          const currentOdoInt = Math.floor(currentOdometer);

          // Sincroniza com o Firebase quando o odômetro muda de número inteiro (KM cheio)
          if (currentOdoInt > lastSavedInt) {
            updateVehicleOdometer(activeVeh.id, currentOdoInt);
          }
        }

        mockTimerRef.current = setTimeout(runSimulation, 2500);
      };

      mockTimerRef.current = setTimeout(runSimulation, 2500);
    }, 1500);
  };

  const disconnectDevice = async () => {
    // Clear simulation / polling loops
    if (mockTimerRef.current) {
      clearTimeout(mockTimerRef.current);
      mockTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    // Disconnect device
    if (connectedDeviceRef.current) {
      try {
        if (connectedDeviceTypeRef.current === 'ble') {
          await connectedDeviceRef.current.cancelConnection();
        } else if (connectedDeviceTypeRef.current === 'classic') {
          await connectedDeviceRef.current.disconnect();
        }
      } catch (err) {
        console.warn('Failed to disconnect device:', err);
      }
      connectedDeviceRef.current = null;
    }

    connectedDeviceTypeRef.current = null;
    setConnectionStatus('disconnected');
    setMockMode(false);
    setCoolantTemp(null);
    setFuelLevel(null);
    setOdometer(null);
    setErrorMessage(null);
  };

  return (
    <ObdContext.Provider
      value={{
        connectionStatus,
        scannedDevices,
        isScanning,
        coolantTemp,
        fuelLevel,
        odometer,
        mockMode,
        errorMessage,
        bluetoothMode,
        setBluetoothMode,
        startScanning,
        stopScanning,
        connectDevice,
        disconnectDevice,
        connectSimulator,
        clearError
      }}
    >
      {children}
    </ObdContext.Provider>
  );
};

export const useObd = () => {
  const context = useContext(ObdContext);
  if (context === undefined) {
    throw new Error('useObd must be used within an ObdProvider');
  }
  return context;
};
