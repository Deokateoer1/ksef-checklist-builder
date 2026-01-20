
import React, { useState, useMemo } from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { CompanySize, ERPType, UserProfile } from '../types';

const ClientManager: React.FC = () => {
  const { clients, activeClientId, switchClient, addNewClient, removeClient, isLoading } = useChecklist();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientNip, setNewClientNip] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientErp, setNewClientErp] = useState<ERPType>(ERPType.POPULAR);
  const [newClientVolume, setNewClientVolume] = useState('1-100');

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return Object.values(clients)
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(client => 
        client.name.toLowerCase().includes(term) || 
        (client.nip && client.nip.includes(term)) ||
        client.profile.industry.toLowerCase().includes(term)
      );
  }, [clients, searchTerm]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientIndustry) return;

    const profile: UserProfile = {
      companySize: CompanySize.SMALL, // Default for now, could be dynamic
      industry: newClientIndustry,
      erpSystem: newClientErp,
      monthlyInvoices: newClientVolume,
    };

    await addNewClient(newClientName, newClientNip, profile);
    setShowAddModal(false);
    // Reset form
    setNewClientName('');
    setNewClientNip('');
    setNewClientIndustry('');
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Panel Biura Rachunkowego
          </h4>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Szukaj klienta (Nazwa, NIP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all dark:text-white"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
          {filteredClients.length === 0 && (
            <div className="text-center py-6 text-[10px] text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl">
              {Object.keys(clients).length === 0 
                ? "Brak klientów. Dodaj pierwszą firmę." 
                : "Brak wyników wyszukiwania."}
            </div>
          )}
          
          {filteredClients.map(client => {
            const completed = client.tasks.filter(t => t.completed).length;
            const total = client.tasks.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isActive = activeClientId === client.id;

            return (
              <div 
                key={client.id}
                onClick={() => switchClient(client.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative group ${
                  isActive 
                    ? 'bg-slate-900 border-slate-900 dark:bg-slate-800 text-white shadow-xl' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-blue-200 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className={`text-xs font-black ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {client.name}
                    </div>
                    {client.nip && <div className={`text-[9px] font-bold ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>NIP: {client.nip}</div>}
                  </div>
                  {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>}
                </div>

                <div className="w-full h-1.5 bg-slate-200/20 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] font-bold opacity-70 uppercase tracking-wide">
                  <span className="truncate max-w-[120px]">{client.profile.industry}</span>
                  <span>{completed}/{total}</span>
                </div>

                {/* Delete Button (visible on hover, not for active unless confirm) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeClient(client.id); }}
                  className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Nowy Klient Biura</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nazwa Firmy</label>
                  <input 
                    required
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="np. Klient Testowy Sp. z o.o."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">NIP (Opcjonalnie)</label>
                  <input 
                    value={newClientNip}
                    onChange={e => setNewClientNip(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="000-000-00-00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Branża</label>
                  <input 
                    required
                    value={newClientIndustry}
                    onChange={e => setNewClientIndustry(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="np. Transport Międzynarodowy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">ERP</label>
                    <select 
                      value={newClientErp}
                      onChange={e => setNewClientErp(e.target.value as ERPType)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-white"
                    >
                      {Object.values(ERPType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Wolumen</label>
                    <select 
                      value={newClientVolume}
                      onChange={e => setNewClientVolume(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-white"
                    >
                      {['1-100', '101-1000', '1000+'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg"
                  >
                    {isLoading ? 'GENEROWANIE...' : 'UTWÓRZ PROFIL'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors"
                  >
                    ANULUJ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientManager;
