// Shared data types — used to come from '../lib/supabase', now plain types
// matching the backend's Postgres schema. No Supabase client here anymore.

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  created_at: string;
};

export type Medicine = {
  id: string;
  user_id: string;
  family_member_id: string | null;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type MedicineReminder = {
  id: string;
  medicine_id: string;
  scheduled_time: string;
  taken: boolean;
  taken_at: string | null;
  date: string;
  created_at: string;
};

export type Prescription = {
  id: string;
  user_id: string;
  family_member_id: string | null;
  image_url: string | null;
  doctor_name: string | null;
  diagnosis: string | null;
  notes: string | null;
  prescribed_date: string;
  created_at: string;
};

export type HealthCheckup = {
  id: string;
  user_id: string;
  family_member_id: string | null;
  title: string;
  checkup_type: string | null;
  facility: string | null;
  scheduled_date: string;
  reminder_days_before: number;
  notes: string | null;
  status: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  is_user: boolean;
  created_at: string;
};
