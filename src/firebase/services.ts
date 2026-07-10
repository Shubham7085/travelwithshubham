import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, withTimeout, withWriteTimeout } from './config';
import { Trip, Photo, Video, Stats } from '../types';
import { INITIAL_TRIPS, INITIAL_PHOTOS, INITIAL_VIDEOS, INITIAL_STATS } from '../data';

const TRIPS_COLLECTION = 'trips';
const PHOTOS_COLLECTION = 'photos';
const VIDEOS_COLLECTION = 'videos';
const STATS_COLLECTION = 'stats';

function isOfflineError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('offline') || msg.includes('unavailable') || msg.includes('failed to get') || msg.includes('network');
  }
  return false;
}

// --- TRIP SERVICES ---
export async function getTrips(): Promise<Trip[]> {
  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, TRIPS_COLLECTION), orderBy('startDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Trip));
    } catch (error) {
      if (isOfflineError(error)) {
        console.warn("[Firestore] Client is offline. Falling back to INITIAL_TRIPS.");
        return INITIAL_TRIPS;
      }
      handleFirestoreError(error, OperationType.LIST, TRIPS_COLLECTION);
      return INITIAL_TRIPS;
    }
  })();
  return withTimeout(fetchPromise, 2500, INITIAL_TRIPS);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const path = `${TRIPS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, TRIPS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Trip;
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore] Client is offline. Looking up trip ID "${id}" in INITIAL_TRIPS.`);
      return INITIAL_TRIPS.find(t => t.id === id) || null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createOrUpdateTrip(trip: Trip): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${trip.id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, trip.id);
      await setDoc(docRef, trip);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Trip synchronization timed out. Connection to live database is temporarily unavailable.`);
}

export async function deleteTrip(id: string): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Trip deletion timed out. Connection to live database is temporarily unavailable.`);
}

// --- PHOTO SERVICES ---
export async function getPhotos(tripId?: string): Promise<Photo[]> {
  const fallback = tripId ? INITIAL_PHOTOS.filter(p => p.tripId === tripId) : INITIAL_PHOTOS;
  const fetchPromise = (async () => {
    try {
      let q = query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'));
      if (tripId) {
        q = query(collection(db, PHOTOS_COLLECTION), where('tripId', '==', tripId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Photo));
    } catch (error) {
      if (isOfflineError(error)) {
        console.warn("[Firestore] Client is offline. Falling back to INITIAL_PHOTOS.");
        return fallback;
      }
      handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
      return fallback;
    }
  })();
  return withTimeout(fetchPromise, 2500, fallback);
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  const fallback = INITIAL_PHOTOS.filter(p => p.isFeatured);
  const fetchPromise = (async () => {
    try {
      const q = query(
        collection(db, PHOTOS_COLLECTION), 
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Photo));
    } catch (error) {
      if (isOfflineError(error)) {
        console.warn("[Firestore] Client is offline. Falling back to featured INITIAL_PHOTOS.");
        return fallback;
      }
      handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
      return fallback;
    }
  })();
  return withTimeout(fetchPromise, 2500, fallback);
}

export async function createOrUpdatePhoto(photo: Photo): Promise<void> {
  const path = `${PHOTOS_COLLECTION}/${photo.id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, PHOTOS_COLLECTION, photo.id);
      await setDoc(docRef, photo);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Photo synchronization timed out. Connection to live database is temporarily unavailable.`);
}

export async function deletePhoto(id: string): Promise<void> {
  const path = `${PHOTOS_COLLECTION}/${id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, PHOTOS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Photo deletion timed out. Connection to live database is temporarily unavailable.`);
}

// --- VIDEO SERVICES ---
export async function getVideos(tripId?: string): Promise<Video[]> {
  const fallback = tripId ? INITIAL_VIDEOS.filter(v => v.tripId === tripId) : INITIAL_VIDEOS;
  const fetchPromise = (async () => {
    try {
      let q = query(collection(db, VIDEOS_COLLECTION), orderBy('createdAt', 'desc'));
      if (tripId) {
        q = query(collection(db, VIDEOS_COLLECTION), where('tripId', '==', tripId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Video));
    } catch (error) {
      if (isOfflineError(error)) {
        console.warn("[Firestore] Client is offline. Falling back to INITIAL_VIDEOS.");
        return fallback;
      }
      handleFirestoreError(error, OperationType.LIST, VIDEOS_COLLECTION);
      return fallback;
    }
  })();
  return withTimeout(fetchPromise, 2500, fallback);
}

export async function createOrUpdateVideo(video: Video): Promise<void> {
  const path = `${VIDEOS_COLLECTION}/${video.id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, video.id);
      await setDoc(docRef, video);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Video synchronization timed out. Connection to live database is temporarily unavailable.`);
}

export async function deleteVideo(id: string): Promise<void> {
  const path = `${VIDEOS_COLLECTION}/${id}`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Video deletion timed out. Connection to live database is temporarily unavailable.`);
}

// --- STATS SERVICES ---
export async function getStats(): Promise<Stats> {
  const path = `${STATS_COLLECTION}/current`;
  const fetchPromise = (async () => {
    try {
      const docRef = doc(db, STATS_COLLECTION, 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Stats;
      }
      // Seed them so they exist if the user has permissions, otherwise return defaults
      try {
        await setDoc(docRef, INITIAL_STATS);
      } catch (writeError) {
        console.warn("Could not seed stats document (expected for non-admin visitors):", writeError);
      }
      return INITIAL_STATS;
    } catch (error) {
      if (isOfflineError(error)) {
        console.warn("[Firestore] Client is offline. Falling back to INITIAL_STATS.");
        return INITIAL_STATS;
      }
      handleFirestoreError(error, OperationType.GET, path);
      return INITIAL_STATS;
    }
  })();
  return withTimeout(fetchPromise, 2500, INITIAL_STATS);
}

export async function updateStats(stats: Stats): Promise<void> {
  const path = `${STATS_COLLECTION}/current`;
  const writePromise = (async () => {
    try {
      const docRef = doc(db, STATS_COLLECTION, 'current');
      await setDoc(docRef, stats);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })();
  return withWriteTimeout(writePromise, 6000, `Stats synchronization timed out. Connection to live database is temporarily unavailable.`);
}
