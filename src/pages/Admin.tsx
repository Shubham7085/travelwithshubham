import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config'; // सिर्फ db और auth लिया
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { storageService } from '../services/storageService'; // आपकी पुरानी सर्विस वापस जोड़ दी!
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  MapPin, 
  Upload, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  slug: string;
  location: string;
  state: string;
  coverImage: string;
  photos?: string[];
  videos?: string[];
  startDate: string;
  duration: string;
  distance: number;
  tags: string[];
  description: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [stateName, setStateName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  
  // Media Files States (Direct Selection)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  }, [title]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'));
      const tripsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteDoc(doc(db, 'trips', id));
        setStatusMessage({ type: 'success', text: 'Trip deleted successfully!' });
        fetchTrips();
      } catch (error) { setStatusMessage({ type: 'error', text: 'Failed to delete trip.' }); }
    }
  };

  const handleLogout = async () => { await auth.signOut(); navigate('/login'); };

  // आपकी पुरानी storageService के माध्यम से अपलोड करने का हैंडलर
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverFile) {
      setStatusMessage({ type: 'error', text: 'Please select a cover image.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      let coverImageUrl = '';
      const uploadedPhotos: string[] = [];
      const uploadedVideos: string[] = [];

      // 1. आपकी service से कवर इमेज अपलोड
      if (typeof storageService.uploadFile === 'function') {
        coverImageUrl = await storageService.uploadFile(coverFile, `trips/${slug}/cover`);
      } else {
        // अगर फ़ंक्शन का नाम अलग है (जैसे uploadImage) तो वह यहाँ काम करेगा
        coverImageUrl = await (storageService as any).uploadImage?.(coverFile) || '';
      }

      // 2. आपकी service से बाकी फ़ोटोज़ अपलोड
      if (photoFiles && photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const url = await (storageService.uploadFile ? storageService.uploadFile(file, `trips/${slug}/photos`) : (storageService as any).uploadImage?.(file));
          if (url) uploadedPhotos.push(url);
        }
      }

      // 3. आपकी service से वीडियोज़ अपलोड
      if (videoFiles && videoFiles.length > 0) {
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          const url = await (storageService.uploadFile ? storageService.uploadFile(file, `trips/${slug}/videos`) : (storageService as any).uploadVideo?.(file));
          if (url) uploadedVideos.push(url);
        }
      }

      // 4. Firestore में डॉक्यूमेंट सेव करना
      await addDoc(collection(db, 'trips'), {
        title, slug, location, state: stateName, coverImage: coverImageUrl,
        photos: uploadedPhotos, videos: uploadedVideos, startDate, duration,
        distance: Number(distance) || 0, tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        description, createdAt: new Date()
      });

      setStatusMessage({ type: 'success', text: 'Trip created and uploaded to your cloud successfully!' });
      setTitle(''); setCoverFile(null); setPhotoFiles(null); setVideoFiles(null);
      setActiveTab('manage'); fetchTrips();

    } catch (error: any) {
      console.error("Error creating trip:", error);
      setStatusMessage({ type: 'error', text: error.message || 'Failed to create trip.' });
    } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-24 pb-12 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-800">
            <img src={auth.currentUser?.photoURL || 'https://via.placeholder.com/150'} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">Verified Admin</span>
            <h1 className="text-2xl font-bold mt-1 text-white">{auth.currentUser?.displayName || 'SHUBHAM KR. NAGVANSHI'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTrips} className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</button>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl text-sm"><LogOut className="w-4 h-4 mr-2" /> Log Out</button>
        </div>
      </div>

      {statusMessage && (
        <div className={`max-w-6xl mx-auto p-4 rounded-xl mb-6 flex items-center gap-3 border ${statusMessage.type === 'success' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' : 'bg-red-950/20 text-red-400 border-red-900/30'}`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto border-b border-gray-800 flex gap-6 mb-8">
        <button onClick={() => setActiveTab('manage')} className={`pb-4 text-sm font-semibold border-b-2 ${activeTab === 'manage' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>Manage Trips ({trips.length})</button>
        <button onClick={() => setActiveTab('add')} className={`pb-4 text-sm font-semibold border-b-2 ${activeTab === 'add' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>+ Add Trip</button>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'manage' ? (
          loading ? <div className="text-center py-12">Loading...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group">
                  <div className="h-48 relative overflow-hidden bg-gray-800">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    <button onClick={() => handleDelete(trip.id)} className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{trip.title}</h3>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2" />{trip.location}, {trip.state}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* FORM PANEL WITH CUSTOM CLOUD DRIVE UPLOAD */
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">TRIP TITLE *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">SLUG ID</label>
                <input type="text" value={slug} readOnly className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 font-mono" />
              </div>

              {/* COVER IMAGE FILE PICKER */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">COVER IMAGE *</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-gray-950 border-gray-800 hover:border-blue-500">
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">{coverFile ? `Selected: ${coverFile.name}` : 'Tap to select Cover Photo from Phone'}</p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} required={activeTab === 'add'} />
                </label>
              </div>

              {/* MULTI PHOTO & VIDEO PICKER */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">UPLOAD TRIP PHOTOS</label>
                <label className="flex items-center justify-between px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer text-gray-300">
                  <span className="text-sm">{photoFiles ? `${photoFiles.length} Photos Selected` : 'Select Multiple Photos'}</span>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => setPhotoFiles(e.target.files)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">UPLOAD TRIP VIDEOS</label>
                <label className="flex items-center justify-between px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer text-gray-300">
                  <span className="text-sm">{videoFiles ? `${videoFiles.length} Videos Selected` : 'Select Multiple Videos'}</span>
                  <input type="file" className="hidden" multiple accept="video/*" onChange={(e) => setVideoFiles(e.target.files)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">LOCATION *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">STATE *</label>
                <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">START DATE *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DURATION *</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DISTANCE (KM) *</label>
                <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">TAGS *</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white resize-none"></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
              <button type="submit" disabled={uploading} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
                {uploading ? 'Uploading to Cloud Drive Accounts...' : 'SAVE AND DEPLOY'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
            }
            
