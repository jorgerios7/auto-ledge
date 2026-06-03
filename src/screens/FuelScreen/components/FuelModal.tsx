import React, { useState } from 'react';
import {
  Text,
  ScrollView,
} from 'react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import { CustomModal } from '../../../components/CustomModal';
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from '../../../utils/date';

interface FuelModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FuelModal({ visible, onClose }: FuelModalProps) {
  const { selectedVehicle, saveFuelLog } = useApp();

  // Form State
  const [liters, setLiters] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [date, setDate] = useState(formatDateToDDMMYYYY(new Date().toISOString().split('T')[0]));
  const [odometer, setOdometer] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isElectric = selectedVehicle?.fuelType === 'Elétrico';
  const unitLabel = isElectric ? 'kWh' : 'Litros';
  const recordLabel = isElectric ? 'Recarga' : 'Abastecimento';

  const handleSave = async () => {
    if (!liters || !totalCost || !date || !odometer) {
      const msg = 'Por favor, preencha todos os campos.';
      setError(msg);
      ToastService.showError('Campos Obrigatórios', msg);
      return;
    }

    const odoValue = parseInt(odometer, 10);
    if (selectedVehicle && odoValue < selectedVehicle.currentOdometer) {
      const msg = `A quilometragem não pode ser inferior à atual do veículo (${selectedVehicle.currentOdometer.toLocaleString()} KM).`;
      setError(msg);
      ToastService.showError('Quilometragem Inválida', msg);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await saveFuelLog({
        liters: parseFloat(liters) || 0,
        totalCost: parseFloat(totalCost) || 0,
        date: formatDateToYYYYMMDD(date),
        odometer: odoValue || 0,
      });
      ToastService.showSuccess(`${recordLabel} Registrado`, 'O registro foi adicionado com sucesso!');

      // Reset Form
      setLiters('');
      setTotalCost('');
      setDate(formatDateToDDMMYYYY(new Date().toISOString().split('T')[0]));
      setOdometer('');
      onClose();
    } catch (err: any) {
      const errMsg = err.message || `Erro ao registrar ${recordLabel.toLowerCase()}.`;
      setError(errMsg);
      ToastService.showError('Erro ao Registrar', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} headerTitle="Novo Registro">

      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TeslaInput
          label={`${unitLabel} *`}
          placeholder="Ex: 40"
          value={liters}
          onChangeText={setLiters}
          keyboardType="numeric"
        />

        <TeslaInput
          label="Custo Total (R$) *"
          placeholder="Ex: 220.00"
          value={totalCost}
          onChangeText={setTotalCost}
          keyboardType="numeric"
        />

        <TeslaInput
          label="Quilometragem Atual (KM) *"
          placeholder={`Mínimo: ${selectedVehicle?.currentOdometer}`}
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="number-pad"
        />

        <TeslaInput
          label="Data *"
          placeholder="DD/MM/AAAA"
          value={date}
          onChangeText={setDate}
          isDate
        />

        <TeslaButton
          title={isElectric ? 'Registrar Recarga' : 'Registrar Abastecimento'}
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </CustomModal>
  );
}
