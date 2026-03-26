import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from './config';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function logWaste({ userId, weight, imageUrl, classId, aiClassification }) {
  const usersRef = collection(db, 'users');
  const classesRef = collection(db, 'classes');
  const logsRef = collection(db, 'waste_logs');

  const weightNum = parseFloat(weight);
  const points = Math.round(weightNum * 10);
  const energyKwh = weightNum * 0.5;
  const co2Saved = weightNum * 0.8;

  const logData = {
    userId,
    classId: classId || null,
    weight: weightNum,
    imageUrl: imageUrl || null,
    points,
    energyKwh,
    co2Saved,
    timestamp: new Date().toISOString(),
    aiClassification: aiClassification || null,
    verifiedOrganic: aiClassification?.isOrganic ?? null,
  };

  const docRef = await addDoc(logsRef, logData);

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    await updateDoc(userRef, {
      points: (userData.points || 0) + points,
      totalWaste: (userData.totalWaste || 0) + weightNum,
    });
  }

  if (classId) {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (classSnap.exists()) {
      const classData = classSnap.data();
      await updateDoc(classRef, {
        totalWaste: (classData.totalWaste || 0) + weightNum,
        totalPoints: (classData.totalPoints || 0) + points,
      });
    }
  }

  const goalResult = await checkAndAwardGoalPoints(userId, classId);
  let classGoalResult = null;
  if (classId) {
    classGoalResult = await checkAndAwardClassGoalPoints(classId);
  }
  
  return { logId: docRef.id, points, energyKwh, co2Saved, goalResult, classGoalResult };
}

export async function getUserLogs(userId) {
  const logsRef = collection(db, 'waste_logs');
  const q = query(logsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getClassLogs(classId) {
  const logsRef = collection(db, 'waste_logs');
  const q = query(logsRef, where('classId', '==', classId), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getStudentLeaderboard(classId = null) {
  const usersRef = collection(db, 'users');
  let q;
  if (classId) {
    q = query(usersRef, where('role', '==', 'student'), where('classId', '==', classId), orderBy('points', 'desc'), limit(20));
  } else {
    q = query(usersRef, where('role', '==', 'student'), orderBy('points', 'desc'), limit(20));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, i) => {
    const data = doc.data();
    return { rank: i + 1, uid: doc.id, ...data };
  });
}

export async function getClassLeaderboard() {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, orderBy('totalPoints', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, i) => ({ rank: i + 1, id: doc.id, ...doc.data() }));
}

export async function createClass({ name, teacherId, schoolId, groupId }) {
  const classesRef = collection(db, 'classes');
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const classData = {
    name,
    teacherId,
    schoolId,
    groupId,
    code,
    totalWaste: 0,
    totalPoints: 0,
    studentCount: 0,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(classesRef, classData);
  return { id: docRef.id, code };
}

export async function getTeacherClasses(teacherId) {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  for (const cls of classes) {
    if (cls.schoolId) {
      const schoolDoc = await getDoc(doc(db, 'schools', cls.schoolId));
      if (schoolDoc.exists()) {
        cls.schoolName = schoolDoc.data().name;
      }
    }
    if (cls.groupId) {
      const groupDoc = await getDoc(doc(db, 'groups', cls.groupId));
      if (groupDoc.exists()) {
        cls.groupName = groupDoc.data().name;
      }
    }
  }
  
  return classes;
}

export async function getClassStudents(classId) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('classId', '==', classId), where('role', '==', 'student'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

export async function getClassData(classId) {
  const classDoc = await getDoc(doc(db, 'classes', classId));
  if (classDoc.exists()) {
    return { id: classDoc.id, ...classDoc.data() };
  }
  return null;
}

const BADGE_THRESHOLDS = [
  { id: 'first_log', name: 'Første kast!', icon: '🌱', description: 'Registrerte første matavfall', threshold: 0, type: 'count' },
  { id: 'waste_10kg', name: '10 kg Helt', icon: '💪', description: '10 kg matavfall registrert', threshold: 10, type: 'weight' },
  { id: 'waste_50kg', name: '50 kg Mester', icon: '🏆', description: '50 kg matavfall registrert', threshold: 50, type: 'weight' },
  { id: 'waste_100kg', name: '100 kg Legende', icon: '👑', description: '100 kg matavfall registrert', threshold: 100, type: 'weight' },
];

export async function checkBadges(userId, totalWaste, currentBadges) {
  const logsRef = collection(db, 'waste_logs');
  const q = query(logsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const logCount = snapshot.size;

  const newBadges = [...currentBadges];
  let updated = false;

  for (const badge of BADGE_THRESHOLDS) {
    if (currentBadges.includes(badge.id)) continue;

    if (badge.type === 'weight' && totalWaste >= badge.threshold) {
      newBadges.push(badge.id);
      updated = true;
    } else if (badge.type === 'count' && logCount > 0 && badge.type === 'count') {
      newBadges.push(badge.id);
      updated = true;
    }
  }

  if (updated) {
    await updateDoc(doc(db, 'users', userId), { badges: newBadges });
  }

  return newBadges;
}

export const ALL_BADGES = BADGE_THRESHOLDS;

export async function getGlobalStats() {
  const logsRef = collection(db, 'waste_logs');
  const snapshot = await getDocs(logsRef);
  const logs = snapshot.docs.map(doc => doc.data());

  const totalWaste = logs.reduce((sum, l) => sum + (l.weight || 0), 0);
  const totalEnergy = logs.reduce((sum, l) => sum + (l.energyKwh || 0), 0);
  const totalCO2 = logs.reduce((sum, l) => sum + (l.co2Saved || 0), 0);

  return { totalWaste, totalEnergy, totalCO2, totalLogs: logs.length };
}

export async function getAllUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

export async function getAllClasses() {
  const classesRef = collection(db, 'classes');
  const snapshot = await getDocs(classesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllWasteLogs() {
  const logsRef = collection(db, 'waste_logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAdminStats() {
  const [users, classes, logs] = await Promise.all([
    getAllUsers(),
    getAllClasses(),
    getAllWasteLogs()
  ]);

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const totalWaste = logs.reduce((sum, l) => sum + (l.weight || 0), 0);
  const totalEnergy = logs.reduce((sum, l) => sum + (l.energyKwh || 0), 0);
  const totalCO2 = logs.reduce((sum, l) => sum + (l.co2Saved || 0), 0);

  return {
    totalUsers: users.length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalLogs: logs.length,
    totalWaste,
    totalEnergy,
    totalCO2,
    students,
    teachers,
    classes,
    logs
  };
}

export async function deleteUser(uid) {
  await deleteDoc(doc(db, 'users', uid));
}

export async function deleteClass(classId) {
  await deleteDoc(doc(db, 'classes', classId));
}

export async function deleteWasteLog(logId) {
  await deleteDoc(doc(db, 'waste_logs', logId));
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function updateClass(classId, data) {
  await updateDoc(doc(db, 'classes', classId), data);
}

export async function createSchool({ name }) {
  const schoolsRef = collection(db, 'schools');
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  const schoolData = {
    name,
    code,
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(schoolsRef, schoolData);
  return { id: docRef.id, code };
}

export async function getSchoolByCode(code) {
  const schoolsRef = collection(db, 'schools');
  const q = query(schoolsRef, where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function getAllSchools() {
  const schoolsRef = collection(db, 'schools');
  const snapshot = await getDocs(schoolsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createGroup({ name, schoolId }) {
  const groupsRef = collection(db, 'groups');
  const groupData = {
    name,
    schoolId,
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(groupsRef, groupData);
  return { id: docRef.id };
}

export async function getSchoolGroups(schoolId) {
  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllGroups() {
  const groupsRef = collection(db, 'groups');
  const snapshot = await getDocs(groupsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, 'groups', groupId));
}

export async function getSchool(schoolId) {
  const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
  if (schoolDoc.exists()) {
    return { id: schoolDoc.id, ...schoolDoc.data() };
  }
  return null;
}

export async function deleteSchool(schoolId) {
  await deleteDoc(doc(db, 'schools', schoolId));
}

export async function getSchoolClasses(schoolId) {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getSchoolLeaderboard(schoolId) {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('schoolId', '==', schoolId), orderBy('totalPoints', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, i) => ({ rank: i + 1, id: doc.id, ...doc.data() }));
}

export async function getSchoolStudentLeaderboard(schoolId) {
  const classes = await getSchoolClasses(schoolId);
  const classIds = classes.map(c => c.id);
  
  if (classIds.length === 0) return [];
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('classId', 'in', classIds), orderBy('points', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, i) => ({ rank: i + 1, uid: doc.id, ...doc.data() }));
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function setUserWeeklyGoal(userId, goalWeight) {
  const weekStart = getWeekStart();
  await updateDoc(doc(db, 'users', userId), {
    weeklyGoal: goalWeight,
    weeklyGoalWeekStart: weekStart.toISOString(),
    weeklyGoalCompleted: false,
  });
}

export async function setClassWeeklyGoal(classId, goalWeight) {
  const weekStart = getWeekStart();
  await updateDoc(doc(db, 'classes', classId), {
    weeklyGoal: goalWeight,
    weeklyGoalWeekStart: weekStart.toISOString(),
    weeklyGoalCompleted: false,
  });
}

export async function getWeeklyWaste(userId, classId = null) {
  const logsRef = collection(db, 'waste_logs');
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString();
  
  let q;
  if (classId) {
    q = query(logsRef, where('classId', '==', classId), where('timestamp', '>=', weekStartStr));
  } else {
    q = query(logsRef, where('userId', '==', userId), where('timestamp', '>=', weekStartStr));
  }
  
  const snapshot = await getDocs(q);
  const logs = snapshot.docs.map(doc => doc.data());
  return logs.reduce((sum, l) => sum + (l.weight || 0), 0);
}

export async function checkAndAwardGoalPoints(userId, classId = null) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  
  const userData = userSnap.data();
  const weekStart = getWeekStart();
  const storedWeekStart = userData.weeklyGoalWeekStart;
  
  const storedWeek = storedWeekStart ? new Date(storedWeekStart) : null;
  const isNewWeek = !storedWeek || storedWeek < weekStart;
  
  const goalWeight = userData.weeklyGoal;
  if (!goalWeight || goalWeight <= 0) return null;
  if (!isNewWeek && userData.weeklyGoalCompleted) return null;
  
  const weeklyWaste = await getWeeklyWaste(userId, classId);
  
  if (weeklyWaste >= goalWeight && (isNewWeek || !userData.weeklyGoalCompleted)) {
    await updateDoc(userRef, {
      points: (userData.points || 0) + 200,
      weeklyGoalCompleted: true,
    });
    return { awarded: true, points: 200 };
  }
  
  return null;
}

export async function checkAndAwardClassGoalPoints(classId) {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) return null;
  
  const classData = classSnap.data();
  const weekStart = getWeekStart();
  const storedWeekStart = classData.weeklyGoalWeekStart;
  
  const storedWeek = storedWeekStart ? new Date(storedWeekStart) : null;
  const isNewWeek = !storedWeek || storedWeek < weekStart;
  
  const goalWeight = classData.weeklyGoal;
  if (!goalWeight || goalWeight <= 0) return null;
  if (!isNewWeek && classData.weeklyGoalCompleted) return null;
  
  const weeklyWaste = await getWeeklyWaste(null, classId);
  
  if (weeklyWaste >= goalWeight && (isNewWeek || !classData.weeklyGoalCompleted)) {
    const students = await getClassStudents(classId);
    for (const student of students) {
      const studentRef = doc(db, 'users', student.uid);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        await updateDoc(studentRef, {
          points: (studentData.points || 0) + 200,
        });
      }
    }
    await updateDoc(classRef, { weeklyGoalCompleted: true });
    return { awarded: true, points: 200, studentCount: students.length };
  }
  
  return null;
}
