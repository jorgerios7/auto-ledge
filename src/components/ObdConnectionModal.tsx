import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { CustomModal } from './CustomModal';
import { TeslaButton } from './TeslaButton';
import { useObd } from '../context/ObdContext';
import { colors } from '../theme/colors';
import { Bluetooth, RefreshCw, Cpu, AlertCircle, Check, Radio } from 'lucide-react-native';

// Wrap Lucide components to prevent React 19 / TypeScript compilation issues
const BluetoothIcon = Bluetooth as React.ComponentType<any>;
const RefreshCwIcon = RefreshCw as React.ComponentType<any>;
const CpuIcon = Cpu as React.ComponentType<any>;
const AlertCircleIcon = AlertCircle as React.ComponentType<any>;
const CheckIcon = Check as React.ComponentType<any>;
const RadioIcon = Radio as React.ComponentType<any>;

interface ObdConnectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ObdConnectionModal({ visible, onClose }: ObdConnectionModalProps) {
  const {
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
    clearError,
  } = useObd();

  // Reset scan selection when the modal is opened
  useEffect(() => {
    if (visible) {
      setBluetoothMode(null);
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [visible]);

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Conectando ao adaptador...';
      case 'connected':
        return mockMode ? 'Conectado via Simulador' : 'Conectado ao Veículo';
      case 'error':
        return 'Falha na conexão';
      case 'disconnected':
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '#FFB300'; // Amber
      case 'connected':
        return colors.success; // Green
      case 'error':
        return colors.error; // Red
      case 'disconnected':
      default:
        return colors.textMuted; // Grey
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      headerTitle="Conexão OBD2 Bluetooth"
      loading={connectionStatus === 'connecting'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Status Indicator */}
        <View style={styles.statusSection}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <AlertCircleIcon size={18} color={colors.error} style={styles.errorIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>Erro OBD2</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          </View>
        )}

        {/* Connected Details Screen */}
        {connectionStatus === 'connected' ? (
          <View style={styles.connectedContent}>
            <View style={styles.successIconContainer}>
              <CheckIcon size={36} color={colors.background} />
            </View>
            <Text style={styles.connectedSubtitle}>
              {mockMode 
                ? 'Os dados do veículo estão sendo simulados para fins de demonstração.' 
                : 'Conexão ativa com o adaptador OBD2. Lendo telemetria.'}
            </Text>

            {/* Live Telemetry Summary */}
            <View style={styles.telemetrySummary}>
              <Text style={styles.summaryTitle}>Telemetria Recebida</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Odômetro:</Text>
                <Text style={styles.summaryValue}>
                  {odometer !== null ? `${odometer.toLocaleString('pt-BR')} KM` : '--'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Temp. do Motor:</Text>
                <Text style={styles.summaryValue}>
                  {coolantTemp !== null ? `${coolantTemp}°C` : '--'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Combustível:</Text>
                <Text style={styles.summaryValue}>
                  {fuelLevel !== null ? `${fuelLevel}%` : '--'}
                </Text>
              </View>
            </View>

            <TeslaButton
              title="Desconectar"
              onPress={disconnectDevice}
              variant="danger"
              style={styles.actionBtn}
            />
          </View>
        ) : (
          /* Connecting / Disconnected Screen */
          <View style={styles.disconnectedContent}>
            {connectionStatus === 'connecting' ? (
              <View style={styles.connectingContainer}>
                <ActivityIndicator size="large" color={colors.text} />
                <Text style={styles.connectingText}>Estabelecendo comunicação serial com ELM327...</Text>
              </View>
            ) : (
              <>
                {/* Mode Selector */}
                <View style={styles.modeSelector}>
                  <TouchableOpacity
                    style={[styles.modeTab, bluetoothMode === 'ble' && styles.activeModeTab]}
                    onPress={() => {
                      if (connectionStatus === 'disconnected') {
                        startScanning('ble');
                      }
                    }}
                    disabled={isScanning}
                  >
                    <Text style={[styles.modeTabText, bluetoothMode === 'ble' && styles.activeModeTabText]}>
                      Bluetooth LE (4+)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeTab, bluetoothMode === 'classic' && styles.activeModeTab]}
                    onPress={() => {
                      if (connectionStatus === 'disconnected') {
                        startScanning('classic');
                      }
                    }}
                    disabled={isScanning}
                  >
                    <Text style={[styles.modeTabText, bluetoothMode === 'classic' && styles.activeModeTabText]}>
                      Bluetooth Standard
                    </Text>
                  </TouchableOpacity>
                </View>

                {bluetoothMode === null ? (
                  <Text style={styles.helperText}>
                    Selecione uma das opções de Bluetooth acima para escanear e conectar ao seu adaptador OBD2.
                  </Text>
                ) : (
                  <Text style={styles.helperText}>
                    {bluetoothMode === 'ble'
                      ? 'Conecte o seu adaptador OBD2 ELM327 BLE na porta de diagnóstico do veículo e ligue a chave de ignição antes de iniciar o escaneamento.'
                      : 'Certifique-se de emparelhar o adaptador OBD2 clássico nas configurações de Bluetooth do celular Android e ligar a ignição antes de conectar.'}
                  </Text>
                )}

                {/* Device List Section */}
                {bluetoothMode !== null && (
                  <>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>Dispositivos Encontrados</Text>
                      {isScanning ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <TouchableOpacity onPress={() => startScanning(bluetoothMode)} style={styles.refreshBtn}>
                          <RefreshCwIcon size={14} color={colors.text} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.devicesList}>
                      {scannedDevices.length > 0 ? (
                        scannedDevices.map(device => (
                          <TouchableOpacity
                            key={device.id}
                            style={styles.deviceItem}
                            onPress={() => connectDevice(device.id, device.type)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.deviceInfo}>
                              <BluetoothIcon size={18} color={colors.text} style={styles.deviceIcon} />
                              <View>
                                <Text style={styles.deviceName}>{device.name}</Text>
                                <Text style={styles.deviceId}>{device.id}</Text>
                              </View>
                            </View>
                            {device.paired ? (
                              <View style={styles.pairedBadge}>
                                <Text style={styles.pairedText}>Pareado</Text>
                              </View>
                            ) : device.rssi !== null ? (
                              <View style={styles.rssiBadge}>
                                <RadioIcon size={10} color={colors.textMuted} style={{ marginRight: 4 }} />
                                <Text style={styles.rssiText}>{device.rssi} dBm</Text>
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyList}>
                          {isScanning ? (
                            <Text style={styles.emptyText}>
                              {bluetoothMode === 'ble'
                                ? 'Buscando adaptadores BLE por perto...'
                                : 'Buscando adaptadores clássicos por perto...'}
                            </Text>
                          ) : (
                            <Text style={styles.emptyText}>Nenhum dispositivo encontrado. Toque em escanear.</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Simulator Option */}
                <View style={styles.simulatorSection}>
                  <View style={styles.divider} />
                  <Text style={styles.simulatorText}>Não tem um adaptador OBD2 físico por perto?</Text>
                  <TeslaButton
                    title="Conectar Simulador"
                    onPress={connectSimulator}
                    variant="secondary"
                    style={styles.simulatorBtn}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(232, 33, 39, 0.08)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  connectedContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectedSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  telemetrySummary: {
    width: '100%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  disconnectedContent: {
    width: '100%',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devicesList: {
    minHeight: 120,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.surfaceCard,
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  deviceId: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  rssiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  rssiText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  simulatorSection: {
    alignItems: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: 20,
  },
  simulatorText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  simulatorBtn: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  },
  connectingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  connectingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeModeTab: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeModeTabText: {
    color: colors.text,
    fontWeight: '700',
  },
  pairedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.success,
  },
  pairedText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
