import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert
} from 'react-native';
import { Plus, Bell, Trash2, Check, AlertTriangle, Wrench } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaCard } from '../../../components/TeslaCard';
import { TeslaButton } from '../../../components/TeslaButton';
import { Alert } from '../../../types';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import Header from '../../../components/Header';

interface AlertListProps {
  onAddPress: () => void;
}

export function AlertList({ onAddPress }: AlertListProps) {
  const { selectedVehicle, alerts, maintenances, completeAlert, deleteAlert } = useApp();
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const handleDelete = (id: string) => {
    RNAlert.alert(
      'Excluir Alerta',
      'Deseja excluir este lembrete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlert(id);
              ToastService.showSuccess('Alerta Removido', 'O lembrete foi removido com sucesso.');
            } catch (err: any) {
              ToastService.showError('Erro ao Remover', err.message || 'Não foi possível excluir o lembrete.');
            }
          }
        }
      ]
    );
  };

  const handleComplete = (id: string) => {
    RNAlert.alert(
      'Concluir Lembrete',
      'Deseja marcar este lembrete como concluído?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          onPress: async () => {
            try {
              await completeAlert(id);
              ToastService.showSuccess('Alerta Concluído', 'O lembrete foi marcado como resolvido!');
            } catch (err: any) {
              ToastService.showError('Erro ao Concluir', err.message || 'Não foi possível concluir o lembrete.');
            }
          }
        }
      ]
    );
  };

  // Helper function to check if a pending alert is close or overdue
  const isAlertCritical = (alert: Alert) => {
    if (alert.status === 'completed' || !selectedVehicle) return false;

    if (alert.type === 'odometer' && alert.targetOdometer) {
      const diff = alert.targetOdometer - selectedVehicle.currentOdometer;
      return diff <= 500; // Overdue or within 500km
    }

    if (alert.type === 'date' && alert.targetDate) {
      const targetTime = new Date(alert.targetDate).getTime();
      const currentTime = new Date().getTime();
      const diffDays = (targetTime - currentTime) / (1000 * 60 * 60 * 24);
      return diffDays <= 7; // Overdue or within 7 days
    }

    return false;
  };

  const filteredAlerts = alerts
    .filter(a => a.status === filter)
    .sort((a, b) => {
      // Sort critical alerts first if pending
      if (filter === 'pending') {
        const aCrit = isAlertCritical(a);
        const bCrit = isAlertCritical(b);
        if (aCrit && !bCrit) return -1;
        if (!aCrit && bCrit) return 1;
      }
      return 0;
    });

  return (
    <View style={styles.container}>
      <Header onPress={onAddPress} title="Alertas" iconType="Plus" position="right_title" />

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {!selectedVehicle ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Selecione ou cadastre um veículo no painel principal para ver seus alertas.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.vehSubtitle}>{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.plate})</Text>

            {/* Filter Toggle */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
                onPress={() => setFilter('pending')}
              >
                <Text style={[styles.filterBtnText, filter === 'pending' && styles.filterBtnTextActive]}>
                  Pendentes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, filter === 'completed' && styles.filterBtnActive]}
                onPress={() => setFilter('completed')}
              >
                <Text style={[styles.filterBtnText, filter === 'completed' && styles.filterBtnTextActive]}>
                  Concluídos
                </Text>
              </TouchableOpacity>
            </View>

            {filteredAlerts.map((alert) => {
              const isCritical = isAlertCritical(alert);
              const isPending = alert.status === 'pending';
              const linkedMaint = alert.maintenanceId ? maintenances.find(m => m.id === alert.maintenanceId) : null;

              return (
                <TeslaCard
                  key={alert.id}
                  title={alert.title}
                  borderAccent={isCritical && isPending}
                  headerRight={
                    <View style={styles.cardHeaderRight}>
                      {isPending ? (
                        <TouchableOpacity
                          onPress={() => handleComplete(alert.id)}
                          style={styles.completeBtn}
                        >
                          <Check size={16} color={colors.text} />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={() => handleDelete(alert.id)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  }
                >
                  <View style={styles.alertCardBody}>
                    <View style={styles.triggerInfo}>
                      {alert.type === 'odometer' ? (
                        <View style={styles.triggerRow}>
                          <Text style={styles.triggerLabel}>KM ALVO:</Text>
                          <Text style={styles.triggerValue}>{alert.targetOdometer?.toLocaleString('pt-BR')} KM</Text>
                        </View>
                      ) : (
                        <View style={styles.triggerRow}>
                          <Text style={styles.triggerLabel}>DATA ALVO:</Text>
                          <Text style={styles.triggerValue}>{alert.targetDate}</Text>
                        </View>
                      )}
                    </View>

                    {linkedMaint && (
                      <View style={styles.linkedMaintContainer}>
                        <Wrench size={12} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.linkedMaintText}>
                          Vinculado a: {linkedMaint.description}
                        </Text>
                      </View>
                    )}

                    {isPending && (
                      <View style={styles.statusSection}>
                        {isCritical ? (
                          <View style={styles.criticalRow}>
                            <AlertTriangle size={14} color={colors.error} style={{ marginRight: 6 }} />
                            <Text style={styles.criticalText}>CRÍTICO - Vencendo em breve ou vencido</Text>
                          </View>
                        ) : (
                          <View style={styles.normalRow}>
                            <Text style={styles.normalText}>Acompanhando no odômetro</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </TeslaCard>
              );
            })}

            {filteredAlerts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Bell size={48} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>Nenhum alerta cadastrado nesta aba.</Text>
                {filter === 'pending' && (
                  <TeslaButton
                    title="Criar Primeiro Alerta"
                    onPress={onAddPress}
                    variant="outline"
                    style={{ marginTop: 24, width: '100%' }}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
