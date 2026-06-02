import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Trash2, Car } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaCard } from '../../../components/TeslaCard';
import { TeslaButton } from '../../../components/TeslaButton';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import Header from '../../../components/Header';

interface VehicleListProps {
  onAddPress: () => void;
}

export function VehicleList({ onAddPress }: VehicleListProps) {
  const { vehicles, selectedVehicle, setSelectedVehicle, deleteVehicle } = useApp();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Excluir Veículo',
      `Tem certeza que deseja excluir o ${name}? Isso apagará permanentemente todo o histórico de manutenções, abastecimentos e alertas deste carro.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(id);
              ToastService.showSuccess('Veículo Removido', `${name} foi removido com sucesso da garagem.`);
            } catch (err: any) {
              ToastService.showError('Erro ao Remover', err.message || 'Houve um problema ao excluir o veículo.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title='Garagem' onPress={onAddPress} iconType={'Plus'} position='right_title' />

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {vehicles.map((veh) => {
          const isSelected = selectedVehicle?.id === veh.id;
          return (
            <TeslaCard
              key={veh.id}
              borderAccent={isSelected}
              headerRight={
                <TouchableOpacity
                  onPress={() => handleDelete(veh.id, `${veh.brand} ${veh.model}`)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              <TouchableOpacity onPress={() => setSelectedVehicle(veh)} activeOpacity={0.9} style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.vehPlate}>{veh.plate}</Text>
                  <Text style={styles.vehName}>{veh.brand} {veh.model}</Text>
                  <Text style={styles.vehMeta}>
                    {veh.engine} • {veh.fuelType}
                  </Text>
                </View>
                <View style={styles.cardOdoContainer}>
                  <Text style={styles.cardOdo}>{veh.currentOdometer.toLocaleString('pt-BR')}</Text>
                  <Text style={styles.cardOdoUnit}>KM</Text>
                </View>
              </TouchableOpacity>
            </TeslaCard>
          );
        })}

        {vehicles.length === 0 && (
          <View style={styles.emptyContainer}>
            <Car size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Você ainda não possui veículos cadastrados.</Text>
            <TeslaButton
              title="Cadastrar Primeiro Veículo"
              onPress={onAddPress}
              variant="outline"
              style={{ marginTop: 24, width: '100%' }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
