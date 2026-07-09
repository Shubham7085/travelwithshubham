import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase.config'; // Your existing untouched config
import type { Trip } from '../types';

// Abstracted service layer. 
// If you move away from Firebase, you only rewrite this file.
export const DatabaseService = {
  getLatestTrips: async (): Promise<Trip[]> => {
    try {
      const q = query(collection(db, 'trips'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  },
  // Add remaining CRUD operations here...
};

