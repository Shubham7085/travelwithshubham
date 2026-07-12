import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../firebase/config'; // Firebase config से सब इम्पोर्ट किया[span_2](start_span)[span_2](end_span)
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storage फंक्शन्स[span_3](start_span)[span_3](end_span)
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
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
  
  // Media Files States (फ़ोन से अपलोड के लिए)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);

  // ऑटोमैटिक स्लग जनरेशन
  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-8]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  }, [title]);

  // ट्रिप्स लोड करने का फ़ंक्शन
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'));
      const tripsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // ट्रिप डिलीट करने का हैंडलर
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteDoc(doc(db, 'trips', id));
        setStatusMessage({ type: 'success', text: 'Trip deleted successfully!' });
        fetchTrips();
      } catch (error) {
        setStatusMessage({ type: 'error', text: 'Failed to delete trip.' });
      }
    }
  };

  // लॉगआउट हैंडलर
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  // फॉर्म सबमिट और मीडिया अपलोड हैंडलर
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

      // 1. कवर इमेज अपलोड (Firebase Storage)
      const coverRef = ref(storage, `trips/${slug}/cover_${Date.now()}_${coverFile.name}`);
      await uploadBytes(coverRef, coverFile);
      coverImageUrl = await getDownloadURL(coverRef);

      // 2. ट्रिप फ़ोटोज़ अपलोड (Firebase Storage)
      if (photoFiles && photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const photoRef = ref(storage, `trips/${slug}/photos/${Date.now()}_${file.name}`);
          await uploadBytes(photoRef, file);
          const url = await getDownloadURL(photoRef);
          uploadedPhotos.push(url);
        }
      }

      // 3. ट्रिप वीडियोज़ अपलोड (Firebase Storage)
      if (videoFiles && videoFiles.length > 0) {
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          const videoRef = ref(storage, `trips/${slug}/videos/${Date.now()}_${file.name}`);
          await uploadBytes(videoRef, file);
          const url = await getDownloadURL(videoRef);
          uploadedVideos.push(url);
        }
      }

      // 4. Firestore डेटाबेस में डॉक्यूमेंट सेव करना
      await addDoc(collection(db, 'trips'), {
        title,
        slug,
        location,
        state: stateName,
        coverImage: coverImageUrl,
        photos: uploadedPhotos,
        videos: uploadedVideos,
        startDate,
        duration,
        distance: Number(distance) || 0,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        description,
        createdAt: new Date()
      });

      setStatusMessage({ type: 'success', text: 'Trip created and media uploaded successfully!' });
      
      // फॉर्म रीसेट
      setTitle('');
      setSlug('');
      setLocation('');
      setStateName('');
      setStartDate('');
      setDuration('');
      setDistance('');
      setTags('');
      setDescription('');
      setCoverFile(null);
      setPhotoFiles(null);
      setVideoFiles(null);
      setActiveTab('manage');
      fetchTrips();

    } catch (error: any) {
      console.error("Error creating trip:", error);
      setStatusMessage({ type: 'error', text: error.message || 'Failed to create trip.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-24 pb-12 px-4 md:px-8">
      {/* Admin Header */}
      <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-800">
            <img 
              src={auth.currentUser?.photoURL || 'https://via.placeholder.com/150'} 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">Verified Admin</span>
            <h1 className="text-2xl font-bold mt-1 text-white">{auth.currentUser?.displayName || 'SHUBHAM KR. NAGVANSHI'}</h1>
            <p className="text-sm text-gray-400">{auth.currentUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTrips} className="flex items-center justify-center px-4 py-2 border border-gray-700 bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Database
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center px-4 py-2 border border-red-900/30 bg-red-950/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-950/40 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className={`max-w-6xl mx-auto p-4 rounded-xl mb-6 flex items-center gap-3 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
            : 'bg-red-950/20 border-red-900/30 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto border-b border-gray-800 flex gap-6 mb-8">
        <button 
          onClick={() => setActiveTab('manage')} 
          className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'manage' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          Manage Trips ({trips.length})
        </button>
        <button 
          onClick={() => setActiveTab('add')} 
          className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'add' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          + Add Trip
        </button>
      </div>

      {/* Tab Panels */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'manage' ? (
          /* MANAGE TRIPS TAB */
          loading ? (
            <div className="text-center py-12 text-gray-400">Loading trips from cloud...</div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-800 rounded-2xl">No trips found in the database. Add your first trip!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col group hover:border-gray-700 transition-all shadow-xl">
                  <div className="h-48 relative overflow-hidden bg-gray-800">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button 
                      onClick={() => handleDelete(trip.id)}
                      className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{trip.title}</h3>
                      <p className="text-xs text-gray-400 mb-4 font-mono">{trip.slug}</p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-blue-400" />{trip.location}, {trip.state}</div>
                        <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-2 text-blue-400" />{trip.startDate}</div>
                        <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-2 text-blue-400" />{trip.duration}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                      <span>📸 {trip.photos?.length || 0} Photos</span>
                      <span>🎥 {trip.videos?.length || 0} Videos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ADD TRIP TAB WITH DIRECT FILE UPLOAD */
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">Create New Trip Document</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">TRIP TITLE *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Spiti Desert Expedition" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">SLUG ID (AUTOMATIC) *</label>
                <input type="text" value={slug} readOnly placeholder="spiti-desert-expedition" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 focus:outline-none font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">LOCATION (CITIES/POINTS) *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Srinagar & Gulmarg" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">STATE / REGION *</label>
                <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} required placeholder="e.g. Jammu & Kashmir" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              {/* PHONE DIRECT FILE UPLOAD FOR COVER IMAGE */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">COVER IMAGE *</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-gray-950 border-gray-800 hover:border-blue-500 hover:bg-gray-900/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400 font-medium">
                        {coverFile ? `Selected: ${coverFile.name}` : 'Tap to select Cover Photo from Phone'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} required={activeTab === 'add'} />
                  </label>
                </div>
              </div>

              {/* MULTI PHOTO & VIDEO UPLOAD BUTTONS */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">UPLOAD TRIP PHOTOS</label>
                <label className="flex items-center justify-between px-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 hover:bg-gray-900/30 text-gray-300 transition-colors">
                  <div className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-3 text-blue-400" />
                    <span className="text-sm text-gray-400">{photoFiles ? `${photoFiles.length} Photos Selected` : 'Select Multiple Photos'}</span>
                  </div>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Browse</span>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => setPhotoFiles(e.target.files)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">UPLOAD TRIP VIDEOS</label>
                <label className="flex items-center justify-between px-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 hover:bg-gray-900/30 text-gray-300 transition-colors">
                  <div className="flex items-center">
                    <Film className="w-5 h-5 mr-3 text-rose-400" />
                    <span className="text-sm text-gray-400">{videoFiles ? `${videoFiles.length} Videos Selected` : 'Select Multiple Videos'}</span>
                  </div>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Browse</span>
                  <input type="file" className="hidden" multiple accept="video/*" onChange={(e) => setVideoFiles(e.target.files)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">START DATE (YYYY-MM-DD) *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DURATION STRING *</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder="e.g. 10 Days" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DISTANCE TRAVERSED (KM) *</label>
                <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} required placeholder="e.g. 1450" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">TAGS (COMMA-SEPARATED) *</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} required placeholder="e.g. Himalayas, Road Trip, Offroad" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">DETAILED DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the landscape features, itinerary nodes, road conditions..." className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"></textarea>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
              <button type="button" onClick={() => setActiveTab('manage')} className="px-5 py-3 border border-gray-800 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">CANCEL</button>
              <button type="submit" disabled={uploading} className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-lg shadow-blue-900/20">
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Uploading Media to Cloud...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" /> SAVE AND DEPLOY
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
