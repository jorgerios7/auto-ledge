import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Alert } from '../../../types';
import { colors } from '../../../theme/colors';
import { styles } from '../styles';

interface CriticalAlertsProps {
  criticalAlerts: Alert[];
  onPress: () => void;
}

export default function CriticalAlerts({ criticalAlerts, onPress }: CriticalAlertsProps) {
  if (criticalAlerts.length === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.criticalAlertBanner}>
      <View style={styles.alertHeaderRow}>
        <AlertTriangle size={18} color={colors.error} />
        <Text style={styles.alertBannerTitle}>LEMBRETE URGENTE</Text>
      </View>
      {criticalAlerts.slice(0, 2).map((a, i) => (
        <Text key={i} style={styles.alertBannerText}>
          • {a.title} ({a.type === 'odometer' ? `${a.targetOdometer?.toLocaleString('pt-BR')} km` : a.targetDate})
        </Text>
      ))}
    </TouchableOpacity>
  );
}
