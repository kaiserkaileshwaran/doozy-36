import { db, ref, set, get, child, update } from '../lib/firebase';
import { Customer } from '../types';

export interface UserProfileData {
  uid: string;
  name: string;
  username: string;
  email: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  bio?: string;
  publicProfile: boolean;
  wishlistIds?: string[];
  createdAt: string;
}

export const userService = {
  async syncUser(user: Partial<UserProfileData>): Promise<void> {
    if (!user.uid) return;
    try {
      await update(ref(db, `doozy_core/users/${user.uid}`), {
        ...user,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("User sync error:", e);
    }
  },

  async getUser(uid: string): Promise<UserProfileData | null> {
    try {
      const snap = await get(child(ref(db), `doozy_core/users/${uid}`));
      return snap.exists() ? snap.val() : null;
    } catch (e) {
      return null;
    }
  }
};

export const profileService = {
  async getPublicProfile(username: string): Promise<UserProfileData | null> {
    try {
      const snap = await get(child(ref(db), `doozy_core/profiles/${username.toLowerCase()}`));
      if (snap.exists()) {
        return snap.val();
      }
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
    return null;
  },

  async publishPublicProfile(profile: UserProfileData): Promise<void> {
    try {
      const cleanHandle = (profile.username || profile.name.toLowerCase().replace(/\s+/g, '')).toLowerCase();
      await set(ref(db, `doozy_core/profiles/${cleanHandle}`), {
        uid: profile.uid,
        displayName: profile.name,
        username: cleanHandle,
        bio: profile.bio || "Premium Member & Indian Ethnic Wear Enthusiast.",
        photoURL: profile.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        publicWishlistItems: profile.wishlistIds || [],
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Public profile publication skipped:", e);
    }
  }
};
