import React from 'react';
import { View, Text } from 'react-native';
import { TeslaCard } from '../../../components/TeslaCard';
import { styles } from '../styles';
import { formatCurrency } from '../../../utils/format';

interface QuickStatsProps {
  totalExpenses: number;
  costPerKm: number;
  distance: number;
}

export default function QuickStats({ totalExpenses, costPerKm, distance }: QuickStatsProps) {
  return (
    <View style={styles.statsGrid}>
      <TeslaCard style={styles.statCard}>
        <Text style={styles.statLabel}>CUSTO TOTAL</Text>
        <Text style={styles.statValue}>
          {formatCurrency(totalExpenses)}
        </Text>
        <Text style={styles.statSubText}>Combustível + Manut.</Text>
      </TeslaCard>
      <TeslaCard style={styles.statCard}>
        <Text style={styles.statLabel}>CUSTO POR KM</Text>
        <Text style={styles.statValue}>
          {formatCurrency(costPerKm)}
        </Text>
        <Text style={styles.statSubText}>
          {distance > 0 ? `${distance.toLocaleString('pt-BR')} km rodados` : 'Sem dados de rodagem'}
        </Text>
      </TeslaCard>
    </View>
  );
}
