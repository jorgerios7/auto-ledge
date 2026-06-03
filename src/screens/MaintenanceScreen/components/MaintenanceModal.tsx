import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { Maintenance, MaintenanceType } from '../../../types';
import { colors } from '../../../theme/colors';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import { CustomModal } from '../../../components/CustomModal';
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from '../../../utils/date';

interface MaintenanceModalProps {
  visible: boolean;
  editingMaint: Maintenance | null;
  onClose: () => void;
}

export function MaintenanceModal({ visible, editingMaint, onClose }: MaintenanceModalProps) {
  if (!visible) return null;

  const { selectedVehicle, saveMaintenance } = useApp();

  const editingTtype = editingMaint?.type;
  const editingDescription = editingMaint?.description;
  const editingPartsCost = editingMaint?.partsCost;
  const editingLaborCost = editingMaint?.laborCost;
  const editingDate = editingMaint?.date;
  const editingPartsDetail = editingMaint?.partsDetail;
  const editingAttachmentUri = editingMaint?.attachmentUri;
  const editingOdometer = editingMaint?.odometer;

  const [dataState, setDataState] = useState({
    type: editingTtype ? editingTtype : 'preventive' as MaintenanceType,
    description: editingDescription ? editingDescription : '',
    partsCost: editingPartsCost ? editingPartsCost.toString() : '',
    laborCost: editingLaborCost ? editingLaborCost.toString() : '',
    date: editingDate ? formatDateToDDMMYYYY(editingDate) : formatDateToDDMMYYYY(new Date().toISOString().split('T')[0]),
    partsDetail: editingPartsDetail ? editingPartsDetail : '',
    attachmentUri: editingAttachmentUri ? editingAttachmentUri : undefined,
    odometer: editingOdometer ? editingOdometer.toString() : '',
  });

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'Precisamos de acesso às suas fotos para anexar recibos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDataState(prev => ({ ...prev, attachmentUri: result.assets[0].uri }));
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const handleSave = async () => {
    if (!dataState.description || !dataState.partsCost || !dataState.laborCost || !dataState.date || !dataState.odometer) {
      ToastService.showError('Campos Obrigatórios', 'Preencha a descrição, os custos e a data do serviço.');
      return;
    }

    setLoading(true);
    try {
      await saveMaintenance({
        id: editingMaint ? editingMaint.id : undefined,
        type: dataState.type,
        description: dataState.description,
        partsCost: parseFloat(dataState.partsCost) || 0,
        laborCost: parseFloat(dataState.laborCost) || 0,
        date: formatDateToYYYYMMDD(dataState.date),
        partsDetail: dataState.partsDetail || undefined,
        attachmentUri: dataState.attachmentUri,
        odometer: dataState.odometer ? parseInt(dataState.odometer, 10) : undefined,
        timestamps: editingMaint ? editingMaint.timestamps : undefined,
      });
      ToastService.showSuccess(
        editingMaint ? 'Manutenção Atualizada' : 'Manutenção Registrada',
        editingMaint ? `O serviço "${dataState.description}" foi atualizado com sucesso!` : `O serviço "${dataState.description}" foi adicionado com sucesso!`
      );

      setDataState({
        type: 'preventive',
        description: '',
        partsCost: '',
        laborCost: '',
        date: formatDateToDDMMYYYY(new Date().toISOString().split('T')[0]),
        partsDetail: '',
        attachmentUri: undefined,
        odometer: '',
      });

      onClose();
    } catch (err: any) {
      const errMsg = err.message || 'Erro ao registrar manutenção.';
      ToastService.showError(editingMaint ? 'Erro ao Atualizar' : 'Erro ao Registrar', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} headerTitle={editingMaint ? 'Editar Manutenção' : 'Nova Manutenção'}>
      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.fieldLabel}>Tipo de Manutenção</Text>
        <View style={styles.typeSelectorGrid}>
          <TouchableOpacity
            style={[styles.typeBtn, dataState.type === 'preventive' && styles.typeBtnActive]}
            onPress={() => setDataState(prev => ({ ...prev, type: 'preventive' }))}
          >
            <Text style={[styles.typeBtnText, dataState.type === 'preventive' && styles.typeBtnTextActive]}>
              Preventiva
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, dataState.type === 'corrective' && styles.typeBtnActive]}
            onPress={() => setDataState(prev => ({ ...prev, type: 'corrective' }))}
          >
            <Text style={[styles.typeBtnText, dataState.type === 'corrective' && styles.typeBtnTextActive]}>
              Corretiva
            </Text>
          </TouchableOpacity>
        </View>

        <TeslaInput
          label="Descrição do Serviço *"
          placeholder="Ex: Troca de pastilhas de freio, Alinhamento"
          value={dataState.description}
          onChangeText={(text) => setDataState(prev => ({ ...prev, description: text }))}
        />

        <View style={styles.rowInputs}>
          <TeslaInput
            label="Custo Peças (R$) *"
            placeholder="0.00"
            value={dataState.partsCost}
            onChangeText={(text) => setDataState(prev => ({ ...prev, partsCost: text }))}
            keyboardType="numeric"
            containerStyle={{ width: '48%' }}
          />
          <TeslaInput
            label="Mão de Obra (R$) *"
            placeholder="0.00"
            value={dataState.laborCost}
            onChangeText={(text) => setDataState(prev => ({ ...prev, laborCost: text }))}
            keyboardType="numeric"
            containerStyle={{ width: '48%' }}
          />
        </View>

        <TeslaInput
          label="Quilometragem no Serviço (KM)"
          placeholder={`Opcional (Atual: ${selectedVehicle?.currentOdometer.toLocaleString('pt-BR')} KM)`}
          value={dataState.odometer}
          onChangeText={(text) => setDataState(prev => ({ ...prev, odometer: text }))}
          keyboardType="numeric"
        />

        <TeslaInput
          label="Data *"
          placeholder="DD/MM/AAAA"
          value={dataState.date}
          onChangeText={(text) => setDataState(prev => ({ ...prev, date: text }))}
          isDate
        />

        <TeslaInput
          label="Peças Substituídas / Detalhes"
          placeholder="Ex: Pastilhas cerâmica Bosch, Filtro HEPA"
          value={dataState.partsDetail}
          onChangeText={(text) => setDataState(prev => ({ ...prev, partsDetail: text }))}
          multiline
          numberOfLines={3}
          containerStyle={{ height: 80 }}
        />

        <Text style={styles.fieldLabel}>Anexo (Nota Fiscal / Recibo)</Text>

        {dataState.attachmentUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: dataState.attachmentUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => setDataState(prev => ({ ...prev, attachmentUri: undefined }))} style={styles.removeImageBtn}>
              <Text style={styles.removeImageText}>Remover Anexo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
            <Camera size={24} color={colors.textMuted} />
            <Text style={styles.uploadBoxText}>Adicionar Foto do Recibo</Text>
          </TouchableOpacity>
        )}

        <TeslaButton
          title={editingMaint ? 'Salvar Alterações' : 'Registrar Manutenção'}
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </CustomModal>
  );
}
