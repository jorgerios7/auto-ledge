import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AppTheme, useTheme } from '../theme';

interface TeslaInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isDate?: boolean;
}

export const TeslaInput = ({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  isDate,
  ...props
}: TeslaInputProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const formatDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const handleChangeText = (text: string) => {
    if (isDate) {
      const formatted = formatDate(text);
      if (props.onChangeText) {
        props.onChangeText(formatted);
      }
    } else {
      if (props.onChangeText) {
        props.onChangeText(text);
      }
    }
  };

  const isPassword = props.secureTextEntry;
  const secureTextEntryValue = isPassword ? !isPasswordVisible : props.secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        props.multiline && styles.inputWrapperMultiline,
        isFocused && styles.inputFocused,
        error ? styles.inputError : null
      ]}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
          style={[
            styles.input,
            props.multiline && styles.inputMultiline
          ]}
          secureTextEntry={secureTextEntryValue}
          keyboardType={isDate ? 'number-pad' : props.keyboardType}
          maxLength={isDate ? 10 : props.maxLength}
          onChangeText={handleChangeText}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconContainer}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputWrapperMultiline: {
    height: 80,
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.text,
    fontSize: theme.typography.body,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption,
    marginTop: 6,
  },
  iconContainer: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
