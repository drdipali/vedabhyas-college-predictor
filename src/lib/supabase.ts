import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { 
  CollegeSubmission, 
  SubmissionStatus, 
  College, 
  CollegeAdminProfile,
  StudentPreference,
  StudentCollegeSuggestion,
  StudentSuggestionPayload 
} from '../types';
import { collegesData } from '../data/colleges';

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

// -----------------------------------------------------------------------------
// PASSWORD RESET & RECOVERY HELPERS
// -----------------------------------------------------------------------------
export const resetPasswordForEmail = async (
  email: string
): Promise<{ success: boolean; error: string | null }> => {
  const cleanEmail = email.trim().toLowerCase();
  const redirectTo = window.location.origin + import.meta.env.BASE_URL;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
    }
  }

  // Fallback in demo/mock mode
  console.log(`[Vedabhyas Auth] Password reset link dispatched to ${cleanEmail} with redirectTo: ${redirectTo}`);
  return { success: true, error: null };
};

export const updateAccountPassword = async (
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  }

  return { success: true, error: null };
};

// -----------------------------------------------------------------------------
// STUDENT PREFERENCES & CROWDSOURCED COLLEGE SUGGESTIONS
// -----------------------------------------------------------------------------
const LOCAL_PREFERENCES_KEY = 'vedabhyas_student_preferences_v1';
const LOCAL_SUGGESTIONS_KEY = 'vedabhyas_student_college_suggestions_v1';

// Seed initial realistic suggestions if storage is empty
const getLocalSuggestions = (): StudentCollegeSuggestion[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SUGGESTIONS_KEY);
    if (!raw) {
      const initial: StudentCollegeSuggestion[] = [
        {
          id: 'sug_demo_101',
          college_code: 'UPAYU082',
          college_name: 'Swami Kalyandev Government Ayurved College, Muzaffarnagar',
          state: 'Uttar Pradesh',
          college_type: 'Government',
          quota_type: 'State Quota',
          branches: ['Kayachikitsa', 'Shalya Tantra', 'Prasuti & Stri Roga'],
          submitted_by_user_ids: ['std-101', 'std-102', 'std-104', 'std-105'],
          verification_count: 14,
          submitted_payloads: [
            {
              user_id: 'std-101',
              student_name: 'Dr. Ananya Sharma',
              student_rank: 180,
              branch: 'Kayachikitsa',
              notes: 'State quota seats verified in UP Ayush round 2 seat matrix.',
              submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              user_id: 'std-105',
              student_name: 'Dr. Kavita Verma',
              student_rank: 580,
              branch: 'Shalya Tantra',
              notes: 'Official NCISM permission renewed for 2025-26.',
              submitted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
            },
          ],
          status: 'pending',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'sug_demo_102',
          college_code: 'AYU0345',
          college_name: 'Government Ayurveda College, Nanded',
          state: 'Maharashtra',
          college_type: 'Government',
          quota_type: 'State Quota',
          branches: ['Kayachikitsa', 'Panchakarma', 'Dravyaguna'],
          submitted_by_user_ids: ['std-102', 'std-103'],
          verification_count: 7,
          submitted_payloads: [
            {
              user_id: 'std-102',
              student_name: 'Dr. Rohan Deshmukh',
              student_rank: 95,
              branch: 'Panchakarma',
              notes: 'MUHS affiliated, 6 PG seats confirmed.',
              submitted_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          status: 'pending',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ];
      localStorage.setItem(LOCAL_SUGGESTIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalSuggestions = (list: StudentCollegeSuggestion[]) => {
  try {
    localStorage.setItem(LOCAL_SUGGESTIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save local suggestions', err);
  }
};

const getLocalPreferences = (userId: string): StudentPreference[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PREFERENCES_KEY);
    const all: StudentPreference[] = raw ? JSON.parse(raw) : [];
    return all.filter((p) => p.user_id === userId).sort((a, b) => a.priority_order - b.priority_order);
  } catch {
    return [];
  }
};

const saveLocalPreferences = (prefs: StudentPreference[]) => {
  try {
    const raw = localStorage.getItem(LOCAL_PREFERENCES_KEY);
    let all: StudentPreference[] = raw ? JSON.parse(raw) : [];
    const userIds = Array.from(new Set(prefs.map((p) => p.user_id)));
    all = all.filter((p) => !userIds.includes(p.user_id)).concat(prefs);
    localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save local preferences', err);
  }
};

// -----------------------------------------------------------------------------
// PREFERENCE LIST OPERATIONS
// -----------------------------------------------------------------------------
export const fetchStudentPreferences = async (userId: string): Promise<StudentPreference[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('student_preferences')
        .select(`
          id,
          user_id,
          college_id,
          suggestion_id,
          branch,
          priority_order,
          notes,
          created_at,
          colleges:college_id (
            id,
            name,
            state,
            college_type,
            quota_type,
            ncism_code,
            is_verified
          ),
          suggestions:suggestion_id (
            id,
            college_name,
            college_code,
            state,
            college_type,
            quota_type,
            status,
            verification_count
          )
        `)
        .eq('user_id', userId)
        .order('priority_order', { ascending: true });

      if (!error && Array.isArray(data)) {
        return data.map((row: any) => {
          const col = row.colleges;
          const sug = row.suggestions;
          return {
            id: row.id,
            user_id: row.user_id,
            college_id: row.college_id,
            suggestion_id: row.suggestion_id,
            branch: row.branch,
            priority_order: row.priority_order,
            notes: row.notes,
            created_at: row.created_at,
            college_name: col?.name || sug?.college_name || 'Selected College',
            college_code: col?.ncism_code || sug?.college_code || col?.id || 'AYUSH',
            state: col?.state || sug?.state || '',
            college_type: col?.college_type || sug?.college_type || 'Government',
            quota_type: col?.quota_type || sug?.quota_type || 'State Quota',
            is_verified: !!col,
            status: col ? 'verified' : (sug?.status || 'pending'),
          };
        });
      }
    } catch (e) {
      console.warn('Supabase fetch preferences failed, falling back to local', e);
    }
  }

  // Local fallback
  const list = getLocalPreferences(userId);
  const suggestions = getLocalSuggestions();
  
  return list.map((item) => {
    if (item.college_id) {
      const live = collegesData.find((c) => c.id === item.college_id);
      return {
        ...item,
        college_name: live?.name || live?.shortName || item.college_name || 'Ayurvedic Medical College',
        college_code: live?.ncism_code || live?.id || 'AYUSH',
        state: live?.state || item.state || 'Maharashtra',
        college_type: live?.institutionType || live?.college_type || item.college_type || 'Government',
        quota_type: live?.quota_type || live?.quota || item.quota_type || 'State Quota',
        is_verified: true,
        status: 'verified',
      };
    } else if (item.suggestion_id) {
      const sug = suggestions.find((s) => s.id === item.suggestion_id);
      return {
        ...item,
        college_name: sug?.college_name || item.college_name || 'Crowdsourced College',
        college_code: sug?.college_code || item.college_code || 'PENDING',
        state: sug?.state || item.state || '',
        college_type: sug?.college_type || item.college_type || 'Government',
        quota_type: sug?.quota_type || item.quota_type || 'State Quota',
        is_verified: sug?.status === 'approved',
        status: sug?.status || 'pending',
      };
    }
    return item;
  });
};

export const addStudentPreference = async (pref: {
  user_id: string;
  college_id?: string | null;
  suggestion_id?: string | null;
  branch: string;
  priority_order?: number;
  notes?: string;
  college_name?: string;
  college_code?: string;
  state?: string;
  college_type?: string;
  quota_type?: string;
  is_verified?: boolean;
}): Promise<StudentPreference> => {
  const currentList = await fetchStudentPreferences(pref.user_id);
  const nextOrder = pref.priority_order ?? (currentList.length > 0 
    ? Math.max(...currentList.map((p) => p.priority_order)) + 1 
    : 1);

  const newPref: StudentPreference = {
    id: `pref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: pref.user_id,
    college_id: pref.college_id || null,
    suggestion_id: pref.suggestion_id || null,
    branch: pref.branch,
    priority_order: nextOrder,
    notes: pref.notes || '',
    created_at: new Date().toISOString(),
    college_name: pref.college_name,
    college_code: pref.college_code,
    state: pref.state,
    college_type: pref.college_type,
    quota_type: pref.quota_type,
    is_verified: pref.is_verified ?? !!pref.college_id,
    status: pref.is_verified ? 'verified' : 'pending',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('student_preferences')
        .insert({
          user_id: pref.user_id,
          college_id: pref.college_id || null,
          suggestion_id: pref.suggestion_id || null,
          branch: pref.branch,
          priority_order: nextOrder,
          notes: pref.notes || '',
        })
        .select()
        .single();

      if (!error && data) {
        newPref.id = data.id;
      }
    } catch (e) {
      console.warn('Failed to insert preference to Supabase, saving locally', e);
    }
  }

  // Always sync local fallback
  const localList = getLocalPreferences(pref.user_id);
  localList.push(newPref);
  saveLocalPreferences(localList);

  return newPref;
};

export const updatePreferenceOrder = async (
  userId: string,
  orderedIds: string[]
): Promise<boolean> => {
  const localList = getLocalPreferences(userId);
  const reordered: StudentPreference[] = [];

  orderedIds.forEach((id, index) => {
    const found = localList.find((p) => p.id === id);
    if (found) {
      found.priority_order = index + 1;
      reordered.push(found);
    }
  });

  saveLocalPreferences(reordered);

  if (isSupabaseConfigured()) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('student_preferences')
          .update({ priority_order: i + 1 })
          .eq('id', orderedIds[i])
          .eq('user_id', userId);
      }
    } catch {}
  }

  return true;
};

export const removeStudentPreference = async (
  userId: string,
  prefId: string
): Promise<boolean> => {
  const localList = getLocalPreferences(userId).filter((p) => p.id !== prefId);
  // Re-normalize priority numbers
  localList.forEach((p, idx) => {
    p.priority_order = idx + 1;
  });
  saveLocalPreferences(localList);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('student_preferences').delete().eq('id', prefId).eq('user_id', userId);
    } catch {}
  }

  return true;
};

export const updateStudentPreferenceBranch = async (
  userId: string,
  prefId: string,
  newBranch: string
): Promise<boolean> => {
  const localList = getLocalPreferences(userId);
  const item = localList.find((p) => p.id === prefId);
  if (item) {
    item.branch = newBranch;
    saveLocalPreferences(localList);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('student_preferences')
        .update({ branch: newBranch })
        .eq('id', prefId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Failed to update preference branch in Supabase:', err);
    }
  }

  return true;
};

// -----------------------------------------------------------------------------
// SMART MISSING COLLEGE SUBMISSION & VERIFICATION
// -----------------------------------------------------------------------------
export const checkCollegeCodeExists = async (
  collegeCode: string
): Promise<{ liveCollege?: College; suggestion?: StudentCollegeSuggestion }> => {
  const cleanCode = collegeCode.trim().toUpperCase();

  // 1. Check live colleges in local database and Supabase
  let liveCollege = collegesData.find(
    (c) =>
      c.ncism_code?.trim().toUpperCase() === cleanCode ||
      c.id.trim().toUpperCase() === cleanCode ||
      c.shortName?.trim().toUpperCase() === cleanCode
  );

  if (!liveCollege && isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('colleges')
        .select('*')
        .or(`ncism_code.ilike.${cleanCode},id.ilike.${cleanCode}`)
        .limit(1);

      if (data && data.length > 0) {
        const item = data[0];
        liveCollege = {
          id: item.id,
          name: item.name,
          shortName: item.short_name || item.name,
          city: item.city || '',
          state: item.state,
          quota: (item.quota_type?.includes('AIQ') ? 'AIQ' : 'State') as any,
          institutionType: (item.college_type as any) || 'Government',
          closingRank: item.last_year_closing_rank?.UR ?? 3500,
          categoryClosingRanks: item.last_year_closing_rank || { General: 3500, OBC: 3900, EWS: 3700, SC: 5200, ST: 6500 },
          type: item.college_type,
          topBranches: item.departments || [],
          branches: item.departments || [],
          ncism_code: item.ncism_code,
          is_verified: true,
        };
      }
    } catch {}
  }

  // 2. Check student college suggestions
  let suggestion: StudentCollegeSuggestion | undefined;
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('student_college_suggestions')
        .select('*')
        .eq('college_code', cleanCode)
        .limit(1);

      if (data && data.length > 0) {
        suggestion = data[0];
      }
    } catch {}
  }

  if (!suggestion) {
    const localSuggestions = getLocalSuggestions();
    suggestion = localSuggestions.find((s) => s.college_code.toUpperCase() === cleanCode);
  }

  return { liveCollege, suggestion };
};

export const submitMissingCollege = async (data: {
  college_code: string;
  college_name: string;
  state: string;
  college_type: string;
  quota_type: string;
  branch: string;
  notes?: string;
  user_id: string;
  student_name?: string;
  student_rank?: number;
}): Promise<{
  action: 'added_existing_live' | 'updated_existing_suggestion' | 'created_new_suggestion';
  suggestion?: StudentCollegeSuggestion;
  liveCollege?: College;
  preference: StudentPreference;
}> => {
  const cleanCode = data.college_code.trim().toUpperCase();
  const existing = await checkCollegeCodeExists(cleanCode);

  // Case 1: College code already exists in live colleges table
  if (existing.liveCollege) {
    const pref = await addStudentPreference({
      user_id: data.user_id,
      college_id: existing.liveCollege.id,
      branch: data.branch,
      notes: data.notes,
      college_name: existing.liveCollege.name,
      college_code: cleanCode,
      state: existing.liveCollege.state,
      college_type: existing.liveCollege.institutionType,
      quota_type: existing.liveCollege.quota_type || existing.liveCollege.quota,
      is_verified: true,
    });

    return {
      action: 'added_existing_live',
      liveCollege: existing.liveCollege,
      preference: pref,
    };
  }

  // Payload record for cross-checking
  const payload: StudentSuggestionPayload = {
    user_id: data.user_id,
    student_name: data.student_name || 'Verified AIAPGET Candidate',
    student_rank: data.student_rank,
    branch: data.branch,
    notes: data.notes,
    submitted_at: new Date().toISOString(),
  };

  // Case 2: College code exists in student_college_suggestions
  if (existing.suggestion) {
    const sug = existing.suggestion;
    const hasAlreadySubmitted = sug.submitted_by_user_ids.includes(data.user_id);
    
    if (!hasAlreadySubmitted) {
      sug.submitted_by_user_ids.push(data.user_id);
      sug.verification_count = (sug.verification_count || 1) + 1;
      sug.submitted_payloads.push(payload);

      // Add branch if new
      if (data.branch && !sug.branches.includes(data.branch)) {
        sug.branches.push(data.branch);
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('student_college_suggestions')
            .update({
              submitted_by_user_ids: sug.submitted_by_user_ids,
              verification_count: sug.verification_count,
              submitted_payloads: sug.submitted_payloads,
              branches: sug.branches,
            })
            .eq('id', sug.id);
        } catch {}
      }

      const localList = getLocalSuggestions();
      const idx = localList.findIndex((s) => s.id === sug.id);
      if (idx >= 0) {
        localList[idx] = sug;
      } else {
        localList.push(sug);
      }
      saveLocalSuggestions(localList);
    }

    const pref = await addStudentPreference({
      user_id: data.user_id,
      suggestion_id: sug.id,
      branch: data.branch,
      notes: data.notes,
      college_name: sug.college_name,
      college_code: cleanCode,
      state: sug.state,
      college_type: sug.college_type,
      quota_type: sug.quota_type,
      is_verified: sug.status === 'approved',
    });

    return {
      action: 'updated_existing_suggestion',
      suggestion: sug,
      preference: pref,
    };
  }

  // Case 3: Brand new college suggestion
  const newSuggestion: StudentCollegeSuggestion = {
    id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    college_code: cleanCode,
    college_name: data.college_name.trim(),
    state: data.state,
    college_type: data.college_type,
    quota_type: data.quota_type,
    branches: [data.branch],
    submitted_by_user_ids: [data.user_id],
    verification_count: 1,
    submitted_payloads: [payload],
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data: inserted, error } = await supabase
        .from('student_college_suggestions')
        .insert({
          college_code: cleanCode,
          college_name: data.college_name.trim(),
          state: data.state,
          college_type: data.college_type,
          quota_type: data.quota_type,
          branches: [data.branch],
          submitted_by_user_ids: [data.user_id],
          verification_count: 1,
          submitted_payloads: [payload],
          status: 'pending',
        })
        .select()
        .single();

      if (!error && inserted) {
        newSuggestion.id = inserted.id;
      }
    } catch (e) {
      console.warn('Failed to insert suggestion to Supabase', e);
    }
  }

  // Save to local fallback
  const localList = getLocalSuggestions();
  localList.unshift(newSuggestion);
  saveLocalSuggestions(localList);

  const pref = await addStudentPreference({
    user_id: data.user_id,
    suggestion_id: newSuggestion.id,
    branch: data.branch,
    notes: data.notes,
    college_name: newSuggestion.college_name,
    college_code: cleanCode,
    state: newSuggestion.state,
    college_type: newSuggestion.college_type,
    quota_type: newSuggestion.quota_type,
    is_verified: false,
  });

  return {
    action: 'created_new_suggestion',
    suggestion: newSuggestion,
    preference: pref,
  };
};

// -----------------------------------------------------------------------------
// SUPER ADMIN SUGGESTIONS REVIEW & APPROVAL
// -----------------------------------------------------------------------------
export const fetchStudentSuggestions = async (): Promise<StudentCollegeSuggestion[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('student_college_suggestions')
        .select('*')
        .order('verification_count', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch {}
  }

  return getLocalSuggestions().sort((a, b) => b.verification_count - a.verification_count);
};

export const approveStudentSuggestion = async (
  suggestionId: string,
  editedData?: Partial<StudentCollegeSuggestion>
): Promise<{ success: boolean; newCollegeId: string }> => {
  const all = await fetchStudentSuggestions();
  const target = all.find((s) => s.id === suggestionId);
  if (!target) return { success: false, newCollegeId: '' };

  const merged = { ...target, ...editedData };
  const newCollegeId = `col_verified_${merged.college_code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // 1. Create approved College record and publish live
  await publishApprovedCollegeLive({
    id: `sub_${suggestionId}`,
    college_name: merged.college_name,
    state: merged.state,
    college_type: merged.college_type,
    quota_type: merged.quota_type,
    departments: merged.branches,
    ncism_code: merged.college_code,
    contact_person_name: 'Crowdsourced by Verified Candidates',
    designation: `Verified by ${merged.verification_count} Students`,
    contact_phone: '1800-AYUSH',
    official_email: 'admissions@ayush.gov.in',
    status: 'approved',
    created_at: merged.created_at,
  });

  // 2. Mark suggestion as approved
  merged.status = 'approved';
  const localSuggestions = getLocalSuggestions();
  const idx = localSuggestions.findIndex((s) => s.id === suggestionId);
  if (idx >= 0) {
    localSuggestions[idx] = merged;
    saveLocalSuggestions(localSuggestions);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('student_college_suggestions')
        .update({
          status: 'approved',
          college_name: merged.college_name,
          state: merged.state,
          college_type: merged.college_type,
          quota_type: merged.quota_type,
          branches: merged.branches,
        })
        .eq('id', suggestionId);
    } catch {}
  }

  // 3. Update all linked student_preferences pointing to this suggestion_id
  const rawPrefs = localStorage.getItem(LOCAL_PREFERENCES_KEY);
  if (rawPrefs) {
    try {
      const allPrefs: StudentPreference[] = JSON.parse(rawPrefs);
      allPrefs.forEach((p) => {
        if (p.suggestion_id === suggestionId) {
          p.college_id = newCollegeId;
          p.suggestion_id = null;
          p.is_verified = true;
          p.status = 'verified';
          p.college_name = merged.college_name;
        }
      });
      localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(allPrefs));
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('student_preferences')
        .update({
          college_id: newCollegeId,
          suggestion_id: null,
        })
        .eq('suggestion_id', suggestionId);
    } catch {}
  }

  return { success: true, newCollegeId };
};

export const rejectStudentSuggestion = async (
  suggestionId: string,
  reason?: string
): Promise<{ success: boolean }> => {
  const localSuggestions = getLocalSuggestions();
  const target = localSuggestions.find((s) => s.id === suggestionId);
  if (target) {
    target.status = 'rejected';
    target.admin_notes = reason || 'Duplicate or invalid college code.';
    saveLocalSuggestions(localSuggestions);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('student_college_suggestions')
        .update({
          status: 'rejected',
          admin_notes: reason || 'Duplicate or invalid college code.',
        })
        .eq('id', suggestionId);
    } catch {}
  }

  return { success: true };
};
