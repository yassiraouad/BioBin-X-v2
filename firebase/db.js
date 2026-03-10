// firebase/db.js - Local storage database
import { getWasteLogs, saveWasteLogs, getUsers, saveUsers, getClasses, saveClasses } from './config';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ---- WASTE LOGS ----
export async function logWaste({ userId, weight, imageUrl, classId }) {
  const users = getUsers();
  const classes = getClasses();
  const logs = getWasteLogs();

  const weightNum = parseFloat(weight);
  const points = Math.round(weightNum * 10);
  const energyKwh = weightNum * 0.5;
  const co2Saved = weightNum * 0.8;

  const logId = generateId();
  const newLog = {
    id: logId,
    userId,
    classId,
    weight: weightNum,
    imageUrl: imageUrl || null,
    points,
    energyKwh,
    co2Saved,
    timestamp: new Date().toISOString(),
  };

  logs.push(newLog);
  saveWasteLogs(logs);

  // Update user points and totalWaste
  if (users[userId]) {
    users[userId].points = (users[userId].points || 0) + points;
    users[userId].totalWaste = (users[userId].totalWaste || 0) + weightNum;
    saveUsers(users);
  }

  // Update class stats
  if (classId && classes[classId]) {
    classes[classId].totalWaste = (classes[classId].totalWaste || 0) + weightNum;
    classes[classId].totalPoints = (classes[classId].totalPoints || 0) + points;
    saveClasses(classes);
  }

  // Check and award badges
  if (users[userId]) {
    await checkBadges(userId, users[userId].totalWaste + weightNum, users[userId].badges || []);
  }

  return { logId, points, energyKwh, co2Saved };
}

export async function getUserLogs(userId) {
  const logs = getWasteLogs();
  return logs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);
}

export async function getClassLogs(classId) {
  const logs = getWasteLogs();
  return logs
    .filter(log => log.classId === classId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ---- LEADERBOARD ----
export async function getStudentLeaderboard(classId = null) {
  const users = getUsers();
  let students = Object.values(users).filter(u => u.role === 'student');
  
  if (classId) {
    students = students.filter(s => s.classId === classId);
  }

  return students
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 20)
    .map((s, i) => {
      const { password: _, ...userWithoutPassword } = s;
      return { rank: i + 1, ...userWithoutPassword };
    });
}

export async function getClassLeaderboard() {
  const classes = getClasses();
  return Object.values(classes)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 10)
    .map((c, i) => ({ rank: i + 1, ...c }));
}

// ---- CLASSES ----
export async function createClass({ name, teacherId }) {
  const classes = getClasses();
  const id = generateId();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  classes[id] = {
    id,
    name,
    teacherId,
    code,
    totalWaste: 0,
    totalPoints: 0,
    studentCount: 0,
    createdAt: new Date().toISOString(),
  };

  saveClasses(classes);
  return { id, code };
}

export async function getTeacherClasses(teacherId) {
  const classes = getClasses();
  return Object.values(classes).filter(c => c.teacherId === teacherId);
}

export async function getClassStudents(classId) {
  const users = getUsers();
  return Object.values(users)
    .filter(u => u.classId === classId && u.role === 'student')
    .map(({ password: _, ...u }) => u);
}

export async function getClassData(classId) {
  const classes = getClasses();
  return classes[classId] || null;
}

// ---- BADGES ----
const BADGE_THRESHOLDS = [
  { id: 'first_log', name: 'Første kast!', icon: '🌱', description: 'Registrerte første matavfall', threshold: 0, type: 'count' },
  { id: 'waste_10kg', name: '10 kg Helt', icon: '💪', description: '10 kg matavfall registrert', threshold: 10, type: 'weight' },
  { id: 'waste_50kg', name: '50 kg Mester', icon: '🏆', description: '50 kg matavfall registrert', threshold: 50, type: 'weight' },
  { id: 'waste_100kg', name: '100 kg Legende', icon: '👑', description: '100 kg matavfall registrert', threshold: 100, type: 'weight' },
];

export async function checkBadges(userId, totalWaste, currentBadges) {
  const users = getUsers();
  const newBadges = [...currentBadges];
  let updated = false;

  const logs = getWasteLogs();
  const userLogs = logs.filter(l => l.userId === userId);
  const logCount = userLogs.length;

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

  if (updated && users[userId]) {
    users[userId].badges = newBadges;
    saveUsers(users);
  }

  return newBadges;
}

export const ALL_BADGES = BADGE_THRESHOLDS;

// ---- STATS ----
export async function getGlobalStats() {
  const logs = getWasteLogs();
  
  const totalWaste = logs.reduce((sum, l) => sum + (l.weight || 0), 0);
  const totalEnergy = logs.reduce((sum, l) => sum + (l.energyKwh || 0), 0);
  const totalCO2 = logs.reduce((sum, l) => sum + (l.co2Saved || 0), 0);

  return { totalWaste, totalEnergy, totalCO2, totalLogs: logs.length };
}
