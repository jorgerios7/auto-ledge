import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Plus, Image as Wrench, Trash2, Edit2 } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaCard } from '../../../components/TeslaCard';
import { TeslaButton } from '../../../components/TeslaButton';
import { Maintenance } from '../../../types';
import { Timestamp } from 'firebase/firestore';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import Header from '../../../components/Header';
import { formatDateToDDMMYYYY } from '../../../utils/date';

interface MaintenanceListProps {
  onAddPress: () => void;
  onEditPress: (maint: Maintenance) => void;
}

export function MaintenanceList({ onAddPress, onEditPress }: MaintenanceListProps) {
  const { selectedVehicle, maintenances, deleteMaintenance } = useApp();
  const [sortBy, setSortBy] = useState<'date' | 'odometer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return '';
    try {
      const d = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp as any);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Registro',
      'Deseja realmente excluir este registro de manutenção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaintenance(id);
              ToastService.showSuccess('Registro Removido', 'O serviço de manutenção foi removido com sucesso.');
            } catch (err: any) {
              ToastService.showError('Erro ao Remover', err.message || 'Não foi possível excluir o registro.');
            }
          }
        }
      ]
    );
  };

  const sortedMaintenances = [...maintenances].sort((a, b) => {
    if (sortBy === 'date') {
      const comparison = a.date.localeCompare(b.date);
      return sortOrder === 'asc' ? comparison : -comparison;
    } else {
      const odoA = a.odometer || 0;
      const odoB = b.odometer || 0;
      const comparison = odoA - odoB;
      return sortOrder === 'asc' ? comparison : -comparison;
    }
  });

  return (
    <View style={styles.container}>
      <Header title='Manutenções' onPress={onAddPress} iconType={'Plus'} position='right_title' />

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {!selectedVehicle ? (
          <View style={styles.emptyContainer}>
            <Wrench size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Selecione ou cadastre um veículo no painel principal para ver suas manutenções.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.vehSubtitle}>{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.plate})</Text>

            {maintenances.length > 0 && (
              <View style={styles.sortContainer}>
                <View style={styles.sortGroup}>
                  <Text style={styles.sortLabel}>ORDENAR POR:</Text>
                  <TouchableOpacity
                    style={[styles.sortBtn, sortBy === 'date' && styles.sortBtnActive]}
                    onPress={() => setSortBy('date')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sortBtnText, sortBy === 'date' && styles.sortBtnTextActive]}>Data</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, sortBy === 'odometer' && styles.sortBtnActive]}
                    onPress={() => setSortBy('odometer')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sortBtnText, sortBy === 'odometer' && styles.sortBtnTextActive]}>Odômetro</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.sortOrderBtn}
                  onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sortOrderBtnText}>
                    {sortOrder === 'asc' ? 'Crescente ▲' : 'Decrescente ▼'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {sortedMaintenances.map((m) => {
              const isPreventive = m.type === 'preventive';
              return (
                <TeslaCard
                  key={m.id}
                  title={m.description}
                  subtitle={formatDateToDDMMYYYY(m.date)}
                  headerRight={
                    <View style={styles.cardHeaderRight}>
                      <View style={[
                        styles.badge,
                        isPreventive ? styles.badgePreventive : styles.badgeCorrective
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          isPreventive ? styles.badgeTextPreventive : styles.badgeTextCorrective
                        ]}>
                          {isPreventive ? 'PREVENTIVA' : 'CORRETIVA'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => onEditPress(m)} style={styles.editBtn}>
                        <Edit2 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(m.id)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  }
                >
                  <View style={styles.cardBody}>
                    <View style={styles.costRow}>
                      <View style={styles.costItem}>
                        <Text style={styles.costLabel}>Peças</Text>
                        <Text style={styles.costValue}>R$ {m.partsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      </View>
                      <View style={styles.costItem}>
                        <Text style={styles.costLabel}>Mão de Obra</Text>
                        <Text style={styles.costValue}>R$ {m.laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      </View>
                      <View style={[styles.costItem, styles.costItemTotal]}>
                        <Text style={styles.costLabelTotal}>Total</Text>
                        <Text style={styles.costValueTotal}>R$ {m.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      </View>
                    </View>

                    {m.partsDetail ? (
                      <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>PEÇAS E DETALHES:</Text>
                        <Text style={styles.detailText}>{m.partsDetail}</Text>
                      </View>
                    ) : null}

                    {m.odometer ? (
                      <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>ODÔMETRO NO SERVIÇO:</Text>
                        <Text style={styles.detailText}>{m.odometer.toLocaleString('pt-BR')} KM</Text>
                      </View>
                    ) : null}

                    {m.attachmentUri ? (
                      <View style={styles.attachmentBox}>
                        <Text style={styles.detailLabel}>NF / RECIBO ANEXADO:</Text>
                        <Image source={{ uri: m.attachmentUri }} style={styles.attachmentThumb} />
                      </View>
                    ) : null}

                    {m.timestamps?.createdAt && (
                      <View style={styles.detailBox}>
                        <Text style={styles.timestampText}>
                          Criado: {formatTimestamp(m.timestamps.createdAt)}
                          {m.timestamps.updatedAt ? ` • Editado: ${formatTimestamp(m.timestamps.updatedAt)}` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </TeslaCard>
              );
            })}

            {maintenances.length === 0 && (
              <View style={styles.emptyContainer}>
                <Wrench size={48} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>Nenhuma manutenção registrada para este veículo.</Text>
                <TeslaButton
                  title="Registrar Primeira Manutenção"
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
