import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Plus, Droplet, Trash2, TrendingUp } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaCard } from '../../../components/TeslaCard';
import { TeslaButton } from '../../../components/TeslaButton';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import Header from '../../../components/Header';
import { formatDateToDDMMYYYY } from '../../../utils/date';

interface FuelListProps {
  onAddPress: () => void;
}

export function FuelList({ onAddPress }: FuelListProps) {
  const { selectedVehicle, fuelLogs, deleteFuelLog } = useApp();

  const isElectric = selectedVehicle?.fuelType === 'Elétrico';
  const unitLabel = isElectric ? 'kWh' : 'L';
  const efficiencyUnit = isElectric ? 'km/kWh' : 'km/L';

  const handleDelete = (id: string) => {
    const recordLabel = isElectric ? 'Recarga' : 'Abastecimento';
    Alert.alert(
      isElectric ? 'Excluir Recarga' : 'Excluir Abastecimento',
      'Deseja realmente excluir este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFuelLog(id);
              ToastService.showSuccess('Registro Removido', `O registro de ${recordLabel.toLowerCase()} foi excluído.`);
            } catch (err: any) {
              ToastService.showError('Erro ao Remover', err.message || 'Não foi possível excluir o registro.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title={isElectric ? 'Recargas' : 'Combustível'} onPress={onAddPress} iconType={'Plus'} position='right_title' />

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {!selectedVehicle ? (
          <View style={styles.emptyContainer}>
            <Droplet size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Selecione ou cadastre um veículo no painel principal para ver o controle de abastecimento.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.vehSubtitle}>{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.plate})</Text>

            {fuelLogs.map((log, index) => {
              // Calculate consumption between logs
              let consumptionText = null;
              const prevLog = fuelLogs[index + 1]; // fuelLogs is sorted descending, so index + 1 is the previous chronological log
              if (prevLog) {
                const distanceDiff = log.odometer - prevLog.odometer;
                if (distanceDiff > 0 && log.liters > 0) {
                  const rate = distanceDiff / log.liters;
                  consumptionText = `${rate.toFixed(1)} ${efficiencyUnit} • Rodou ${distanceDiff} km`;
                }
              }

              const costPerUnit = log.liters > 0 ? log.totalCost / log.liters : 0;

              return (
                <TeslaCard
                  key={log.id}
                  title={`${log.liters.toLocaleString('pt-BR')} ${unitLabel}`}
                  subtitle={formatDateToDDMMYYYY(log.date)}
                  headerRight={
                    <View style={styles.cardHeaderRight}>
                      <Text style={styles.totalCostText}>R$ {log.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      <TouchableOpacity onPress={() => handleDelete(log.id)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  }
                >
                  <View style={styles.cardBody}>
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>ODÔMETRO</Text>
                        <Text style={styles.detailValue}>{log.odometer.toLocaleString('pt-BR')} KM</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{isElectric ? 'R$ / kWh' : 'R$ / Litro'}</Text>
                        <Text style={styles.detailValue}>R$ {costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      </View>
                    </View>

                    {consumptionText && (
                      <View style={styles.efficiencyBox}>
                        <TrendingUp size={14} color={colors.error} style={{ marginRight: 6 }} />
                        <Text style={styles.efficiencyText}>{consumptionText}</Text>
                      </View>
                    )}
                  </View>
                </TeslaCard>
              );
            })}

            {fuelLogs.length === 0 && (
              <View style={styles.emptyContainer}>
                <Droplet size={48} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>Nenhum registro de abastecimento para este veículo.</Text>
                <TeslaButton
                  title={isElectric ? 'Registrar Recarga' : 'Registrar Abastecimento'}
                  onPress={onAddPress}
                  variant="outline"
                  style={{ marginTop: 24, width: '100%' }}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
