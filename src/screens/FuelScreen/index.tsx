import React, { useState } from 'react';
import { FuelModal } from './components/FuelModal';
import { FuelList } from './components/FuelList';

interface FuelScreenProps {
  initiallyShowAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export default function FuelScreen({ initiallyShowAddModal, onCloseAddModal }: FuelScreenProps) {
  const [showAddForm, setShowAddForm] = useState(initiallyShowAddModal || false);

  const closeForm = () => {
    setShowAddForm(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <>
      <FuelList onAddPress={() => setShowAddForm(true)} />
      <FuelModal visible={showAddForm} onClose={closeForm} />
    </>
  );
}