import type { StudentProfile } from '../types';

export const initialMockStudents: StudentProfile[] = [
  {
    id: 'std-101',
    fullName: 'Dr. Ananya Sharma',
    email: 'ananya.sharma.ayur@gmail.com',
    mobileNumber: '+91 98234 56712',
    bamsCollege: 'R.A. Podar Medical College (Ayurvedic), Worli, Mumbai',
    bamsState: 'Maharashtra',
    passingYear: 2024,
    bamsScore: '69.4%',
    aiapgetRank: 180,
    category: 'General',
    prepMethod: 'Ayush Gurukulam Coaching',
    dailyStudyHours: 7,
    prepDurationMonths: 12,
    targetSpecialty: 'Kayachikitsa',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-15T10:30:00Z',
  },
  {
    id: 'std-102',
    fullName: 'Dr. Rohan Deshmukh',
    email: 'rohan.ayush99@gmail.com',
    mobileNumber: '+91 94112 89345',
    bamsCollege: 'Tilak Ayurved Mahavidyalaya, Pune',
    bamsState: 'Maharashtra',
    passingYear: 2023,
    bamsScore: '66.8%',
    aiapgetRank: 95,
    category: 'General',
    prepMethod: 'Self-Study & Standard Samhitas',
    dailyStudyHours: 8,
    prepDurationMonths: 14,
    targetSpecialty: 'Shalya Tantra',
    counselingAssistanceRequired: false,
    registeredAt: '2024-11-16T14:15:00Z',
  },
  {
    id: 'std-103',
    fullName: 'Dr. Priya Nambiar',
    email: 'priya.nambiar.bams@outlook.com',
    mobileNumber: '+91 97456 12389',
    bamsCollege: 'Government Ayurveda College, Thiruvananthapuram',
    bamsState: 'Kerala',
    passingYear: 2024,
    bamsScore: '72.1%',
    aiapgetRank: 240,
    category: 'OBC',
    prepMethod: 'Online Test Series & Q-Bank',
    dailyStudyHours: 6,
    prepDurationMonths: 10,
    targetSpecialty: 'Panchakarma',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-16T18:40:00Z',
  },
  {
    id: 'std-104',
    fullName: 'Dr. Siddharth Meena',
    email: 'siddharth.meena.bams@gmail.com',
    mobileNumber: '+91 99280 44512',
    bamsCollege: 'National Institute of Ayurveda (NIA), Jaipur',
    bamsState: 'Rajasthan',
    passingYear: 2024,
    bamsScore: '68.0%',
    aiapgetRank: 1100,
    category: 'ST',
    prepMethod: 'Ayush Gurukulam Coaching',
    dailyStudyHours: 6,
    prepDurationMonths: 12,
    targetSpecialty: 'Dravyaguna',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-17T09:20:00Z',
  },
  {
    id: 'std-105',
    fullName: 'Dr. Kavita Verma',
    email: 'kavita.verma.bams@yahoo.com',
    mobileNumber: '+91 98390 77123',
    bamsCollege: 'State Ayurvedic College and Hospital, Lucknow',
    bamsState: 'Uttar Pradesh',
    passingYear: 2023,
    bamsScore: '67.5%',
    aiapgetRank: 580,
    category: 'SC',
    prepMethod: 'Combined Group Study & Mentorship',
    dailyStudyHours: 5,
    prepDurationMonths: 8,
    targetSpecialty: 'Prasuti & Stri Roga',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-17T16:05:00Z',
  },
  {
    id: 'std-106',
    fullName: 'Dr. Pradeep Patil',
    email: 'pradeep.patil.ayur@gmail.com',
    mobileNumber: '+91 98860 33491',
    bamsCollege: 'Government Ayurveda Medical College (GAMC), Bengaluru',
    bamsState: 'Karnataka',
    passingYear: 2024,
    bamsScore: '70.2%',
    aiapgetRank: 1450,
    category: 'General',
    prepMethod: 'External Coaching Institute',
    dailyStudyHours: 7,
    prepDurationMonths: 11,
    targetSpecialty: 'Kayachikitsa',
    counselingAssistanceRequired: false,
    registeredAt: '2024-11-18T11:50:00Z',
  },
  {
    id: 'std-107',
    fullName: 'Dr. Sneha Bhattacharya',
    email: 'sneha.bhatt.ayur@gmail.com',
    mobileNumber: '+91 98311 20495',
    bamsCollege: 'J.B. Roy State Ayurvedic Medical College, Kolkata',
    bamsState: 'West Bengal',
    passingYear: 2023,
    bamsScore: '65.9%',
    aiapgetRank: 740,
    category: 'EWS',
    prepMethod: 'Online Test Series & Q-Bank',
    dailyStudyHours: 6,
    prepDurationMonths: 9,
    targetSpecialty: 'Roga Nidana',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-18T13:20:00Z',
  },
  {
    id: 'std-108',
    fullName: 'Dr. Darshan Joshi',
    email: 'darshan.joshi.bams@gmail.com',
    mobileNumber: '+91 97245 61890',
    bamsCollege: 'Govt Akhandanand Ayurved College, Ahmedabad',
    bamsState: 'Gujarat',
    passingYear: 2024,
    bamsScore: '68.7%',
    aiapgetRank: 2100,
    category: 'OBC',
    prepMethod: 'Ayush Gurukulam Coaching',
    dailyStudyHours: 8,
    prepDurationMonths: 15,
    targetSpecialty: 'Shalakya Tantra',
    counselingAssistanceRequired: true,
    registeredAt: '2024-11-18T15:10:00Z',
  }
];

export const STORAGE_KEY_STUDENTS = 'vedabhyas_registered_students';
export const STORAGE_KEY_CURRENT_STUDENT = 'vedabhyas_current_student';

export function getStoredStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load students from localStorage', err);
  }
  // Initialize with mock data
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialMockStudents));
  } catch (e) {
    // ignore
  }
  return initialMockStudents;
}

export function saveStudentProfile(student: StudentProfile): void {
  const currentList = getStoredStudents();
  const existingIdx = currentList.findIndex((s) => s.id === student.id || s.email === student.email || s.mobileNumber === student.mobileNumber);
  
  let updatedList: StudentProfile[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = student;
  } else {
    updatedList = [student, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedList));
    localStorage.setItem(STORAGE_KEY_CURRENT_STUDENT, JSON.stringify(student));
  } catch (err) {
    console.error('Failed to save student profile', err);
  }
}

export function getCurrentStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_STUDENT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load current student', err);
  }
  return null;
}

export function clearCurrentStudent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT_STUDENT);
  } catch (err) {
    console.error('Failed to clear current student', err);
  }
}
