import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { HealthCheckup, FamilyMember } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  CalendarCheck,
  Plus,
  X,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  User,
  Bell
} from 'lucide-react';

export default function HealthCheckupReminder() {
  const { profile } = useAuth();
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState<HealthCheckup | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const [formData, setFormData] = useState({
    title: '',
    checkup_type: '',
    facility: '',
    scheduled_date: '',
    reminder_days_before: 3,
    notes: '',
    family_member_id: '',
    status: 'scheduled'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    try {
      const [checkupsData, familyData] = await Promise.all([
        api.get('/api/health-checkups'),
        api.get('/api/family-members'),
      ]);

      setCheckups(checkupsData || []);
      setFamilyMembers(familyData || []);
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
        title: formData.title,
        checkup_type: formData.checkup_type,
        facility: formData.facility,
        scheduled_date: formData.scheduled_date,
        reminder_days_before: formData.reminder_days_before,
        notes: formData.notes || null,
        family_member_id: formData.family_member_id || null,
        status: formData.status
      };

      if (editingCheckup) {
        await api.put(`/api/health-checkups/${editingCheckup.id}`, payload);
      } else {
        await api.post('/api/health-checkups', payload);
      }

      setShowForm(false);
      setEditingCheckup(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving checkup:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (checkup: HealthCheckup) => {
    setEditingCheckup(checkup);
    setFormData({
      title: checkup.title,
      checkup_type: checkup.checkup_type || '',
      facility: checkup.facility || '',
      scheduled_date: checkup.scheduled_date,
      reminder_days_before: checkup.reminder_days_before,
      notes: checkup.notes || '',
      family_member_id: checkup.family_member_id || '',
      status: checkup.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checkup?')) return;

    try {
      await api.delete(`/api/health-checkups/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting checkup:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/health-checkups/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      checkup_type: '',
      facility: '',
      scheduled_date: '',
      reminder_days_before: 3,
      notes: '',
      family_member_id: '',
      status: 'scheduled'
    });
  };

  const getFamilyMemberName = (id: string | null) => {
    if (!id) return 'Self';
    const member = familyMembers.find(m => m.id === id);
    return member?.name || 'Self';
  };

  const getDaysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredCheckups = checkups.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const upcomingCount = checkups.filter(c => c.status === 'scheduled' && getDaysUntil(c.scheduled_date) >= 0).length;
  const overdueCount = checkups.filter(c => c.status === 'scheduled' && getDaysUntil(c.scheduled_date) < 0).length;

  const checkupTypes = [
    'Annual Physical',
    'Dental Checkup',
    'Eye Examination',
    'Blood Test',
    'Heart Screening',
    'Cancer Screening',
    'Vaccination',
    'Specialist Consultation',
    'Lab Work',
    'Other'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-900">Health Checkup Reminders</h1>
            <p className="text-sky-600 mt-1">Schedule and track your medical appointments</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingCheckup(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg shadow-sky-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add Checkup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{upcomingCount}</p>
                <p className="text-sm text-sky-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{overdueCount}</p>
                <p className="text-sm text-sky-600">Overdue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-900">{checkups.filter(c => c.status === 'completed').length}</p>
                <p className="text-sm text-sky-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-sky-600 hover:bg-sky-50 border border-sky-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-sky-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-sky-900">
                  {editingCheckup ? 'Edit Checkup' : 'Schedule Checkup'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCheckup(null);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Annual Physical Exam"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Checkup Type</label>
                  <select
                    value={formData.checkup_type}
                    onChange={(e) => setFormData({ ...formData, checkup_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select type</option>
                    {checkupTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium text-sky-700 mb-2">Facility</label>
                  <input
                    type="text"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    placeholder="Hospital/Clinic name"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Remind Before</label>
                    <select
                      value={formData.reminder_days_before}
                      onChange={(e) => setFormData({ ...formData, reminder_days_before: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={1}>1 day</option>
                      <option value={2}>2 days</option>
                      <option value={3}>3 days</option>
                      <option value={5}>5 days</option>
                      <option value={7}>1 week</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                {editingCheckup && (
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCheckup(null);
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
                        {editingCheckup ? 'Update' : 'Schedule'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Checkups List */}
        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
              ))}
            </>
          ) : filteredCheckups.length > 0 ? (
            filteredCheckups.map(checkup => {
              const daysUntil = getDaysUntil(checkup.scheduled_date);
              const isOverdue = daysUntil < 0 && checkup.status === 'scheduled';
              const isToday = daysUntil === 0;

              return (
                <div
                  key={checkup.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border ${
                    isOverdue ? 'border-rose-200 bg-rose-50/30' :
                    isToday ? 'border-amber-200 bg-amber-50/30' :
                    'border-sky-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        checkup.status === 'completed' ? 'bg-emerald-100' :
                        checkup.status === 'cancelled' ? 'bg-slate-100' :
                        isOverdue ? 'bg-rose-100' :
                        'bg-sky-100'
                      }`}>
                        {checkup.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : checkup.status === 'cancelled' ? (
                          <XCircle className="w-6 h-6 text-slate-500" />
                        ) : (
                          <CalendarCheck className={`w-6 h-6 ${isOverdue ? 'text-rose-600' : 'text-sky-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sky-900">{checkup.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            checkup.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            checkup.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                            isOverdue ? 'bg-rose-100 text-rose-700' :
                            'bg-sky-100 text-sky-700'
                          }`}>
                            {checkup.status === 'completed' ? 'Completed' :
                             checkup.status === 'cancelled' ? 'Cancelled' :
                             isOverdue ? 'Overdue' :
                             isToday ? 'Today' :
                             `In ${daysUntil} days`}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-sky-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getFamilyMemberName(checkup.family_member_id)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(checkup.scheduled_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {checkup.facility && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {checkup.facility}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Bell className="w-4 h-4" />
                            {checkup.reminder_days_before} days before
                          </span>
                        </div>
                        {checkup.notes && (
                          <p className="text-sm text-sky-500 mt-2">{checkup.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {checkup.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateStatus(checkup.id, 'completed')}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => updateStatus(checkup.id, 'cancelled')}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(checkup)}
                        className="p-2 rounded-xl text-sky-600 hover:bg-sky-100 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(checkup.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-sky-100">
              <CalendarCheck className="w-16 h-16 text-sky-200 mx-auto mb-4" />
              <p className="text-sky-600 font-medium">No checkups found</p>
              <p className="text-sm text-sky-500 mt-1">
                {filter === 'all' ? 'Schedule your first checkup' : `No ${filter} checkups`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
