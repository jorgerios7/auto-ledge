import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Droplet, Wrench, Bell } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../styles';

interface QuickActionsProps {
  onOpenForm: (formType: 'fuel' | 'maintenance' | 'alert' | 'vehicle') => void;
}

export default function QuickActions({ onOpenForm }: QuickActionsProps) {
  return (
    <View style={styles.actionMenu}>
      <TouchableOpacity onPress={() => onOpenForm('fuel')} style={styles.actionBtn}>
        <View style={styles.actionIconBg}><Droplet size={20} color={colors.text} /></View>
        <Text style={styles.actionBtnText}>Abastecer</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onOpenForm('maintenance')} style={styles.actionBtn}>
        <View style={styles.actionIconBg}><Wrench size={20} color={colors.text} /></View>
        <Text style={styles.actionBtnText}>Manutenção</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onOpenForm('alert')} style={styles.actionBtn}>
        <View style={styles.actionIconBg}><Bell size={20} color={colors.text} /></View>
        <Text style={styles.actionBtnText}>Criar Alerta</Text>
      </TouchableOpacity>
    </View>
  );
}
