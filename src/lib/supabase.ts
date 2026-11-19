import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CollegeSubmission, SubmissionStatus, College, CollegeAdminProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20
  );
};

// Fallback client for when credentials are not yet set
const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : placeholderUrl,
  isSupabaseConfigured() ? supabaseAnonKey : placeholderKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// -----------------------------------------------------------------------------
// LOCAL STORAGE FALLBACK STORAGE KEYS (Active when Supabase is not configured)
// -----------------------------------------------------------------------------
const LOCAL_SUBMISSIONS_KEY = 'vedabhyas_college_submissions_v1';
const LOCAL_COLLEGE_SESSION_KEY = 'vedabhyas_college_admin_session_v1';
const LOCAL_APPROVED_COLLEGES_KEY = 'vedabhyas_approved_colleges_v1';

// Seed sample submission if local storage is empty
const getLocalSubmissions = (): CollegeSubmission[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) {
      const initial: CollegeSubmission[] = [
        {
          id: 'sub_demo_001',
          college_name: 'Dr. D.Y. Patil College of Ayurved & Research Centre',
          ncism_code: 'AYU0014',
          state: 'Maharashtra',
          college_type: 'Deemed',
          quota_type: 'Deemed / Management',
          departments: ['Kayachikitsa', 'Shalya Tantra', 'Prasuti & Stri Roga', 'Panchakarma'],
          annual_fee: '₹7,50,000 / year',
          monthly_stipend: '₹55,000 / month',
          contact_person_name: 'Dr. Mahesh Kadam',
          designation: 'Vice Principal & PG Director',
          contact_phone: '9822012345',
          official_email: 'pgadmissions@dypatil.edu',
          proof_url: 'https://ayurved.dypatil.edu/seat-matrix-2025.pdf',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ];
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalSubmissions = (subs: CollegeSubmission[]) => {
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs));
  } catch (e) {
    console.error('Failed to save local submissions', e);
  }
};

// -----------------------------------------------------------------------------
// COLLEGE ADMIN AUTHENTICATION
// -----------------------------------------------------------------------------
export const signUpCollegeAdmin = async (
  email: string,
  password: string,
  profile: {
    collegeName: string;
    contactPersonName: string;
    designation: string;
    phone: string;
  }
): Promise<{ user: CollegeAdminProfile | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'college_admin',
            college_name: profile.collegeName,
            contact_person_name: profile.contactPersonName,
            designation: profile.designation,
            phone: profile.phone,
          },
        },
      });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Registration failed' };

      const adminUser: CollegeAdminProfile = {
        id: data.user.id,
        email: data.user.email || email,
        collegeName: profile.collegeName,
        contactPersonName: profile.contactPersonName,
        designation: profile.designation,
        phone: profile.phone,
      };
      return { user: adminUser, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Supabase auth error' };
    }
  }

  // Local Mock Mode
  const mockUser: CollegeAdminProfile = {
    id: `col_admin_${Date.now()}`,
    email,
    collegeName: profile.collegeName,
    contactPersonName: profile.contactPersonName,
    designation: profile.designation,
    phone: profile.phone,
  };
  localStorage.setItem(LOCAL_COLLEGE_SESSION_KEY, JSON.stringify(mockUser));
  return { user: mockUser, error: null };
};

export const signInCollegeAdmin = async (
  email: string,
  password: string
): Promise<{ user: CollegeAdminProfile | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'User not found' };

      const meta = data.user.user_metadata || {};
      const adminUser: CollegeAdminProfile = {
        id: data.user.id,
        email: data.user.email || email,
        collegeName: meta.college_name || 'Ayurved College Admin',
        contactPersonName: meta.contact_person_name || 'Administrator',
        designation: meta.designation || 'College Representative',
        phone: meta.phone || '',
      };
      return { user: adminUser, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Failed to sign in' };
    }
  }

  // Local Mock Mode
  // If stored in local session, load it
  const saved = localStorage.getItem(LOCAL_COLLEGE_SESSION_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { user: parsed, error: null };
    } catch {}
  }

  const mockUser: CollegeAdminProfile = {
    id: `col_admin_${Date.now()}`,
    email,
    collegeName: 'Verified Ayurved Institute',
    contactPersonName: 'College Representative',
    designation: 'Admissions Officer',
    phone: '9822000000',
  };
  localStorage.setItem(LOCAL_COLLEGE_SESSION_KEY, JSON.stringify(mockUser));
  return { user: mockUser, error: null };
};

export const getActiveCollegeAdmin = async (): Promise<CollegeAdminProfile | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const meta = data.user.user_metadata || {};
        return {
          id: data.user.id,
          email: data.user.email || '',
          collegeName: meta.college_name,
          contactPersonName: meta.contact_person_name,
          designation: meta.designation,
          phone: meta.phone,
        };
      }
    } catch {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_COLLEGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const signOutCollegeAdmin = async (): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  localStorage.removeItem(LOCAL_COLLEGE_SESSION_KEY);
};

// -----------------------------------------------------------------------------
// SUBMISSION DATABASE OPERATIONS
// -----------------------------------------------------------------------------
export const submitCollegeData = async (
  submissionData: Omit<CollegeSubmission, 'id' | 'created_at' | 'status'>
): Promise<{ data: CollegeSubmission | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('college_submissions')
        .insert([
          {
            ...submissionData,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, falling back to local:', error.message);
      } else if (data) {
        return { data: data as CollegeSubmission, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase call error:', e.message);
    }
  }

  // Local fallback storage
  const newSub: CollegeSubmission = {
    ...submissionData,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const current = getLocalSubmissions();
  const updated = [newSub, ...current];
  saveLocalSubmissions(updated);

  return { data: newSub, error: null };
};

export const fetchAllSubmissions = async (): Promise<CollegeSubmission[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('college_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CollegeSubmission[];
      }
    } catch (e) {
      console.warn('Supabase fetchAllSubmissions failed:', e);
    }
  }

  return getLocalSubmissions();
};

export const fetchSubmissionsByUser = async (
  userId?: string,
  userEmail?: string
): Promise<CollegeSubmission[]> => {
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('college_submissions')
        .select('*')
        .eq('submitted_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as CollegeSubmission[];
      }
    } catch (e) {
      console.warn('Supabase fetchSubmissionsByUser failed:', e);
    }
  }

  const all = getLocalSubmissions();
  if (userId) {
    return all.filter((s) => s.submitted_by_user_id === userId || (userEmail && s.official_email === userEmail));
  }
  return all;
};

// -----------------------------------------------------------------------------
// SUPER ADMIN APPROVAL WORKFLOW
// -----------------------------------------------------------------------------
export const updateSubmissionStatus = async (
  submissionId: string,
  status: SubmissionStatus,
  adminNotes?: string,
  editedFields?: Partial<CollegeSubmission>
): Promise<{ success: boolean; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
      if (editedFields) Object.assign(updatePayload, editedFields);

      const { error } = await supabase
        .from('college_submissions')
        .update(updatePayload)
        .eq('id', submissionId);

      if (error) {
        console.warn('Supabase update failed:', error.message);
      }
    } catch (e: any) {
      console.warn('Supabase update error:', e.message);
    }
  }

  // Update in local fallback storage
  const all = getLocalSubmissions();
  const index = all.findIndex((s) => s.id === submissionId);
  if (index !== -1) {
    all[index] = {
      ...all[index],
      status,
      admin_notes: adminNotes !== undefined ? adminNotes : all[index].admin_notes,
      updated_at: new Date().toISOString(),
      ...(editedFields || {}),
    };
    saveLocalSubmissions(all);
  }

  return { success: true, error: null };
};

// -----------------------------------------------------------------------------
// APPROVED LIVE COLLEGES (Sync into live table)
// -----------------------------------------------------------------------------
export const publishApprovedCollegeLive = async (
  submission: CollegeSubmission
): Promise<{ success: boolean; college: Partial<College> | null }> => {
  // Format into College object
  const slug = submission.college_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const approvedCollege: Partial<College> = {
    id: `verified_${slug}`,
    name: submission.college_name,
    shortName: submission.college_name.split(' ')[0] + ' ' + (submission.college_name.split(' ')[1] || ''),
    college_name: submission.college_name,
    city: submission.state,
    state: submission.state,
    quota: submission.quota_type.includes('Deemed')
      ? 'Deemed/Mgt'
      : submission.quota_type.includes('State')
      ? 'State'
      : 'AIQ',
    quota_type: submission.quota_type,
    institutionType: submission.college_type.includes('Deemed')
      ? 'Deemed'
      : submission.college_type.includes('Private')
      ? 'Private'
      : 'Government',
    college_type: submission.college_type,
    type: `${submission.college_type} Institute`,
    topBranches: submission.departments.length > 0 ? submission.departments : ['Kayachikitsa', 'Shalya Tantra'],
    branches: submission.departments,
    annual_fee: submission.annual_fee,
    monthly_stipend: submission.monthly_stipend,
    source_url: submission.proof_url || 'https://aaccc.gov.in/pg-counselling/',
    ncism_code: submission.ncism_code,
    is_verified: true,
    verified_at: new Date().toISOString(),
    verified_by: `${submission.contact_person_name} (${submission.designation})`,
    closingRank: 3500,
    categoryClosingRanks: {
      General: 3500,
      OBC: 3900,
      EWS: 3700,
      SC: 5200,
      ST: 6500,
    },
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('colleges').upsert([
        {
          id: approvedCollege.id,
          name: approvedCollege.name,
          short_name: approvedCollege.shortName,
          city: approvedCollege.city,
          state: approvedCollege.state,
          college_type: approvedCollege.college_type,
          quota_type: approvedCollege.quota_type,
          departments: approvedCollege.branches,
          annual_fee: approvedCollege.annual_fee,
          monthly_stipend: approvedCollege.monthly_stipend,
          source_url: approvedCollege.source_url,
          ncism_code: approvedCollege.ncism_code,
          is_verified: true,
          verified_at: approvedCollege.verified_at,
          verified_by: approvedCollege.verified_by,
        },
      ]);
      if (error) {
        console.warn('Supabase upsert to live colleges failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase error upserting college:', e);
    }
  }

  // Also save to local approved colleges
  try {
    const raw = localStorage.getItem(LOCAL_APPROVED_COLLEGES_KEY);
    const existing: Partial<College>[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((c) => c.id !== approvedCollege.id);
    localStorage.setItem(LOCAL_APPROVED_COLLEGES_KEY, JSON.stringify([approvedCollege, ...filtered]));
  } catch {}

  return { success: true, college: approvedCollege };
};

export const getLiveApprovedColleges = async (): Promise<Partial<College>[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('is_verified', true);

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          shortName: item.short_name || item.name,
          college_name: item.name,
          city: item.city || item.state,
          state: item.state,
          college_type: item.college_type,
          quota_type: item.quota_type,
          topBranches: item.departments || [],
          branches: item.departments || [],
          annual_fee: item.annual_fee,
          monthly_stipend: item.monthly_stipend,
          source_url: item.source_url,
          ncism_code: item.ncism_code,
          is_verified: true,
          verified_at: item.verified_at,
          verified_by: item.verified_by,
          closingRank: item.last_year_closing_rank?.UR ?? 3500,
          categoryClosingRanks: item.last_year_closing_rank ?? {
            General: 3500,
            OBC: 3900,
            EWS: 3700,
            SC: 5200,
            ST: 6500,
          },
        }));
      }
    } catch {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_APPROVED_COLLEGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
