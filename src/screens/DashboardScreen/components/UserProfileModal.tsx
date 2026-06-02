import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, User as UserIcon, Mail, Trash2, LogOut } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import { CustomModal } from '../../../components/CustomModal';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ visible, onClose }: UserProfileModalProps) {
  const { user, updateUserProfile, logout, deleteAccount } = useApp();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      ToastService.showError('Erro', 'Por favor, preencha o nome e o e-mail.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile(name.trim(), email.trim());
      ToastService.showSuccess('Sucesso', 'Perfil atualizado com sucesso!');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('auth/requires-recent-login')) {
        ToastService.showError(
          'Reautenticação Necessária',
          'Por segurança, saia da conta e entre novamente para alterar seu e-mail.'
        );
      } else {
        ToastService.showError('Erro ao Atualizar', err.message || 'Houve um erro ao atualizar os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              ToastService.showInfo('Sessão Encerrada', 'Desconectado com sucesso!');
              onClose();
            } catch (err: any) {
              ToastService.showError('Erro', 'Erro ao deslogar.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Cadastro',
      'ATENÇÃO: Isso excluirá permanentemente sua conta e todos os dados de seus veículos, histórico de combustível, alertas e manutenções. Esta ação NÃO pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount();
              ToastService.showSuccess('Conta Excluída', 'Seus dados foram removidos dos nossos servidores.');
              onClose();
            } catch (err: any) {
              console.error(err);
              if (err.message && err.message.includes('requires-recent-login')) {
                ToastService.showError(
                  'Reautenticação Necessária',
                  'Por segurança, saia da conta e faça login novamente antes de excluir o cadastro.'
                );
              } else {
                ToastService.showError('Erro ao Excluir', err.message || 'Houve um erro ao excluir a conta.');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <CustomModal visible={visible} onClose={onClose} headerTitle="Perfil do Usuário" loading={loading}>
      <ScrollView
        contentContainerStyle={styles.profileModalScroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Avatar Placeholder */}
        <View style={styles.profileAvatarSection}>
          <View style={styles.profileAvatarCircle}>
            <UserIcon size={36} color={colors.primary} />
          </View>
          <Text style={styles.profileUserEmailLabel}>{user?.email}</Text>
        </View>

        {/* Edit Form */}
        <TeslaInput
          label="Nome Completo *"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />

        <TeslaInput
          label="E-mail de Cadastro *"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Action Buttons */}
        <TeslaButton
          title="Salvar Alterações"
          onPress={handleSave}
          loading={loading}
          style={styles.profileSaveBtn}
        />

        <View style={styles.profileDivider} />

        <Text style={styles.profileDangerZoneTitle}>Ações de Conta</Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.profileActionRow}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={styles.profileActionLeft}>
            <LogOut size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <Text style={styles.profileActionText}>Sair da Conta</Text>
          </View>
          <Text style={styles.profileActionChevron}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={[styles.profileActionRow, { borderBottomWidth: 0 }]}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={styles.profileActionCenter}>
            <Trash2 size={18} color={colors.error} style={{ marginRight: 10 }} />
            <Text style={[styles.profileActionText, { color: colors.error }]}>Excluir Cadastro</Text>
          </View>

        </TouchableOpacity>
      </ScrollView>
    </CustomModal>
  );
}
