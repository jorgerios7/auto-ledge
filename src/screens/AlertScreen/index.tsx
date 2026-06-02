import React, { useState } from 'react';
import { AlertModal } from './components/AlertModal';
import { AlertList } from './components/AlertList';

interface AlertsScreenProps {
  initiallyShowAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export default function AlertsScreen({ initiallyShowAddModal, onCloseAddModal }: AlertsScreenProps) {
  const [showAddModal, setShowAddModal] = useState(initiallyShowAddModal || false);

  const closeModal = () => {
    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <>
      <AlertList onAddPress={() => setShowAddModal(true)} />
      <AlertModal visible={showAddModal} onClose={closeModal} />
    </>
  );
}
