import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { FamilyMember, Medicine, HealthCheckup } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Users,
  Plus,
  X,
  Trash2,
  Edit2,
  Heart,
  Calendar,
  Pill,
  User,
  Baby,
  UserCog,
  HeartHandshake,
  Save
} from 'lucide-react';

interface FamilyMemberWithStats extends FamilyMember {
  medicines?: number;
  checkups?: number;
}

export default function FamilyHealth() {
  const { profile } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberWithStats | null>(null);
  const [memberMedicines, setMemberMedicines] = useState<Medicine[]>([]);
  const [memberCheckups, setMemberCheckups] = useState<HealthCheckup[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    allergies: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchFamilyMembers();
    }
  }, [profile]);

  const fetchFamilyMembers = async () => {
    if (!profile) return;

    try {
      const members: FamilyMember[] = await api.get('/api/family-members');

      // Fetch stats for each member
      const membersWithStats = await Promise.all(
        (members || []).map(async (member) => {
          const stats = await api.get(`/api/family-members/${member.id}/stats`);
          return {
            ...member,
            medicines: stats.activeMedicines || 0,
            checkups: stats.scheduledCheckups || 0
          };
        })
      );

      setFamilyMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetails = async (member: FamilyMemberWithStats) => {
    setSelectedMember(member);
    try {
      const [medicines, checkups] = await Promise.all([
        api.get(`/api/family-members/${member.id}/medicines`),
        api.get(`/api/family-members/${member.id}/checkups`),
      ]);
      setMemberMedicines(medicines || []);
      setMemberCheckups(checkups || []);
    } catch (error) {
      console.error('Error fetching member details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const allergiesArray = formData.allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const payload = {
        name: formData.name,
        relationship: formData.relationship,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        blood_type: formData.blood_type || null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null
      };

      if (editingMember) {
        await api.put(`/api/family-members/${editingMember.id}`, payload);
      } else {
        await api.post('/api/family-members', payload);
      }

      setShowForm(false);
      setEditingMember(null);
      resetForm();
      fetchFamilyMembers();
    } catch (error) {
      console.error('Error saving family member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relationship: member.relationship,
      date_of_birth: member.date_of_birth || '',
      gender: member.gender || '',
      blood_type: member.blood_type || '',
      allergies: member.allergies?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    try {
      await api.delete(`/api/family-members/${id}`);
      fetchFamilyMembers();
      setSelectedMember(null);
    } catch (error) {
      console.error('Error deleting family member:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      date_of_birth: '',
      gender: '',
      blood_type: '',
      allergies: ''
    });
  };

  const relationshipIcons: Record<string, typeof Heart> = {
    spouse: HeartHandshake,
    child: Baby,
    parent: UserCog,
    sibling: Users,
    other: User
  };

  const getRelationshipIcon = (relationship: string) => {
    const key = relationship.toLowerCase();
    for (const [k, icon] of Object.entries(relationshipIcons)) {
      if (key.includes(k)) return icon;
    }
    return User;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-900">Family Health Dashboard</h1>
            <p className="text-sky-600 mt-1">Manage your family's health records in one place</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingMember(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg shadow-sky-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-sky-100">
                <h2 className="text-xl font-bold text-sky-900">
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-700 mb-2">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <option value="">Select</option>
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMember(null);
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
                        {editingMember ? 'Update' : 'Add Member'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-sky-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sky-900">{selectedMember.name}</h2>
                    <p className="text-sm text-sky-600">{selectedMember.relationship}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Member Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedMember.date_of_birth && (
                    <div className="p-4 rounded-xl bg-sky-50">
                      <p className="text-xs text-sky-600 mb-1">Age</p>
                      <p className="font-medium text-sky-900">
                        {Math.floor((Date.now() - new Date(selectedMember.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </p>
                    </div>
                  )}
                  {selectedMember.gender && (
                    <div className="p-4 rounded-xl bg-sky-50">
                      <p className="text-xs text-sky-600 mb-1">Gender</p>
                      <p className="font-medium text-sky-900 capitalize">{selectedMember.gender}</p>
                    </div>
                  )}
                  {selectedMember.blood_type && (
                    <div className="p-4 rounded-xl bg-rose-50">
                      <p className="text-xs text-rose-600 mb-1">Blood Type</p>
                      <p className="font-medium text-rose-900">{selectedMember.blood_type}</p>
                    </div>
                  )}
                  {selectedMember.allergies && selectedMember.allergies.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50">
                      <p className="text-xs text-amber-600 mb-1">Allergies</p>
                      <p className="font-medium text-amber-900">{selectedMember.allergies.length}</p>
                    </div>
                  )}
                </div>

                {/* Medicines */}
                <div>
                  <h3 className="font-bold text-sky-900 mb-3 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-sky-500" />
                    Active Medicines ({memberMedicines.length})
                  </h3>
                  {memberMedicines.length > 0 ? (
                    <div className="space-y-2">
                      {memberMedicines.map(med => (
                        <div key={med.id} className="p-3 rounded-xl bg-sky-50 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sky-900">{med.name}</p>
                            <p className="text-sm text-sky-600">{med.dosage}</p>
                          </div>
                          <span className="text-xs text-sky-500 bg-sky-100 px-2 py-1 rounded-lg">{med.frequency}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sky-500 text-sm">No active medicines</p>
                  )}
                </div>

                {/* Checkups */}
                <div>
                  <h3 className="font-bold text-sky-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Upcoming Checkups ({memberCheckups.length})
                  </h3>
                  {memberCheckups.length > 0 ? (
                    <div className="space-y-2">
                      {memberCheckups.map(checkup => (
                        <div key={checkup.id} className="p-3 rounded-xl bg-amber-50 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sky-900">{checkup.title}</p>
                            <p className="text-sm text-sky-600">{checkup.facility || 'No facility'}</p>
                          </div>
                          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                            {new Date(checkup.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sky-500 text-sm">No upcoming checkups</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-sky-100">
                  <button
                    onClick={() => handleEdit(selectedMember)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMember.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Family Members Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : familyMembers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map(member => {
              const Icon = getRelationshipIcon(member.relationship);
              return (
                <div
                  key={member.id}
                  onClick={() => fetchMemberDetails(member)}
                  className="group p-6 bg-white rounded-2xl shadow-sm border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(member);
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-sky-100 text-sky-600 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-sky-900">{member.name}</h3>
                  <p className="text-sky-600 text-sm mb-4">{member.relationship}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-sky-600">
                      <Pill className="w-4 h-4" />
                      <span>{member.medicines} medicines</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <Calendar className="w-4 h-4" />
                      <span>{member.checkups} checkups</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-sky-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-sky-900 mb-2">No Family Members Added</h3>
            <p className="text-sky-600 mb-6">Add family members to track their health alongside yours</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Family Member
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
