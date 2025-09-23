import { writable } from 'svelte/store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { user } from './auth';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  interests?: string;
  // Add other fields as needed
}

export const userProfile = writable<UserProfile | null>(null);
export const profileLoading = writable(true);

// Function to fetch user profile from Firestore
async function fetchUserProfile(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profileData = userDoc.data() as UserProfile;
      userProfile.set(profileData);
    } else {
      console.log('No user profile found');
      userProfile.set(null);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    userProfile.set(null);
  } finally {
    profileLoading.set(false);
  }
}

// Listen to auth state changes and fetch profile
user.subscribe((firebaseUser) => {
  if (firebaseUser) {
    profileLoading.set(true);
    fetchUserProfile(firebaseUser.uid);
  } else {
    userProfile.set(null);
    profileLoading.set(false);
  }
});
