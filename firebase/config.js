// firebase/config.js - Local storage only, no Firebase

const STORAGE_KEYS = {
  USERS: 'biobin_users',
  WASTE_LOGS: 'biobin_waste_logs',
  CLASSES: 'biobin_classes',
  CURRENT_USER: 'biobin_current_user',
};

export function getStorageKey(key) {
  return STORAGE_KEYS[key] || key;
}

export function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : {};
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getWasteLogs() {
  const data = localStorage.getItem(STORAGE_KEYS.WASTE_LOGS);
  return data ? JSON.parse(data) : [];
}

export function saveWasteLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.WASTE_LOGS, JSON.stringify(logs));
}

export function getClasses() {
  const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
  return data ? JSON.parse(data) : {};
}

export function saveClasses(classes) {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export const auth = {
  currentUser: null,
};

export const db = {};

export default {};
