import React from 'react';
import { View, Text } from 'react-native';
import { Vehicle } from '../../../types';
import { styles } from '../styles';

interface CarGraphicProps {
  vehicle: Vehicle;
}

export default function CarGraphic({ vehicle }: CarGraphicProps) {
  return (
    <View style={styles.carGraphicContainer}>
      <View style={styles.carChassis}>
        {/* Wheels */}
        <View style={[styles.wheel, styles.wheelFL]} />
        <View style={[styles.wheel, styles.wheelFR]} />
        <View style={[styles.wheel, styles.wheelRL]} />
        <View style={[styles.wheel, styles.wheelRR]} />
        {/* Body shape */}
        <View style={styles.carBody}>
          <Text style={styles.carBodyPlate}>{vehicle.plate}</Text>
        </View>
      </View>
      <View style={styles.carDetails}>
        <Text style={styles.carTitle}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.carMeta}>
          {vehicle.engine} • {vehicle.fuelType}
        </Text>
        <Text style={styles.carOdometer}>
          {vehicle.currentOdometer.toLocaleString('pt-BR')} <Text style={styles.kmUnit}>KM</Text>
        </Text>
      </View>
    </View>
  );
}
