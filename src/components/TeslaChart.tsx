import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CategoryData {
  label: string;
  value: number;
  color: string;
}

interface HistoryData {
  label: string;
  value: number;
}

interface TeslaChartProps {
  type: 'category' | 'history';
  data: CategoryData[] | HistoryData[];
  currencySymbol?: string;
}

export const TeslaChart = ({
  type,
  data,
  currencySymbol = 'R$',
}: TeslaChartProps) => {
  if (type === 'category') {
    const catData = data as CategoryData[];
    const total = catData.reduce((sum, item) => sum + item.value, 0);

    return (
      <View style={styles.container}>
        {total === 0 ? (
          <Text style={styles.noData}>Nenhum gasto registrado neste veículo</Text>
        ) : (
          <View>
            {/* Segmented horizontal bar */}
            <View style={styles.progressBar}>
              {catData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                if (percentage === 0) return null;
                
                return (
                  <View
                    key={`bar-${index}`}
                    style={[
                      styles.segment,
                      {
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                        // Round outer corners
                        borderTopLeftRadius: index === 0 ? 4 : 0,
                        borderBottomLeftRadius: index === 0 ? 4 : 0,
                        borderTopRightRadius: index === catData.length - 1 ? 4 : 0,
                        borderBottomRightRadius: index === catData.length - 1 ? 4 : 0,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Legend list */}
            <View style={styles.legendContainer}>
              {catData.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                return (
                  <View key={`legend-${index}`} style={styles.legendItem}>
                    <View style={styles.legendHeader}>
                      <View style={[styles.bullet, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.legendValue}>
                      {currencySymbol} {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <Text style={styles.legendPercentage}> ({percentage}%)</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  }

  // History type: Horizontal bars
  const histData = data as HistoryData[];
  const maxValue = Math.max(...histData.map(item => item.value), 1);

  return (
    <View style={styles.container}>
      {histData.length === 0 ? (
        <Text style={styles.noData}>Sem dados históricos suficientes</Text>
      ) : (
        <View style={styles.historyList}>
          {histData.map((item, index) => {
            const widthPercentage = (item.value / maxValue) * 100;
            return (
              <View key={`hist-${index}`} style={styles.histItem}>
                <View style={styles.histTextRow}>
                  <Text style={styles.histLabel}>{item.label}</Text>
                  <Text style={styles.histValue}>
                    {currencySymbol} {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View style={styles.histBarBg}>
                  <View 
                    style={[
                      styles.histBarFill, 
                      { width: `${Math.max(widthPercentage, 4)}%` }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  noData: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 12,
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
  },
  segment: {
    height: '100%',
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  legendPercentage: {
    color: colors.textMuted,
    fontWeight: '400',
    fontSize: 11,
  },
  historyList: {
    gap: 16,
  },
  histItem: {
    width: '100%',
  },
  histTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  histLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  histValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  histBarBg: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  histBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
