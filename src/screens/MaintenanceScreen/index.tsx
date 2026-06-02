import React, { useState } from 'react';
import { Maintenance } from '../../types';
import { MaintenanceModal } from './components/MaintenanceModal';
import { MaintenanceList } from './components/MaintenanceList';

interface MaintenanceScreenProps {
  initiallyShowAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export default function MaintenanceScreen({ initiallyShowAddModal, onCloseAddModal }: MaintenanceScreenProps) {
  const [showAddForm, setShowAddForm] = useState(initiallyShowAddModal || false);
  const [editingMaint, setEditingMaint] = useState<Maintenance | null>(null);

  const startEdit = (maint: Maintenance) => {
    setEditingMaint(maint);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingMaint(null);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <>
      <MaintenanceList onAddPress={() => setShowAddForm(true)} onEditPress={startEdit} />
      <MaintenanceModal visible={showAddForm} editingMaint={editingMaint} onClose={closeForm} />
    </>
  );
}