import React, { useState } from 'react';
import { BismillahList } from '../components/bismillah/BismillahList';
import { BismillahImport } from '../components/bismillah/BismillahImport';
import { BismillahForm } from '../components/bismillah/BismillahForm';

type ViewState = 'list' | 'import' | 'form';

export default function Bismillah() {
  const [view, setView] = useState<ViewState>('list');
  const [editId, setEditId] = useState<string | undefined>();

  const handleEditClick = (id?: string) => {
    setEditId(id);
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setEditId(undefined);
  };

  return (
    <div className="w-full">
      {view === 'list' && (
        <BismillahList 
          onImportClick={() => setView('import')} 
          onEditClick={handleEditClick} 
        />
      )}
      
      {view === 'import' && (
        <BismillahImport 
          onBack={handleBackToList}
          onImportComplete={handleBackToList}
        />
      )}

      {view === 'form' && (
        <BismillahForm 
          id={editId}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )}
    </div>
  );
}
