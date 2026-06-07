import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TeslaButton } from '../../components/TeslaButton';
import { TeslaInput } from '../../components/TeslaInput';
import { useApp } from '../../context/AppContext';
import { AppTheme, useTheme } from '../../theme';
import { ToastService } from '../../utils/toast';

interface PasswordRecoveryScreenProps {
  initialEmail?: string;
  onBack: () => void;
}

export default function PasswordRecoveryScreen({
  initialEmail = '',
  onBack,
}: PasswordRecoveryScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { resetPassword } = useApp();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
      ToastService.showSuccess('E-mail enviado', 'Confira sua caixa de entrada para redefinir a senha.');
    } catch (err: any) {
      ToastService.showError('Recuperação de senha', err.message || 'Não foi possível enviar o e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={loading}>
          <ArrowLeft size={20} color={theme.colors.text} />
          <Text style={styles.backLabel}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <MailCheck size={28} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Informe o e-mail da sua conta para receber o link de redefinição.
        </Text>

        <TeslaInput
          label="E-mail cadastrado"
          placeholder="nome@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TeslaButton
          title={sent ? 'Enviar novamente' : 'Enviar link'}
          onPress={handleSubmit}
          loading={loading}
        />

        {sent && (
          <View style={styles.sentBox}>
            <Text style={styles.sentTitle}>Link solicitado</Text>
            <Text style={styles.sentText}>
              Se este e-mail estiver cadastrado, o Firebase enviará as instruções de recuperação.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 28,
  },
  backLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '700',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.infoSurface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    marginBottom: 26,
  },
  sentBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sentTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '800',
    marginBottom: 4,
  },
  sentText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 19,
  },
});
