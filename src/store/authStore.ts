import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { authApi } from '@/services/api';

export type User = { id: string; name: string; email: string; role: string } | null;

interface AuthState {
  user: User;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  setUser: (user: User) => void;
  setFirebaseUser: (u: FirebaseUser | null) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Link email/password to current account (e.g. after Google sign-in) so user can login with form */
  linkEmailPassword: (password: string) => Promise<void>;
  /** True if user has email/password provider (can login with form) */
  hasEmailPasswordProvider: () => boolean;
  /** Ganti password (user harus punya provider email/password) */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Kirim email reset password ke alamat email */
  sendPasswordResetEmail: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  subscribeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      loading: true,

      setUser: (user) => set({ user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

      logout: () => {
        firebaseSignOut(getFirebaseAuth()).catch(() => {});
        set({ user: null, firebaseUser: null });
      },

      login: async (email, password) => {
        const auth = getFirebaseAuth();
        const credential = await signInWithEmailAndPassword(auth, email, password);
        set({ firebaseUser: credential.user });
        const token = await credential.user.getIdToken();
        if (token) {
          const res = await authApi.me();
          set({ user: res.data });
        }
      },

      loginWithGoogle: async () => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        set({ firebaseUser: result.user });
        const token = await result.user.getIdToken();
        if (token) {
          const res = await authApi.me();
          set({ user: res.data });
        }
      },

      register: async (name, email, password) => {
        const auth = getFirebaseAuth();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(credential.user, { displayName: name });
        set({ firebaseUser: credential.user });
        const token = await credential.user.getIdToken(true);
        if (token) {
          const res = await authApi.me();
          set({ user: res.data });
        }
      },

      linkEmailPassword: async (password) => {
        const { firebaseUser } = get();
        if (!firebaseUser?.email) throw new Error('Account has no email');
        const credential = EmailAuthProvider.credential(firebaseUser.email, password);
        const result = await linkWithCredential(firebaseUser, credential);
        set({ firebaseUser: result.user });
      },

      hasEmailPasswordProvider: () => {
        const { firebaseUser } = get();
        if (!firebaseUser) return false;
        return firebaseUser.providerData.some((p) => p?.providerId === 'password');
      },

      changePassword: async (currentPassword, newPassword) => {
        const { firebaseUser } = get();
        if (!firebaseUser?.email) throw new Error('Account has no email');
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        // Pakai user dari hasil reauthenticate agar reference dan token terbaru dipakai untuk updatePassword
        const { user: reauthedUser } = await reauthenticateWithCredential(firebaseUser, credential);
        await firebaseUpdatePassword(reauthedUser, newPassword);
        // Sinkronkan state dengan user terbaru dan paksa refresh token
        set({ firebaseUser: reauthedUser });
        await reauthedUser.getIdToken(true);
      },

      sendPasswordResetEmail: async (email) => {
        const auth = getFirebaseAuth();
        await firebaseSendPasswordResetEmail(auth, email);
      },

      getIdToken: async () => {
        const { firebaseUser } = get();
        if (!firebaseUser) return null;
        return firebaseUser.getIdToken();
      },

      subscribeAuth: () => {
        set({ loading: true });
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          set({ firebaseUser, loading: false });
          if (!firebaseUser) {
            set({ user: null });
            return;
          }
          try {
            const token = await firebaseUser.getIdToken();
            if (token) {
              const res = await authApi.me();
              set({ user: res.data });
            } else {
              set({ user: null });
            }
          } catch {
            set({ user: null });
          }
        });
        return unsubscribe;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user }),
    }
  )
);
