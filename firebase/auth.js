// firebase/auth.js - Local storage auth
import { getUsers, saveUsers, getClasses, setCurrentUser, getCurrentUser } from './config';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function hashPassword(password) {
  return btoa(password + 'salt_biobin');
}

export async function registerUser({ name, email, password, role, classCode }) {
  const users = getUsers();
  
  // Check if email already exists
  const existingUser = Object.values(users).find(u => u.email === email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  let classId = null;

  // Find class by code if student
  if (role === 'student' && classCode) {
    const classes = getClasses();
    const foundClass = Object.values(classes).find(c => c.code === classCode.toUpperCase());
    if (foundClass) {
      classId = foundClass.id;
    }
  }

  const userId = generateId();
  const newUser = {
    id: userId,
    name,
    email,
    password: hashPassword(password),
    role,
    classId,
    points: 0,
    totalWaste: 0,
    badges: [],
    createdAt: new Date().toISOString(),
  };

  users[userId] = newUser;
  saveUsers(users);

  // Update class student count
  if (classId) {
    const classes = getClasses();
    if (classes[classId]) {
      classes[classId].studentCount = (classes[classId].studentCount || 0) + 1;
      saveClasses(classes);
    }
  }

  const { password: _, ...userWithoutPassword } = newUser;
  setCurrentUser(userWithoutPassword);

  return { user: userWithoutPassword, classId };
}

export async function loginUser({ email, password }) {
  const users = getUsers();
  const hashedPassword = hashPassword(password);
  
  const user = Object.values(users).find(u => u.email === email && u.password === hashedPassword);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user;
  setCurrentUser(userWithoutPassword);
  
  return userWithoutPassword;
}

export async function logoutUser() {
  setCurrentUser(null);
}

export async function getUserData(uid) {
  const users = getUsers();
  return users[uid] || null;
}
