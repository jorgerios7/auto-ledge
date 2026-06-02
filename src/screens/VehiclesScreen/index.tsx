import React, { useState } from 'react';
import { VehicleModal } from './components/VehicleModal';
import { VehicleList } from './components/VehicleList';

interface VehiclesScreenProps {
  initiallyShowAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export default function VehiclesScreen({ initiallyShowAddModal, onCloseAddModal }: VehiclesScreenProps) {
  const [showAddModal, setShowAddModal] = useState(initiallyShowAddModal || false);

  const closeModal = () => {
    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <>
      <VehicleList onAddPress={() => setShowAddModal(true)} />
      <VehicleModal visible={showAddModal} onClose={closeModal} />
    </>
  );
}