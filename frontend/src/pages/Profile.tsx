import { useState, useEffect, useRef } from 'react';
import { api, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  AlertTriangle,
  Camera,
  Save,
  Edit2,
  Shield,
  Activity,
  Heart,
  Pill,
  FileText,
  CalendarCheck,
  Users
} from 'lucide-react';

interface UserStats {
  medicines: number;
  checkups: number;
  familyMembers: number;
  prescriptions: number;
}

export default function Profile() {
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    medicines: 0,
    checkups: 0,
    familyMembers: 0,
    prescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    allergies: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        blood_type: profile.blood_type || '',
        allergies: profile.allergies?.join(', ') || ''
      });
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    try {
      const data = await api.get('/api/dashboard');

      setStats({
        medicines: data.stats.totalMedicines || 0,
        checkups: data.stats.scheduledCheckupsTotal || 0,
        familyMembers: data.stats.familyMembers || 0,
        prescriptions: data.stats.prescriptions || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const allergiesArray = formData.allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      await updateProfile({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        blood_type: formData.blood_type || null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null
      });

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const form = new FormData();
      form.append('avatar', file);
      await api.upload('/api/profile/avatar', form);
      await refreshProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const diff = Date.now() - new Date(profile.date_of_birth).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const statItems = [
    { icon: Pill, label: 'Active Medicines', value: stats.medicines, color: 'text-sky-500', bg: 'bg-sky-100' },
    { icon: CalendarCheck, label: 'Upcoming Checkups', value: stats.checkups, color: 'text-amber-500', bg: 'bg-amber-100' },
    { icon: Users, label: 'Family Members', value: stats.familyMembers, color: 'text-violet-500', bg: 'bg-violet-100' },
    { icon: FileText, label: 'Prescriptions', value: stats.prescriptions, color: 'text-emerald-500', bg: 'bg-emerald-100' }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 rounded-3xl overflow-hidden">
          <div className="relative p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-24 -translate-x-24" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={fileUrl(profile.avatar_url)}
                      alt={profile.full_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white text-sky-600 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="text-center md:text-left text-white">
                <h1 className="text-3xl font-bold mb-1">{profile?.full_name || 'Welcome!'}</h1>
                <p className="text-sky-100 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {profile?.date_of_birth && (
                  <p className="text-sky-200 text-sm mt-2 flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    {getAge()} years old
                  </p>
                )}
              </div>

              {/* Edit Button */}
              <div className="md:ml-auto">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-sky-900">{value}</p>
              <p className="text-sm text-sky-600">{label}</p>
            </div>
          ))}
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-100">
            <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" />
              Personal Information
            </h2>
          </div>

          <div className="p-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Blood Type</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Peanuts, Penicillin, etc."
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                    <User className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-xs text-sky-600">Full Name</p>
                      <p className="font-medium text-sky-900">{profile?.full_name || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                    <Mail className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-xs text-sky-600">Email</p>
                      <p className="font-medium text-sky-900">{user?.email || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                    <Phone className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-xs text-sky-600">Phone</p>
                      <p className="font-medium text-sky-900">{profile?.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-xs text-sky-600">Date of Birth</p>
                      <p className="font-medium text-sky-900">
                        {profile?.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                    <Droplet className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="text-xs text-sky-600">Blood Type</p>
                      <p className="font-medium text-sky-900">{profile?.blood_type || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-amber-700">Allergies</p>
                      <p className="font-medium text-sky-900">
                        {profile?.allergies && profile.allergies.length > 0
                          ? profile.allergies.join(', ')
                          : 'No known allergies'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          <h2 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-500" />
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50">
              <span className="text-sky-600">Account Created</span>
              <span className="font-medium text-sky-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50">
              <span className="text-sky-600">Last Updated</span>
              <span className="font-medium text-sky-900">
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
