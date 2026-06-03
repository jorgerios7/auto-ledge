import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { TeslaCard } from '../../components/TeslaCard';
import { TeslaButton } from '../../components/TeslaButton';
import {
  Car,
  ChevronRight,
  Bell,
  Wrench,
  User as UserIcon,
  Plus
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './styles';

// Import subcomponents
import CarGraphic from './components/CarGraphic';
import QuickStats from './components/QuickStats';
import QuickActions from './components/QuickActions';
import CriticalAlerts from './components/CriticalAlerts';
import UserProfileModal from './components/UserProfileModal';
import { QuickChart } from './components/QuickChart';

interface DashboardScreenProps {
  onNavigate: (screen: 'dashboard' | 'history' | 'alerts' | 'garage') => void;
  onOpenModal: (formType: 'fuel' | 'maintenance' | 'alert' | 'vehicle') => void;
}

export default function DashboardScreen({ onNavigate, onOpenModal }: DashboardScreenProps) {
  const {
    user,
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    maintenances,
    fuelLogs,
    alerts
  } = useApp();

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Calculations
  const totalMaintCost = maintenances.reduce((sum, m) => sum + m.totalCost, 0);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
  const totalExpenses = totalMaintCost + totalFuelCost;

  // Cost per KM calculation
  let distance = 0;
  let costPerKm = 0;
  if (selectedVehicle && fuelLogs.length > 0) {
    const odometers = fuelLogs.map(f => f.odometer);
    if (selectedVehicle.currentOdometer > 0) {
      odometers.push(selectedVehicle.currentOdometer);
    }
    const minOdo = Math.min(...odometers);
    const maxOdo = Math.max(...odometers);
    distance = maxOdo - minOdo;
    costPerKm = distance > 0 ? totalExpenses / distance : 0;
  }

  // Categories for chart
  const preventiveCost = maintenances
    .filter(m => m.type === 'preventive')
    .reduce((sum, m) => sum + m.totalCost, 0);

  const correctiveCost = maintenances
    .filter(m => m.type === 'corrective')
    .reduce((sum, m) => sum + m.totalCost, 0);

  const categoryChartData = [
    { label: 'Combustível', value: totalFuelCost, color: colors.error },
    { label: 'Manut. Preventiva', value: preventiveCost, color: colors.text },
    { label: 'Manut. Corretiva', value: correctiveCost, color: colors.carChassisBorder },
  ];

  // Group monthly expenses for the last 6 months
  const generateLast6Months = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const list = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mLabel = months[tempDate.getMonth()];
      const yLabel = tempDate.getFullYear().toString().substring(2);
      list.push({
        key: `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1).toString().padStart(2, '0')}`,
        label: `${mLabel}/${yLabel}`,
        value: 0
      });
    }
    return list;
  };

  const monthlyExpenses = generateLast6Months();

  maintenances.forEach(m => {
    if (!m.date) return;
    const yearMonth = m.date.substring(0, 7); // 'YYYY-MM'
    const found = monthlyExpenses.find(item => item.key === yearMonth);
    if (found) {
      found.value += m.totalCost;
    }
  });

  fuelLogs.forEach(f => {
    if (!f.date) return;
    const yearMonth = f.date.substring(0, 7); // 'YYYY-MM'
    const found = monthlyExpenses.find(item => item.key === yearMonth);
    if (found) {
      found.value += f.totalCost;
    }
  });

  const historyChartData = monthlyExpenses.map(item => ({
    label: item.label,
    value: item.value
  }));

  // Active / Critical Alerts check
  const criticalAlertsList = selectedVehicle ? alerts.filter(alert => {
    if (alert.status === 'completed') return false;

    // Check odometer alert
    if (alert.type === 'odometer' && alert.targetOdometer) {
      const remainingKm = alert.targetOdometer - selectedVehicle.currentOdometer;
      return remainingKm <= 500; // Trigger if within 500 km
    }

    // Check date alert
    if (alert.type === 'date' && alert.targetDate) {
      const targetTime = new Date(alert.targetDate).getTime();
      const currentTime = new Date().getTime();
      const diffDays = (targetTime - currentTime) / (1000 * 60 * 60 * 24);
      return diffDays <= 7; // Trigger if within 7 days
    }

    return false;
  }) : [];

  const pendingAlertsCount = alerts.filter(a => a.status === 'pending').length;

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.welcomeText}>OLÁ,</Text>
          <Text style={styles.userName}>{user?.displayName?.toUpperCase() || 'JORGE RIOS'}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.logoutBtn}>
          <UserIcon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Vehicles Horizontal Switcher */}
        <View style={styles.garageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sua Garagem</Text>
            <TouchableOpacity onPress={() => onNavigate('garage')} style={styles.addVehIcon}>
              <Plus size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehiclesScroll}>
            {vehicles.map(veh => {
              const isActive = selectedVehicle?.id === veh.id;
              return (
                <TouchableOpacity
                  key={veh.id}
                  style={[styles.vehTab, isActive && styles.vehTabActive]}
                  onPress={() => setSelectedVehicle(veh)}
                >
                  <Car size={16} color={isActive ? colors.background : colors.textMuted} style={styles.vehTabIcon} />
                  <Text style={[styles.vehTabText, isActive && styles.vehTabTextActive]}>
                    {veh.model}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {vehicles.length === 0 && (
              <TouchableOpacity style={styles.vehTab} onPress={() => onOpenModal('vehicle')}>
                <Plus size={16} color={colors.textMuted} style={styles.vehTabIcon} />
                <Text style={styles.vehTabText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {selectedVehicle ? (
          <View style={styles.mainDashboard}>
            <CarGraphic vehicle={selectedVehicle} />

            <QuickStats
              totalExpenses={totalExpenses}
              costPerKm={costPerKm}
              distance={distance}
            />

            <CriticalAlerts
              criticalAlerts={criticalAlertsList}
              onPress={() => onNavigate('alerts')}
            />

            <QuickActions onOpenForm={onOpenModal} />

            {/* Expense breakdown chart */}
            <TeslaCard title="Distribuição de Gastos">
              <QuickChart type="category" data={categoryChartData} />
            </TeslaCard>

            {/* Monthly cost history chart */}
            <TeslaCard title="Histórico de Custos Mensais">
              <QuickChart type="history" data={historyChartData} />
            </TeslaCard>

            {/* Navigation Widget shortcuts */}
            <TeslaCard title="Status do Sistema" onPress={() => onNavigate('alerts')}>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Bell size={18} color={colors.textMuted} />
                  <Text style={styles.statusLabel}>Alertas Pendentes</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{pendingAlertsCount}</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </View>
            </TeslaCard>

            <TeslaCard title="Histórico Recente" onPress={() => onNavigate('history')}>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Wrench size={18} color={colors.textMuted} />
                  <Text style={styles.statusLabel}>Manutenções Realizadas</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{maintenances.length}</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </View>
            </TeslaCard>
          </View>
        ) : (
          <View style={styles.noVehicleContainer}>
            <Car size={48} color={colors.mediumGray} style={{ marginBottom: 16 }} />
            <Text style={styles.noVehicleText}>Nenhum veículo selecionado ou cadastrado.</Text>
            <TeslaButton
              title="Adicionar Veículo"
              onPress={() => onOpenModal('vehicle')}
              variant="outline"
              style={{ marginTop: 16, width: 200 }}
            />
          </View>
        )}
      </ScrollView>

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </View>
  );
}