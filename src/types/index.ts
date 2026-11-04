export type UserRole = 'ADMIN' | 'MANAGER' | 'TEACHER';

export interface User {
  id: number;
  fullName: string;
  login: string;
  role: UserRole;
  teacherId?: number;
  subject?: string;
}

export interface Student {
  id: number;
  fullName: string;
  phone: string;
  parentPhone: string;
  birthDate: string;
  groupId: number | null;
  group?: Group;
  createdAt: string;
}

export interface Teacher {
  id: number;
  userId: number;
  phone: string;
  subject: string;
  user: {
    id: number;
    fullName: string;
    login: string;
    role: string;
  };
  groups?: Group[];
}

export interface Group {
  id: number;
  name: string;
  teacherId: number | null;
  teacher?: Teacher;
  schedule: string;
  scheduleType: 'ODD' | 'EVEN';
  attendanceToday?: {
    presentStudents: number;
    totalStudents: number;
    percentage: number;
  };
  students?: Student[];
  _count?: {
    students: number;
  };
}

export type AttendanceStatus = 'KELDI' | 'KELMADI' | 'KECHIKDI' | 'SABABLI';

export interface Attendance {
  id: number;
  studentId: number;
  student: Student;
  groupId: number;
  group: Group;
  date: string;
  status: AttendanceStatus;
  markedByTeacherId: number | null;
  markedByTeacher?: Teacher;
}

export interface Grade {
  id: number;
  studentId: number;
  student: Student;
  teacherId: number;
  teacher?: Teacher;
  score: number;
  comment?: string;
  date: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
}

export interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  groupsCount: number;
  todayScheduleType: 'ODD' | 'EVEN' | null;
  groupAttendance: {
    groupId: number;
    name: string;
    scheduleType: 'ODD' | 'EVEN';
    totalStudents: number;
    presentStudents: number;
    markedStudents: number;
    percentage: number;
  }[];
  statusCounts: {
    keldi: number;
    kelmadi: number;
    kechikdi: number;
    sababli: number;
  };
  recentStudents: Student[];
  recentAttendances: Attendance[];
}

export interface ManagerOverview {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface MonthlyChartItem {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface StudentRatingItem {
  rank: number;
  studentId: number;
  fullName: string;
  groupName: string;
  totalGradesCount: number;
  averageScore: number;
}
