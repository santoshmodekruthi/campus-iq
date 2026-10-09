import { COLLEGES } from '../../shared/colleges.mjs';
import { applyAcademicRisk } from '../services/analytics.js';

const firstNames = [
  'Aarav', 'Aditi', 'Akash', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Meera', 'Neel',
  'Nisha', 'Pranav', 'Riya', 'Saanvi', 'Sameer', 'Tanvi', 'Varun', 'Vedika', 'Yash', 'Zoya',
];
const lastNames = [
  'Ahuja', 'Bhat', 'Chandra', 'Das', 'Ghosh', 'Iyer', 'Jain', 'Kapoor', 'Khan', 'Kulkarni',
  'Menon', 'Mishra', 'Nair', 'Rao', 'Reddy', 'Saxena', 'Shah', 'Singh', 'Verma', 'Joshi',
];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business'];
const round = (value) => Math.round(value * 100) / 100;

export function formatInitialPassword(dateOfBirth) {
  const date = new Date(dateOfBirth);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}${month}${date.getUTCFullYear()}`;
}

export function generateDemoStudents() {
  const students = [];
  let sequence = 0;

  for (const college of COLLEGES) {
    for (let index = 1; index <= 100; index += 1) {
      sequence += 1;
      const number = String(index).padStart(3, '0');
      const dob = new Date(Date.UTC(2002 + (index % 6), (index * 5) % 12, 1 + ((index * 7) % 28)));
      const attendance = 52 + ((index * 13 + COLLEGES.indexOf(college) * 7) % 48);
      const assignmentCount = 20;
      const assignmentsSubmitted = 10 + ((index * 7 + COLLEGES.indexOf(college)) % 11);
      const semester = 1 + ((index + COLLEGES.indexOf(college)) % 8);
      const assignmentCompletion = assignmentsSubmitted / assignmentCount * 100;
      const scoreBase = 42 + ((index * 17 + COLLEGES.indexOf(college) * 11) % 55);
      const academicMarks = [
        Math.max(20, scoreBase - ((index * 3) % 14)),
        scoreBase,
        Math.min(100, scoreBase + ((index * 5) % 12)),
      ];
      const gpa = round(academicMarks.reduce((sum, mark) => sum + mark, 0) / academicMarks.length / 10);
      const historyEnd = new Date(Date.UTC(2026, 8, 1));
      const declining = (index + COLLEGES.indexOf(college)) % 4 === 0;
      const performanceHistory = [
        { date: new Date(historyEnd.getTime() - 60 * 86400000), value: round(gpa + (declining ? 0.7 : -0.2)) },
        { date: new Date(historyEnd.getTime() - 30 * 86400000), value: round(gpa + (declining ? 0.4 : -0.1)) },
        { date: historyEnd, value: gpa },
      ];
      const student = {
        studentId: `CAMPUS-${college}-${number}`,
        name: `${firstNames[(index - 1) % firstNames.length]} ${lastNames[Math.floor((index - 1) / firstNames.length) % lastNames.length]}`,
        email: `student.${college.toLowerCase()}${number}@example.invalid`,
        password: formatInitialPassword(dob),
        role: 'student',
        college,
        registrationNumber: `${college}${number}`,
        dateOfBirth: dob,
        mobileNumber: `+910000${String(sequence).padStart(7, '0')}`,
        department: departments[(index + COLLEGES.indexOf(college)) % departments.length],
        semester,
        academicYear: Math.ceil(semester / 2),
        attendancePercentage: attendance,
        attendanceHistory: [3, 2, 1, 0].map((offset) => ({
          date: new Date(historyEnd.getTime() - offset * 30 * 86400000),
          percentage: Math.max(0, Math.min(100, attendance + (offset - 3) * 2)),
        })),
        academicMarks,
        assignmentCompletion,
        assignmentsTotal: assignmentCount,
        assignmentsSubmitted,
        gpa,
        performanceHistory,
        enrollmentStatus: index % 47 === 0 ? 'On leave' : index % 71 === 0 ? 'Graduated' : 'Active',
        isSeeded: true,
        mustChangePassword: true,
      };
      applyAcademicRisk(student);
      student.profileStatistics = {
        riskLevel: student.riskLevel,
        riskReason: student.riskReasons.join(', '),
        totalAttendance: 100,
        presentCount: attendance,
        absentCount: 100 - attendance,
        consecutiveAbsences: 0,
        assignmentsSubmitted,
        assignmentsMissed: assignmentCount - assignmentsSubmitted,
        averagePerformance: academicMarks.reduce((sum, mark) => sum + mark, 0) / academicMarks.length,
        performanceScores: academicMarks,
      };
      students.push(student);
    }
  }

  return students;
}
