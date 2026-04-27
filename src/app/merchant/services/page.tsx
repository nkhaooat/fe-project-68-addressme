'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { getMerchantServices, createMerchantService, updateMerchantService, deleteMerchantService } from '@/libs/auth';
import { MerchantServicesSkeleton, FadeIn } from '@/components/Skeletons';

interface ServiceData {
  _id: string;
  name: string;
  area: string;
  duration: number;
  price: number;
  oil: boolean;
  description: string;
  sessions: number;
}

const emptyForm = { name: '', area: '', duration: 60, price: 0, oil: false, description: '', sessions: 1 };

export default function MerchantServicesPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'merchant' || user?.merchantStatus !== 'approved') { router.push('/merchant'); return; }
    loadServices();
  }, [token]);

  async function loadServices() {
    try {
      const res = await getMerchantServices(token!);
      if (res.success) setServices(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      let res;
      if (editId) {
        res = await updateMerchantService(token!, editId, form);
      } else {
        res = await createMerchantService(token!, form);
      }
      if (res.success) {
        setMessage({ type: 'success', text: editId ? 'Service updated!' : 'Service created!' });
        setShowForm(false);
        setEditId(null);
        setForm(emptyForm);
        await loadServices();
      } else {
        setMessage({ type: 'error', text: res.message || 'Operation failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error' });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      const res = await deleteMerchantService(token!, id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Service deleted!' });
        await loadServices();
      } else {
        setMessage({ type: 'error', text: res.message || 'Delete failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error' });
    }
    setDeleteConfirm(null);
    setSaving(false);
  }

  function startEdit(svc: ServiceData) {
    setEditId(svc._id);
    setForm({ name: svc.name, area: svc.area, duration: svc.duration, price: svc.price, oil: svc.oil, description: svc.description || '', sessions: svc.sessions || 1 });
    setShowForm(true);
  }

  function startCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  if (loading) return <MerchantServicesSkeleton />;

  return (<FadeIn>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dungeon-header-text">Manage Services</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push('/merchant')} className="text-dungeon-secondary hover:text-dungeon-header-text text-sm transition-colors">
              Back to Dashboard
            </button>
            <button onClick={startCreate} className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors text-sm">
              Add Service
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm font-semibold ${message.type === 'success' ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-red-900/30 border border-red-700 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-dungeon-header-text mb-4">{editId ? 'Edit Service' : 'Add New Service'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Service Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
              </div>
              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Area / Type</label>
                <input value={form.area} onChange={e => setForm({...form, area: e.target.value})}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
              </div>
              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
              </div>
              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Price (THB)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.oil} onChange={e => setForm({...form, oil: e.target.checked})} className="w-4 h-4 accent-dungeon-accent" />
                <label className="text-dungeon-primary text-sm">Uses Oil</label>
              </div>
              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Sessions</label>
                <input type="number" value={form.sessions} onChange={e => setForm({...form, sessions: Number(e.target.value)})}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-dungeon-secondary text-sm mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} disabled={saving}
                className="px-6 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-6 py-2 bg-dungeon-surface border border-dungeon-outline text-dungeon-primary rounded-lg hover:border-dungeon-accent transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Services list */}
        {services.length === 0 ? (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-12 text-center">
            <p className="text-dungeon-secondary text-lg">No services yet</p>
            <p className="text-dungeon-muted text-sm mt-1">Add your first service to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(svc => (
              <div key={svc._id} className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-dungeon-header-text font-bold text-lg">{svc.name}</p>
                    <p className="text-dungeon-sub-header text-sm">{svc.area} | {svc.duration} min | THB {svc.price} | {svc.oil ? 'Oil' : 'No oil'}</p>
                    {svc.description && <p className="text-dungeon-secondary text-sm mt-1">{svc.description}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => startEdit(svc)}
                      className="px-4 py-2 bg-dungeon-canvas border border-dungeon-outline text-dungeon-primary rounded-lg hover:border-dungeon-accent transition-colors text-sm">
                      Edit
                    </button>
                    {deleteConfirm === svc._id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(svc._id)} disabled={saving}
                          className="px-3 py-2 bg-red-700 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2 bg-dungeon-canvas border border-dungeon-outline text-dungeon-secondary rounded-lg text-sm hover:text-dungeon-primary transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(svc._id)}
                        className="px-4 py-2 bg-dungeon-canvas border border-red-800/50 text-red-400 rounded-lg hover:border-red-600 transition-colors text-sm">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  </FadeIn>);
}
