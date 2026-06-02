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

interface MaintenanceModalProps {
  visible: boolean;
  editingMaint: Maintenance | null;
  onClose: () => void;
}

export function MaintenanceModal({ visible, editingMaint, onClose }: MaintenanceModalProps) {
  const { selectedVehicle, saveMaintenance } = useApp();

  // Form State
  const [type, setType] = useState<MaintenanceType>(editingMaint?.type || 'preventive');
  const [description, setDescription] = useState(editingMaint?.description || '');
  const [partsCost, setPartsCost] = useState(editingMaint ? editingMaint.partsCost.toString() : '');
  const [laborCost, setLaborCost] = useState(editingMaint ? editingMaint.laborCost.toString() : '');
  const [date, setDate] = useState(editingMaint?.date || new Date().toISOString().split('T')[0]);
  const [partsDetail, setPartsDetail] = useState(editingMaint?.partsDetail || '');
  const [attachmentUri, setAttachmentUri] = useState<string | undefined>(editingMaint?.attachmentUri);
  const [odometer, setOdometer] = useState(editingMaint?.odometer ? editingMaint.odometer.toString() : '');

  const [error, setError] = useState('');
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
        setAttachmentUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const handleSave = async () => {
    if (!description || !partsCost || !laborCost || !date) {
      const msg = 'Por favor, preencha todos os campos obrigatórios (Descrição, Custos e Data).';
      setError(msg);
      ToastService.showError('Campos Obrigatórios', 'Preencha a descrição, os custos e a data do serviço.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await saveMaintenance({
        id: editingMaint ? editingMaint.id : undefined,
        type,
        description,
        partsCost: parseFloat(partsCost) || 0,
        laborCost: parseFloat(laborCost) || 0,
        date,
        partsDetail: partsDetail || undefined,
        attachmentUri,
        odometer: odometer ? parseInt(odometer, 10) : undefined,
        timestamps: editingMaint ? editingMaint.timestamps : undefined,
      });
      ToastService.showSuccess(
        editingMaint ? 'Manutenção Atualizada' : 'Manutenção Registrada',
        editingMaint ? `O serviço "${description}" foi atualizado com sucesso!` : `O serviço "${description}" foi adicionado com sucesso!`
      );
      onClose();
    } catch (err: any) {
      const errMsg = err.message || 'Erro ao registrar manutenção.';
      setError(errMsg);
      ToastService.showError(editingMaint ? 'Erro ao Atualizar' : 'Erro ao Registrar', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} headerTitle={editingMaint ? 'Editar Manutenção' : 'Nova Manutenção'}>
      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.fieldLabel}>Tipo de Manutenção</Text>
        <View style={styles.typeSelectorGrid}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'preventive' && styles.typeBtnActive]}
            onPress={() => setType('preventive')}
          >
            <Text style={[styles.typeBtnText, type === 'preventive' && styles.typeBtnTextActive]}>
              Preventiva
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'corrective' && styles.typeBtnActive]}
            onPress={() => setType('corrective')}
          >
            <Text style={[styles.typeBtnText, type === 'corrective' && styles.typeBtnTextActive]}>
              Corretiva
            </Text>
          </TouchableOpacity>
        </View>

        <TeslaInput
          label="Descrição do Serviço *"
          placeholder="Ex: Troca de pastilhas de freio, Alinhamento"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.rowInputs}>
          <TeslaInput
            label="Custo Peças (R$) *"
            placeholder="0.00"
            value={partsCost}
            onChangeText={setPartsCost}
            keyboardType="numeric"
            containerStyle={{ width: '48%' }}
          />
          <TeslaInput
            label="Mão de Obra (R$) *"
            placeholder="0.00"
            value={laborCost}
            onChangeText={setLaborCost}
            keyboardType="numeric"
            containerStyle={{ width: '48%' }}
          />
        </View>

        <TeslaInput
          label="Quilometragem no Serviço (KM)"
          placeholder={`Opcional (Atual: ${selectedVehicle?.currentOdometer.toLocaleString('pt-BR')} KM)`}
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="numeric"
        />

        <TeslaInput
          label="Data *"
          placeholder="AAAA-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <TeslaInput
          label="Peças Substituídas / Detalhes"
          placeholder="Ex: Pastilhas cerâmica Bosch, Filtro HEPA"
          value={partsDetail}
          onChangeText={setPartsDetail}
          multiline
          numberOfLines={3}
          containerStyle={{ height: 80 }}
        />

        <Text style={styles.fieldLabel}>Anexo (Nota Fiscal / Recibo)</Text>

        {attachmentUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: attachmentUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => setAttachmentUri(undefined)} style={styles.removeImageBtn}>
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
