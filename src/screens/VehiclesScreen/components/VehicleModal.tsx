import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useApp } from '../../../context/AppContext';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { FuelType } from '../../../types';
import { ToastService } from '../../../utils/toast';
import { styles } from '../styles';
import { CustomModal } from '../../../components/CustomModal';

const FUEL_TYPES: FuelType[] = ['Gasolina', 'Álcool', 'Flex', 'Diesel', 'Elétrico'];

interface VehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function VehicleModal({ visible, onClose }: VehicleModalProps) {
  const { saveVehicle } = useApp();

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [engine, setEngine] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Flex');
  const [odometer, setOdometer] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!brand || !model || !plate || !engine || !odometer) {
      const msg = 'Por favor, preencha todos os campos.';
      setError(msg);
      ToastService.showError('Campos Obrigatórios', msg);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await saveVehicle({
        brand,
        model,
        plate: plate.toUpperCase(),
        engine,
        fuelType,
        currentOdometer: parseInt(odometer, 10) || 0,
      });
      ToastService.showSuccess('Veículo Salvo', `${brand} ${model} adicionado com sucesso!`);
      // Reset form
      setBrand('');
      setModel('');
      setPlate('');
      setEngine('');
      setFuelType('Flex');
      setOdometer('');
      onClose();
    } catch (err: any) {
      const errMsg = err.message || 'Erro ao salvar veículo.';
      setError(errMsg);
      ToastService.showError('Erro ao Salvar', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} headerTitle="Novo Veículo">

      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TeslaInput
          label="Marca"
          placeholder="Ex: Tesla, Chevrolet, Toyota"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />

        <TeslaInput
          label="Modelo"
          placeholder="Ex: Model 3, Onix, Corolla"
          value={model}
          onChangeText={setModel}
          autoCapitalize="words"
        />

        <TeslaInput
          label="Placa"
          placeholder="Ex: ABC-1234"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
        />

        <TeslaInput
          label="Motorização"
          placeholder="Ex: 1.0 Turbo, 2.0, Dual Motor"
          value={engine}
          onChangeText={setEngine}
        />

        <TeslaInput
          label="Quilometragem Atual"
          placeholder="Ex: 45000"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="number-pad"
        />

        <Text style={styles.dropdownLabel}>Combustível</Text>
        <View style={styles.fuelOptionsGrid}>
          {FUEL_TYPES.map((type) => {
            const isSelected = fuelType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.fuelOptionBtn, isSelected && styles.fuelOptionBtnActive]}
                onPress={() => setFuelType(type)}
              >
                <Text style={[styles.fuelOptionText, isSelected && styles.fuelOptionTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TeslaButton
          title="Salvar Veículo"
          onPress={handleAdd}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </CustomModal>
  );
}
