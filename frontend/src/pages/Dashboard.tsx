import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Medicine, HealthCheckup, FamilyMember } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Pill,
  CalendarCheck,
  Users,
  FileScan,
  MessageCircle,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Heart,
  ChevronRight
} from 'lucide-react';

interface DashboardStats {
  totalMedicines: number;
  todayReminders: number;
  completedToday: number;
  upcomingCheckups: number;
  familyMembers: number;
  prescriptions: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    todayReminders: 0,
    completedToday: 0,
    upcomingCheckups: 0,
    familyMembers: 0,
    prescriptions: 0
  });
  const [upcomingMedicines, setUpcomingMedicines] = useState<Medicine[]>([]);
  const [upcomingCheckups, setUpcomingCheckups] = useState<HealthCheckup[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      const data = await api.get('/api/dashboard');

      setStats(data.stats);
      setUpcomingMedicines(data.upcomingMedicines as Medicine[]);
      setUpcomingCheckups(data.upcomingCheckups as HealthCheckup[]);
      setFamilyMembers(data.familyMembers as FamilyMember[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { to: '/prescription-scanner', icon: FileScan, label: 'Scan Prescription', color: 'from-sky-500 to-blue-600' },
    { to: '/medicine-reminder', icon: Pill, label: 'Add Medicine', color: 'from-emerald-500 to-teal-600' },
    { to: '/health-checkup', icon: CalendarCheck, label: 'Schedule Checkup', color: 'from-amber-500 to-orange-600' },
    { to: '/ai-chatbot', icon: MessageCircle, label: 'Ask AI', color: 'from-violet-500 to-purple-600' },
  ];

  const statCards = [
    { icon: Pill, label: 'Active Medicines', value: stats.totalMedicines, color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: CheckCircle2, label: 'Taken Today', value: `${stats.completedToday}/${stats.todayReminders}`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: CalendarCheck, label: 'Upcoming Checkups', value: stats.upcomingCheckups, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Users, label: 'Family Members', value: stats.familyMembers, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-sky-100 text-lg">
              Here's your health overview for today
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Health Score: Good</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">On Track</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-sky-900">{value}</p>
              <p className="text-sm text-sky-600">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-sky-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(({ to, icon: Icon, label, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-sky-100 hover:border-sky-200 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-sky-800">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Medicines */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-sky-900">Today's Medicines</h3>
              <Link to="/medicine-reminder" className="text-sky-600 hover:text-sky-800 flex items-center gap-1 text-sm font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-sky-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcomingMedicines.length > 0 ? (
              <div className="space-y-3">
                {upcomingMedicines.map(medicine => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sky-900">{medicine.name}</p>
                        <p className="text-sm text-sky-600">{medicine.dosage} - {medicine.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sky-600 text-sm">
                      <Clock className="w-4 h-4" />
                      {medicine.times?.[0] || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-sky-300 mx-auto mb-3" />
                <p className="text-sky-600">No medicines scheduled</p>
                <Link to="/medicine-reminder" className="text-sky-600 hover:text-sky-800 font-medium text-sm mt-2 inline-block">
                  Add your first medicine
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Checkups */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-sky-900">Upcoming Checkups</h3>
              <Link to="/health-checkup" className="text-sky-600 hover:text-sky-800 flex items-center gap-1 text-sm font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-sky-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcomingCheckups.length > 0 ? (
              <div className="space-y-3">
                {upcomingCheckups.map(checkup => (
                  <div
                    key={checkup.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <CalendarCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sky-900">{checkup.title}</p>
                        <p className="text-sm text-sky-600">{checkup.facility || 'No facility specified'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-sky-900">
                        {new Date(checkup.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-sky-600">
                        {Math.ceil((new Date(checkup.scheduled_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarCheck className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                <p className="text-sky-600">No upcoming checkups</p>
                <Link to="/health-checkup" className="text-sky-600 hover:text-sky-800 font-medium text-sm mt-2 inline-block">
                  Schedule a checkup
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-sky-900">Family Health Overview</h3>
            <Link to="/family-health" className="text-sky-600 hover:text-sky-800 flex items-center gap-1 text-sm font-medium">
              Manage Family <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-sky-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : familyMembers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {familyMembers.map(member => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-sky-900">{member.name}</p>
                  <p className="text-sm text-sky-600">{member.relationship}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <p className="text-sky-600">No family members added yet</p>
              <Link to="/family-health" className="text-sky-600 hover:text-sky-800 font-medium text-sm mt-2 inline-block">
                Add family members
              </Link>
            </div>
          )}
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Daily Health Tip</h3>
              <p className="text-emerald-100">
                Remember to drink at least 8 glasses of water today. Staying hydrated helps maintain energy levels and supports overall health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
