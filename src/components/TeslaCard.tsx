import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle 
} from 'react-native';
import { AppTheme, useTheme } from '../theme';

interface TeslaCardProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  headerRight?: React.ReactNode;
  borderAccent?: boolean; // If true, adds a subtle highlight left border
}

export const TeslaCard = ({
  title,
  subtitle,
  onPress,
  children,
  style,
  headerRight,
  borderAccent = false,
}: TeslaCardProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const cardContent = (
    <View style={[
      styles.card, 
      borderAccent && styles.cardAccent,
      style
    ]}>
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  cardAccent: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginTop: 4,
  },
  body: {
    width: '100%',
  },
});
