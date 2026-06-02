import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { AlertType } from '../../../types';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import { CustomModal } from '../../../components/CustomModal';

interface AlertFormProps {
  visible: boolean;
  onClose: () => void;
}

export function AlertModal({ visible, onClose }: AlertFormProps) {
  const { selectedVehicle, maintenances, saveAlert } = useApp();

  const [type, setType] = useState<AlertType>('odometer');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetOdometer, setTargetOdometer] = useState('');
  const [linkedMaintenanceId, setLinkedMaintenanceId] = useState('');
  const [showMaintModal, setShowMaintModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedVehicle) return;

    if (!title || (type === 'date' && !targetDate) || (type === 'odometer' && !targetOdometer)) {
      ToastService.showError('Erro', 'Preencha o título e o gatilho (quilometragem ou data).');
      return;
    }

    if (type === 'odometer' && selectedVehicle.currentOdometer > parseInt(targetOdometer, 10)) {
      ToastService.showError('Erro', 'A quilometragem alvo deve ser maior que o atual.');
      return;
    }

    if (type === 'date' && new Date(targetDate) < new Date()) {
      ToastService.showError('Erro', 'A data alvo deve ser maior que a data atual.');
      return;
    }

    setLoading(true);
    try {
      await saveAlert({
        type,
        title,
        targetDate: type === 'date' ? targetDate : undefined,
        targetOdometer: type === 'odometer' ? parseInt(targetOdometer, 10) : undefined,
        maintenanceId: linkedMaintenanceId || undefined,
      });
      ToastService.showSuccess('Sucesso', `O lembrete "${title}" foi programado com sucesso!`);

      // Reset Form
      setTitle('');
      setTargetDate('');
      setTargetOdometer('');
      setLinkedMaintenanceId('');
      onClose();
    } catch (err: any) {
      const errMsg = err.message || 'Erro ao criar alerta.';
      ToastService.showError('Erro ao Criar Alerta', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} headerTitle="Novo Alerta">
      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.fieldLabel}>Gatilho do Alerta</Text>
        <View style={styles.typeSelectorGrid}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'odometer' && styles.typeBtnActive]}
            onPress={() => setType('odometer')}
          >
            <Text style={[styles.typeBtnText, type === 'odometer' && styles.typeBtnTextActive]}>
              Quilometragem
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'date' && styles.typeBtnActive]}
            onPress={() => setType('date')}
          >
            <Text style={[styles.typeBtnText, type === 'date' && styles.typeBtnTextActive]}>
              Data Calendário
            </Text>
          </TouchableOpacity>
        </View>

        <TeslaInput
          label="Título do Alerta *"
          placeholder="Ex: Troca de Pneus, Troca de Vela"
          value={title}
          onChangeText={setTitle}
        />

        {type === 'odometer' ? (
          <TeslaInput
            label="Quilometragem Alvo (KM) *"
            placeholder={`Ex: ${((selectedVehicle?.currentOdometer || 0) + 10000).toLocaleString('pt-BR')}`}
            value={targetOdometer}
            onChangeText={setTargetOdometer}
            keyboardType="numeric"
          />
        ) : (
          <TeslaInput
            label="Data Alvo *"
            placeholder="AAAA-MM-DD"
            value={targetDate}
            onChangeText={setTargetDate}
          />
        )}

        <Text style={styles.fieldLabel}>Vincular a um Serviço (Opcional)</Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setShowMaintModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectBtnText}>
            {linkedMaintenanceId
              ? maintenances.find(m => m.id === linkedMaintenanceId)?.description || 'Serviço Selecionado'
              : 'Não vincular a um serviço'}
          </Text>
          <Text style={styles.selectBtnChevron}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={showMaintModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMaintModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Serviço</Text>
              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={true}>
                <TouchableOpacity
                  style={[styles.modalItem, !linkedMaintenanceId && styles.modalItemActive]}
                  onPress={() => {
                    setLinkedMaintenanceId('');
                    setShowMaintModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, !linkedMaintenanceId && styles.modalItemTextActive]}>
                    Não vincular a um serviço
                  </Text>
                </TouchableOpacity>
                {maintenances.map((m) => {
                  const isSelected = linkedMaintenanceId === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.modalItem, isSelected && styles.modalItemActive]}
                      onPress={() => {
                        setLinkedMaintenanceId(m.id);
                        setShowMaintModal(false);
                      }}
                    >
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                        {m.description} ({m.date}) - R$ {m.totalCost.toLocaleString('pt-BR')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TeslaButton
                title="Fechar"
                onPress={() => setShowMaintModal(false)}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        </Modal>

        <TeslaButton
          title="Criar Alerta"
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </CustomModal>
  );
}
