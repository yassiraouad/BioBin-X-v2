import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, db, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from './config';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export async function registerUser({ name, email, password, role, classCode }) {
  if (email === ADMIN_EMAIL) {
    throw new Error('auth/email-not-allowed');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let classId = null;
    if (role === 'student' && classCode) {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('code', '==', classCode.toUpperCase()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        classId = snapshot.docs[0].id;
      }
    }

    const userData = {
      name,
      email,
      role,
      classId,
      points: 0,
      totalWaste: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    if (classId) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        await updateDoc(classRef, {
          studentCount: (classSnap.data().studentCount || 0) + 1
        });
      }
    }

    return { user: { uid: user.uid, ...userData }, classId };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function loginUser({ email, password }) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createError) {
        if (createError.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else if (createError.code === 'auth/invalid-credential' || createError.code === 'auth/wrong-password') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw createError;
        }
      }
      const user = userCredential.user;
      const adminUserData = {
        uid: user.uid,
        email: ADMIN_EMAIL,
        name: 'Administrator',
        role: 'admin',
        classId: null,
        points: 0,
        totalWaste: 0,
        badges: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), adminUserData, { merge: true });
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() };
      }
      return adminUserData;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (userDoc.exists()) {
    return { uid: userDoc.id, ...userDoc.data() };
  }
  return { uid: user.uid, email: user.email };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return { uid: userDoc.id, ...userDoc.data() };
  }
  return null;
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export { ADMIN_EMAIL };
