import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Medicine, FamilyMember, MedicineReminder as MedicineReminderType } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Pill,
  Plus,
  X,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellOff,
  Save,
  User
} from 'lucide-react';

export default function MedicineReminder() {
  const { profile } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<MedicineReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once',
    times: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    family_member_id: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);
  useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);

  const fetchData = async () => {
    if (!profile) return;

    try {
      const [medicinesData, familyData] = await Promise.all([
        api.get('/api/medicines?reminders=today'),
        api.get('/api/family-members'),
      ]);

      setMedicines(medicinesData.medicines || []);
      setFamilyMembers(familyData || []);
      setReminders(medicinesData.reminders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
        family_member_id: formData.family_member_id || null,
        is_active: formData.is_active
      };

      if (editingMedicine) {
        await api.put(`/api/medicines/${editingMedicine.id}`, payload);
      } else {
        await api.post('/api/medicines', payload);
      }

      setShowForm(false);
      setEditingMedicine(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving medicine:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      times: medicine.times || ['08:00'],
      start_date: medicine.start_date,
      end_date: medicine.end_date || '',
      notes: medicine.notes || '',
      family_member_id: medicine.family_member_id || '',
      is_active: medicine.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await api.delete(`/api/medicines/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const toggleMedicineStatus = async (medicine: Medicine) => {
    try {
      await api.put(`/api/medicines/${medicine.id}`, { ...medicine, is_active: !medicine.is_active });
      fetchData();
    } catch (error) {
      console.error('Error toggling medicine:', error);
    }
  };

  const markReminderTaken = async (reminderId: string) => {
    try {
      await api.patch(`/api/medicines/reminders/${reminderId}`, {});
      fetchData();
    } catch (error) {
      console.error('Error marking reminder:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once',
      times: ['08:00'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: '',
      family_member_id: '',
      is_active: true
    });
  };

  const addTime = () => {
    if (selectedTime && !formData.times.includes(selectedTime)) {
      setFormData({ ...formData, times: [...formData.times, selectedTime] });
      setSelectedTime('');
    }
  };

  const removeTime = (time: string) => {
    setFormData({ ...formData, times: formData.times.filter(t => t !== time) });
  };

  const getFamilyMemberName = (id: string | null) => {
    if (!id) return 'Self';
    const member = familyMembers.find(m => m.id === id);
    return member?.name || 'Self';
  };

  const getReminderStatus = (medicine: Medicine) => {
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = reminders.filter(r => r.medicine_id === medicine.id);
    if (todayReminders.length === 0) return 'pending';
    const allTaken = todayReminders.every(r => r.taken);
    return allTaken ? 'completed' : 'partial';
  };

  useEffect(() => {
  const interval = setInterval(() => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    console.log("Current Time:", currentTime);
   console.log("Current Time:", currentTime);

medicines.forEach((medicine) => {
  console.log(
    "Medicine:",
    medicine.name,
    "Times:",
    medicine.times,
    "Active:",
    medicine.is_active
  );

  if (
    medicine.is_active &&
    medicine.times?.includes(currentTime)
  ) {
    console.log("MATCH FOUND");

    new Notification("💊 Medicine Reminder", {
      body: `Time to take ${medicine.name} (${medicine.dosage})`,
    });
  }
});
    medicines.forEach((medicine) => {
      if (
        medicine.is_active &&
        medicine.times?.includes(currentTime)
      ) {
        new Notification("💊 Medicine Reminder", {
          body: `Time to take ${medicine.name} (${medicine.dosage})`,
        });
      }
    });
  }, 1000); // Check every minute

  return () => clearInterval(interval);
}, [medicines]);
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-900">Medicine Reminder</h1>
            <p className="text-sky-600 mt-1">Never miss a dose with smart reminders</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingMedicine(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg shadow-sky-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{reminders.filter(r => r.taken).length}</p>
                <p className="text-sm text-sky-600">Taken Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{reminders.filter(r => !r.taken).length}</p>
                <p className="text-sm text-sky-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Pill className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{medicines.filter(m => m.is_active).length}</p>
                <p className="text-sm text-sky-600">Active Medicines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-sky-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-sky-900">
                  {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMedicine(null);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Aspirin"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">For</label>
                  <select
                    value={formData.family_member_id}
                    onChange={(e) => setFormData({ ...formData, family_member_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Self</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => {
                      const freq = e.target.value;
                      let times = formData.times;
                      if (freq === 'once') times = [formData.times[0] || '08:00'];
                      else if (freq === 'twice') times = ['08:00', '20:00'];
                  else if (freq === 'thrice') times = ['08:00', '14:00', '20:00'];
                      setFormData({ ...formData, frequency: freq, times });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="once">Once daily</option>
                    <option value="twice">Twice daily</option>
                    <option value="thrice">Three times daily</option>
                    <option value="custom">Custom schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Reminder Times</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.times.map(time => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-sm"
                      >
                        <Clock className="w-3 h-3" />
                        {time}
                        <button
                          type="button"
                          onClick={() => removeTime(time)}
                          className="w-4 h-4 rounded hover:bg-sky-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={addTime}
                      className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 font-medium hover:bg-sky-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Take with food, etc."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMedicine(null);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-6 rounded-xl border border-sky-200 text-sky-700 font-medium hover:bg-sky-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingMedicine ? 'Update' : 'Add Medicine'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicines List */}
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-100">
            <h2 className="text-lg font-bold text-sky-900">Your Medicines</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-sky-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : medicines.length > 0 ? (
            <div className="divide-y divide-sky-100">
              {medicines.map(medicine => {
                const status = getReminderStatus(medicine);
                return (
                  <div
                    key={medicine.id}
                    className={`p-4 hover:bg-sky-50 transition-colors ${!medicine.is_active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          status === 'completed' ? 'bg-emerald-100' :
                          status === 'partial' ? 'bg-amber-100' :
                          'bg-sky-100'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <Pill className={`w-6 h-6 ${
                              status === 'partial' ? 'text-amber-600' : 'text-sky-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sky-900">{medicine.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-600">
                              {medicine.dosage}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-sky-600 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {getFamilyMemberName(medicine.family_member_id)}
                            </span>
                            <span className="text-sm text-sky-500">
                              {medicine.times?.map(t => t).join(', ')}
                            </span>
                          </div>
                          {medicine.notes && (
                            <p className="text-xs text-sky-500 mt-1">{medicine.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMedicineStatus(medicine)}
                          className={`p-2 rounded-xl transition-colors ${
                            medicine.is_active
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-sky-400 hover:bg-sky-100'
                          }`}
                          title={medicine.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {medicine.is_active ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 rounded-xl text-sky-600 hover:bg-sky-100 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Pill className="w-16 h-16 text-sky-200 mx-auto mb-4" />
              <p className="text-sky-600 font-medium">No medicines added</p>
              <p className="text-sm text-sky-500 mt-1">Add your first medicine to get reminders</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
