import test from 'node:test';
import assert from 'node:assert/strict';
import { COLLEGES } from '../../shared/colleges.mjs';
import { generateDemoStudents, formatInitialPassword } from '../data/demoStudents.js';
import { assessAcademicRisk } from '../services/analytics.js';

test('fixed colleges and synthetic student cohort contain exactly 100 students each', () => {
  const students = generateDemoStudents();
  assert.deepEqual(COLLEGES, ['MBU', 'SRM', 'VIT', 'GMR', 'CBIT', 'NSRIT', 'RAGHU', 'ANITS', 'LPU', 'RIE']);
  assert.equal(students.length, 1000);
  assert.equal(new Set(students.map((student) => student.studentId)).size, 1000);
  assert.equal(new Set(students.map((student) => student.registrationNumber)).size, 1000);
  assert.equal(new Set(students.map((student) => student.email)).size, 1000);
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  assert.ok(students.every((student) =>
    student.name && student.dateOfBirth instanceof Date && student.mobileNumber &&
    student.department && student.semester && student.academicYear &&
    student.attendancePercentage >= 0 && student.attendancePercentage <= 100 &&
    student.academicMarks.length && student.assignmentCompletion >= 0 &&
    student.assignmentCompletion <= 100 && student.gpa >= 0 && student.gpa <= 10 &&
    ['Low', 'Medium', 'High'].includes(student.riskLevel) &&
    ['Active', 'On leave', 'Withdrawn', 'Graduated'].includes(student.enrollmentStatus)));
  for (const student of students) {
    riskCounts[student.riskLevel] += 1;
    assert.equal(student.password, formatInitialPassword(student.dateOfBirth));
    assert.equal(student.riskLevel, assessAcademicRisk(student).riskLevel);
    assert.equal(student.profileStatistics.riskLevel, student.riskLevel);
  }
  assert.ok(Object.values(riskCounts).every((count) => count > 0));
  for (const college of COLLEGES) {
    const cohort = students.filter((student) => student.college === college);
    assert.equal(cohort.length, 100);
    assert.equal(cohort[0].registrationNumber, `${college}001`);
    assert.equal(cohort[99].registrationNumber, `${college}100`);
    assert.ok(cohort.every((student) => student.registrationNumber.startsWith(college)));
  }
  assert.ok(students.every((student) => student.password.length === 8 && student.mustChangePassword && student.isSeeded));
});

test('seeded initial password uses UTC DDMMYYYY', () => {
  assert.equal(formatInitialPassword(new Date('2006-11-25T00:00:00.000Z')), '25112006');
});

test('risk rules identify multiple warnings and do not flag an empty new profile', () => {
  const empty = assessAcademicRisk({
    attendancePercentage: 0,
    assignmentCompletion: 0,
    assignmentsTotal: 0,
    gpa: 0,
    academicMarks: [],
    attendanceHistory: [],
    performanceHistory: [],
  });
  assert.equal(empty.riskLevel, 'Low');

  const struggling = assessAcademicRisk({
    isSeeded: true,
    attendancePercentage: 50,
    assignmentCompletion: 45,
    gpa: 4.2,
    academicMarks: [39, 44],
    performanceHistory: [{ value: 5 }, { value: 4.2 }],
  });
  assert.equal(struggling.riskLevel, 'High');
  assert.equal(struggling.isDeclining, true);
  assert.equal(struggling.requiresIntervention, true);
  assert.ok(struggling.recommendations.length >= 3);
});
