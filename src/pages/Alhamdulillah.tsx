import React, { useState } from 'react';
import { AlhamdulillahList } from '../components/alhamdulillah/AlhamdulillahList';
import { AlhamdulillahImport } from '../components/alhamdulillah/AlhamdulillahImport';

type ViewState = 'list' | 'import' | 'form';

export default function Alhamdulillah() {
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
        <AlhamdulillahList 
          onImportClick={() => setView('import')} 
          onEditClick={handleEditClick} 
        />
      )}
      
      {view === 'import' && (
        <AlhamdulillahImport 
          onBack={handleBackToList}
          onImportComplete={handleBackToList}
        />
      )}

      {view === 'form' && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
          Form entry manual belum tersedia untuk Alhamdulillah. Silakan gunakan Import CSV.
          <br/><br/>
          <button onClick={handleBackToList} className="text-blue-600 hover:underline">Kembali</button>
        </div>
      )}
    </div>
  );
}
