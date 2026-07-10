import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/context';
import { 
  getTrips, 
  createOrUpdateTrip, 
  deleteTrip, 
  getStats, 
  updateStats, 
  getPhotos, 
  getVideos 
} from '../firebase/services';
import { Trip, Stats, Photo, Video } from '../types';
import { 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  BarChart3, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  Compass, 
  ArrowLeft, 
  AlertCircle, 
  Save, 
  FileText, 
  Grid,
  Map,
  Layers,
  Plus,
  HardDrive,
  Cloud,
  Activity,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Link as LinkIcon,
  FileCode,
  Loader,
  CloudUpload,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import { StorageService, DriveConfig } from '../services/storageService';

type AdminTab = 'manage-trips' | 'add-trip' | 'edit-trip' | 'update-stats' | 'storage-manager';

export default function Admin() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation and dynamic tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('manage-trips');
  
  // Data State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [photosCount, setPhotosCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [globalStats, setGlobalStats] = useState<Stats>({
    trips: 0,
    photos: 0,
    videos: 0,
    states: 0,
    distance: 0,
    yearsExploring: 0
  });
  
  // Form / Action states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Selected trip for editing
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Form Fields State
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formState, setFormState] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formPhotosCount, setFormPhotosCount] = useState(0);
  const [formVideosCount, setFormVideosCount] = useState(0);
  const [formDistance, setFormDistance] = useState(0);
  const [formTags, setFormTags] = useState('');

  // Stats form fields State
  const [statsTrips, setStatsTrips] = useState(0);
  const [statsPhotos, setStatsPhotos] = useState(0);
  const [statsVideos, setStatsVideos] = useState(0);
  const [statsStates, setStatsStates] = useState(0);
  const [statsDistance, setStatsDistance] = useState(0);
  const [statsYears, setStatsYears] = useState(0);

  // Google Drive & Upload States
  const [drives, setDrives] = useState<DriveConfig[]>([]);
  const [loadingDrives, setLoadingDrives] = useState(false);
  const [connectingDriveId, setConnectingDriveId] = useState<string | null>(null);
  const [testingDriveId, setTestingDriveId] = useState<string | null>(null);
  const [refreshingDriveId, setRefreshingDriveId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; timestamp: string }>>({});
  const [integrationTestPassed, setIntegrationTestPassed] = useState<boolean>(() => {
    return localStorage.getItem('gdrive_integration_test_passed') === 'true';
  });
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [driveErrors, setDriveErrors] = useState<Record<string, string>>({});
  const [syncError, setSyncError] = useState<string | null>(null);

  // Queue State
  interface QueueItem {
    id: string;
    fileName: string;
    fileSize: number;
    mediaType: 'photos' | 'videos';
    tripId: string;
    tripTitle: string;
    caption: string;
    location: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    targetDriveId?: string;
    error?: string;
    createdAt: string;
  }
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);

  // Media Upload State
  const [uploadTripId, setUploadTripId] = useState('');
  const [uploadMediaType, setUploadMediaType] = useState<'photos' | 'videos'>('photos');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadLocation, setUploadLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);

  // Force login redirect
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load Firestore metrics and collections
  const loadData = async () => {
    setLoading(true);
    setSyncError(null);

    const promiseWithTimeout = <T extends unknown>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
        promise
          .then(res => {
            clearTimeout(timer);
            resolve(res);
          })
          .catch(err => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    try {
      const [fetchedTrips, fetchedStats, fetchedPhotos, fetchedVideos, fetchedDrives] = await promiseWithTimeout(
        Promise.all([
          getTrips(),
          getStats(),
          getPhotos(),
          getVideos(),
          StorageService.getDrives()
        ]),
        10000,
        "Database synchronization timed out after 10 seconds. Live collections are temporarily unavailable."
      );
      
      setTrips(fetchedTrips || []);
      setPhotosCount((fetchedPhotos || []).length);
      setVideosCount((fetchedVideos || []).length);
      setDrives(fetchedDrives || []);

      if (fetchedTrips && fetchedTrips.length > 0 && !uploadTripId) {
        setUploadTripId(fetchedTrips[0].id);
      }
      
      if (fetchedStats) {
        setGlobalStats(fetchedStats);
        // Pre-fill stats form
        setStatsTrips(fetchedStats.trips);
        setStatsPhotos(fetchedStats.photos);
        setStatsVideos(fetchedStats.videos);
        setStatsStates(fetchedStats.states);
        setStatsDistance(fetchedStats.distance);
        setStatsYears(fetchedStats.yearsExploring);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard data:', err);
      const errMsg = err?.message || 'Failed to retrieve database contents. Check security credentials.';
      setSyncError(errMsg);
      showStatus('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  // Handle slugified ID generation based on title
  useEffect(() => {
    if (activeTab === 'add-trip' && formTitle) {
      const year = new Date(formStartDate || Date.now()).getFullYear();
      const slug = formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormId(`${slug}-${year || 2026}`);
    }
  }, [formTitle, formStartDate, activeTab]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Pre-fill fields for editing
  const startEditingTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setFormId(trip.id);
    setFormTitle(trip.title);
    setFormDescription(trip.description);
    setFormLocation(trip.location);
    setFormState(trip.state);
    setFormDuration(trip.duration);
    setFormStartDate(trip.startDate);
    setFormCoverImage(trip.coverImage);
    setFormPhotosCount(trip.photosCount);
    setFormVideosCount(trip.videosCount);
    setFormDistance(trip.distance);
    setFormTags(trip.tags.join(', '));
    setActiveTab('edit-trip');
  };

  // Reset Trip Form fields
  const resetForm = () => {
    setEditingTrip(null);
    setFormId('');
    setFormTitle('');
    setFormDescription('');
    setFormLocation('');
    setFormState('');
    setFormDuration('');
    setFormStartDate('');
    setFormCoverImage('');
    setFormPhotosCount(0);
    setFormVideosCount(0);
    setFormDistance(0);
    setFormTags('');
  };

  // Form submission handler (Add and Edit)
  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formTitle.trim()) {
      showStatus('error', 'Trip Title and Identifier are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = formTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const tripPayload: Trip = {
        id: formId.trim(),
        title: formTitle.trim(),
        description: formDescription.trim(),
        location: formLocation.trim(),
        state: formState.trim(),
        duration: formDuration.trim(),
        startDate: formStartDate.trim() || new Date().toISOString().split('T')[0],
        coverImage: formCoverImage.trim() || 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
        photosCount: Number(formPhotosCount) || 0,
        videosCount: Number(formVideosCount) || 0,
        distance: Number(formDistance) || 0,
        tags: parsedTags.length > 0 ? parsedTags : ['Explore', 'India']
      };

      await createOrUpdateTrip(tripPayload);
      
      showStatus('success', `Trip "${formTitle}" successfully synchronized to Firestore!`);
      resetForm();
      setActiveTab('manage-trips');
      loadData();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Firestore permission denied. Check your admin privilege authorization.';
      showStatus('error', errMsg.includes('timed out') ? errMsg : `Firestore synchronization failed: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Deletion operation
  const handleDeleteTrip = async (id: string, title: string) => {
    if (window.confirm(`Are you absolutely sure you want to delete the trip "${title}"? This operation cannot be undone.`)) {
      setLoading(true);
      try {
        await deleteTrip(id);
        showStatus('success', `Trip "${title}" removed successfully.`);
        loadData();
      } catch (err: any) {
        console.error(err);
        showStatus('error', err.message || 'Failed to delete document from database.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit Stats Update
  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const statsPayload: Stats = {
        trips: Number(statsTrips),
        photos: Number(statsPhotos),
        videos: Number(statsVideos),
        states: Number(statsStates),
        distance: Number(statsDistance),
        yearsExploring: Number(statsYears)
      };

      await updateStats(statsPayload);
      showStatus('success', 'Global travel metrics updated successfully in Firestore!');
      loadData();
      setActiveTab('manage-trips');
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to update stats. Access denied.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- GOOGLE DRIVE & STORAGE OPERATION HANDLERS ---
  const handleConnectDrive = async (driveId: string) => {
    setConnectingDriveId(driveId);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to capture active Google Drive OAuth access token.');
      }

      const userEmail = result.user.email || 'shubhamnagvanshi84823@gmail.com';
      await StorageService.connectDrive(driveId, userEmail, credential.accessToken);
      showStatus('success', `Successfully authorized and connected ${userEmail} to Google Drive!`);
      loadData();
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('popup-closed-by-user') || err.message.includes('popup-blocked'))) {
        showStatus('error', 'Google Drive authorization popup was closed or blocked. You can use the "Sandbox / Demo Connection" button to test the Storage Workspace in 1-click!');
      } else {
        showStatus('error', err.message || 'Google Drive authorization popup cancelled or blocked. Try Sandbox/Demo connection instead.');
      }
    } finally {
      setConnectingDriveId(null);
    }
  };

  const handleConnectSandboxDrive = async (driveId: string) => {
    try {
      const sandboxEmail = `sandbox-shubham-${driveId}@gmail.com`;
      const sandboxToken = `sandbox_token_${driveId}_${Date.now()}`;
      await StorageService.connectDrive(driveId, sandboxEmail, sandboxToken);
      showStatus('success', `Successfully established high-fidelity Sandbox Connection for ${sandboxEmail}!`);
      loadData();
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to establish Sandbox connection.');
    }
  };

  const handleDisconnectDrive = async (driveId: string) => {
    if (window.confirm('Are you sure you want to disconnect this Google Drive account? Access tokens will be revoked.')) {
      try {
        await StorageService.disconnectDrive(driveId);
        showStatus('success', 'Google Drive account disconnected successfully.');
        loadData();
      } catch (err) {
        console.error(err);
        showStatus('error', 'Failed to disconnect account.');
      }
    }
  };

  const handleToggleHealth = async (driveId: string, health: 'healthy' | 'degraded' | 'offline') => {
    try {
      await StorageService.toggleDriveHealth(driveId, health);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async (driveId: string) => {
    setTestingDriveId(driveId);
    try {
      const res = await StorageService.testDriveConnection(driveId);
      setTestResults(prev => ({
        ...prev,
        [driveId]: {
          success: res.success,
          message: res.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      if (res.success) {
        localStorage.setItem('gdrive_integration_test_passed', 'true');
        setIntegrationTestPassed(true);
        showStatus('success', `Integration test passed for ${driveId}! Upload unlocked.`);
      } else {
        localStorage.setItem('gdrive_integration_test_passed', 'false');
        setIntegrationTestPassed(false);
        showStatus('error', `Integration test failed.`);
      }
    } catch (err: any) {
      console.error(err);
      localStorage.setItem('gdrive_integration_test_passed', 'false');
      setIntegrationTestPassed(false);
      setTestResults(prev => ({
        ...prev,
        [driveId]: {
          success: false,
          message: err.message || 'Verification failed.',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      showStatus('error', `Connection test failed: ${err.message || 'Unknown network error.'}`);
    } finally {
      setTestingDriveId(null);
    }
  };

  const handleRefreshStorage = async (driveId: string) => {
    setRefreshingDriveId(driveId);
    try {
      const updated = await StorageService.refreshDriveStorage(driveId);
      setDrives(prev => prev.map(d => d.id === driveId ? updated : d));
      setDriveErrors(prev => {
        const next = { ...prev };
        delete next[driveId];
        return next;
      });
      showStatus('success', `Storage space updated for ${updated.name}.`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Unknown error refreshing storage.';
      setDriveErrors(prev => ({
        ...prev,
        [driveId]: errMsg
      }));
      showStatus('error', `Failed to refresh storage: ${errMsg}`);
    } finally {
      setRefreshingDriveId(null);
    }
  };

  const handleRefreshAllStorage = async () => {
    setIsRefreshingAll(true);
    try {
      const updatedDrives = await Promise.all(
        drives.map(async (d) => {
          if (d.connectedStatus === 'connected') {
            try {
              const updated = await StorageService.refreshDriveStorage(d.id);
              setDriveErrors(prev => {
                const next = { ...prev };
                delete next[d.id];
                return next;
              });
              return updated;
            } catch (err: any) {
              console.error(`[Admin] Failed to refresh drive ${d.id}:`, err);
              const errMsg = err.message || 'Failed to refresh storage.';
              setDriveErrors(prev => ({
                ...prev,
                [d.id]: errMsg
              }));
              return d;
            }
          }
          return d;
        })
      );
      setDrives(updatedDrives);
      showStatus('success', 'All connected Google Drive quotas refreshed successfully!');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to refresh all drives storage.');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  // Queue Operations
  const handleEnqueueMockFile = (presetType: 'small-photo' | 'medium-photo' | 'large-video' | 'exhaustion-video') => {
    if (!uploadTripId) {
      showStatus('error', 'Please select a destination trip above first.');
      return;
    }

    const targetTrip = trips.find(t => t.id === uploadTripId);
    const tripTitle = targetTrip ? targetTrip.title : 'Active Trip';

    let fileDetail: {
      fileName: string;
      fileSize: number;
      mediaType: 'photos' | 'videos';
      caption: string;
      location: string;
    } = {
      fileName: 'kashmir_gondola_view.jpg',
      fileSize: 4.8 * 1024 * 1024, // 4.8 MB
      mediaType: 'photos',
      caption: uploadCaption || 'Stunning scenery captured from Gulmarg Gondola',
      location: uploadLocation || 'Gulmarg, Kashmir'
    };

    if (presetType === 'medium-photo') {
      fileDetail = {
        fileName: 'dal_lake_sunset_reflection.jpg',
        fileSize: 8.4 * 1024 * 1024, // 8.4 MB
        mediaType: 'photos',
        caption: uploadCaption || 'Sunset orange glow reflected in serene Dal Lake waters',
        location: uploadLocation || 'Srinagar, Kashmir'
      };
    } else if (presetType === 'large-video') {
      fileDetail = {
        fileName: 'sonamarg_glacial_trek.mp4',
        fileSize: 48.6 * 1024 * 1024, // 48.6 MB
        mediaType: 'videos',
        caption: uploadCaption || 'Hiking up towards Thajiwas Glacier stream',
        location: uploadLocation || 'Sonamarg, Kashmir'
      };
    } else if (presetType === 'exhaustion-video') {
      fileDetail = {
        fileName: 'uncompressed_high_fidelity_trip_backup.mp4',
        fileSize: 12.5 * 1024 * 1024 * 1024, // 12.5 GB (Will trigger routing of low space drives or failure fallback!)
        mediaType: 'videos',
        caption: uploadCaption || 'Raw uncompressed high-fidelity video footage reel',
        location: uploadLocation || 'Kashmir'
      };
    }

    const newItem: QueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...fileDetail,
      tripId: uploadTripId,
      tripTitle,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toLocaleTimeString()
    };

    setUploadQueue(prev => [...prev, newItem]);
    showStatus('success', `Added "${fileDetail.fileName}" to upload queue.`);
  };

  const handleRemoveFromQueue = (itemId: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearQueue = () => {
    setUploadQueue([]);
  };

  const processQueue = async () => {
    if (processingQueue || uploadQueue.filter(item => item.status === 'pending').length === 0) return;
    setProcessingQueue(true);

    const logs: string[] = [...uploadLogs];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setUploadLogs([...logs]);
    };

    addLog(`⚙️ Starting batch processing of upload queue...`);

    const itemsToProcess = [...uploadQueue];
    
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      if (item.status !== 'pending') continue;

      // Update item status in UI
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 15 } : q));
      addLog(`⚡ Processing queue item [${i + 1}/${itemsToProcess.length}]: "${item.fileName}" (${(item.fileSize / 1024 / 1024).toFixed(2)} MB)`);

      try {
        // Evaluate dynamic auto-routing
        const currentDrives = await StorageService.getDrives();
        const activeDrives = currentDrives.filter(d => d.healthStatus !== 'offline');
        
        if (activeDrives.length === 0) {
          throw new Error('All configured Google Drive targets are offline.');
        }

        // Rank available drives by free space descending
        activeDrives.sort((a, b) => b.remainingStorage - a.remainingStorage);
        
        let bestDrive = activeDrives[0];
        
        // Check if best drive has enough space, if not check others (Sequential Failover Routing)
        if (bestDrive.remainingStorage < item.fileSize) {
          addLog(`⚠️ Selected target "${bestDrive.name}" has insufficient storage (${(bestDrive.remainingStorage / 1024 / 1024 / 1024).toFixed(2)} GB) for file (${(item.fileSize / 1024 / 1024 / 1024).toFixed(2)} GB). Triggering automatic routing failover...`);
          
          const fitDrive = activeDrives.find(d => d.remainingStorage >= item.fileSize);
          if (!fitDrive) {
            throw new Error(`Insufficient aggregate free space across all online storage pools.`);
          }
          bestDrive = fitDrive;
        }

        addLog(`🎯 Dynamic Routing: Routed "${item.fileName}" to target "${bestDrive.name}"`);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 45, targetDriveId: bestDrive.id } : q));

        // Create a dummy mock file with exact metadata size representation
        const mockBlob = new Blob([new ArrayBuffer(Math.min(item.fileSize, 5 * 1024 * 1024))], { 
          type: item.mediaType === 'photos' ? 'image/jpeg' : 'video/mp4' 
        });
        const mockFile = new File([mockBlob], item.fileName, { 
          type: item.mediaType === 'photos' ? 'image/jpeg' : 'video/mp4' 
        });

        // Use custom property overrides to pass simulated large sizes to uploadMedia
        Object.defineProperty(mockFile, 'size', { value: item.fileSize, writable: false });

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 80 } : q));

        // Perform actual or high fidelity simulated storage sync upload
        await StorageService.uploadMedia(
          mockFile,
          item.tripId,
          item.tripTitle,
          item.mediaType,
          item.caption,
          item.location
        );

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q));
        addLog(`✅ Successfully uploaded "${item.fileName}" to ${bestDrive.name} and synchronized in Firestore.`);

        // Reload data to reflect decreased space
        const refreshedDrives = await StorageService.getDrives();
        setDrives(refreshedDrives);

      } catch (err: any) {
        console.error(err);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', error: err.message || 'Routing failed' } : q));
        addLog(`❌ Failed to route "${item.fileName}": ${err.message || 'System resource exhaustion'}`);
      }

      // Small throttle between processing items to look highly aesthetic
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setProcessingQueue(false);
    addLog(`✨ Queue processing run completed.`);
    loadData();
  };

  const handleMediaUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showStatus('error', 'Please select a valid image or video file.');
      return;
    }
    if (!uploadTripId) {
      showStatus('error', 'Please select a trip destination to organize this file.');
      return;
    }

    setUploadingMedia(true);
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setUploadLogs([...logs]);
    };

    try {
      const targetTrip = trips.find(t => t.id === uploadTripId);
      const tripName = targetTrip ? targetTrip.title : 'Trip';

      addLog(`🔍 Analyzed file: "${selectedFile.name}" (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
      addLog(`🎯 Target destination trip: "${tripName}"`);
      addLog(`⚙️ Initiating automatic target selector engine...`);
      
      // Rank and log drives ourselves to show the algorithm clearly
      const activeDrives = drives.filter(d => d.healthStatus !== 'offline');
      if (activeDrives.length === 0) {
        throw new Error('All configured Google Drive targets are offline.');
      }
      
      addLog(`📊 Ranking available online storage targets (${activeDrives.length} drives detected):`);
      activeDrives.forEach(d => {
        addLog(`   • ${d.name}: ${(d.remainingStorage / 1024 / 1024 / 1024).toFixed(2)} GB free space (${d.healthStatus})`);
      });

      // Sort by remaining space descending
      activeDrives.sort((a, b) => b.remainingStorage - a.remainingStorage);
      const selectedDrive = activeDrives[0];
      
      addLog(`🚀 Auto-selected best storage target: ${selectedDrive.name} with ${(selectedDrive.remainingStorage / 1024 / 1024 / 1024).toFixed(2)} GB available`);
      
      if (selectedDrive.connectedStatus === 'disconnected') {
        addLog(`⚠️ Selected target is disconnected. Utilizing active high-fidelity emulator...`);
      } else {
        addLog(`🔑 Active OAuth credential active for ${selectedDrive.email}. Utilizing direct REST API...`);
        addLog(`📁 Ensuring folder structure in Drive: Travel With Shubham / Trips / ${tripName} / ${uploadMediaType === 'photos' ? 'Photos' : 'Videos'}`);
      }

      // Execute upload
      addLog(`📤 Uploading file segments...`);
      await StorageService.uploadMedia(
        selectedFile, 
        uploadTripId, 
        tripName, 
        uploadMediaType === 'photos' ? 'photos' : 'videos',
        uploadCaption,
        uploadLocation || tripName
      );

      addLog(`✅ Upload succeeded on ${selectedDrive.name}!`);
      addLog(`🔒 Sharing permissions set to: 'anyone with link reader'`);
      addLog(`🔄 Syncing reference metadata documents to Firestore collections...`);
      addLog(`✨ Database metrics updated: Trip counts and Global stats incremented.`);

      showStatus('success', `"${selectedFile.name}" successfully uploaded to ${selectedDrive.name} and synchronized in Firestore!`);
      
      // Reset upload inputs
      setSelectedFile(null);
      setUploadCaption('');
      setUploadLocation('');
      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      loadData();
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Upload failed: ${err.message || String(err)}`);
      showStatus('error', `Media upload failed: ${err.message || 'System storage issue.'}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="pt-32 pb-24 px-4 flex flex-col items-center justify-center min-h-[70vh]" id="admin-loading-container">
        <div className="w-12 h-12 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4" />
        <span className="text-gray-400 font-mono text-sm tracking-widest">Verifying Admin Privileges...</span>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-[90vh]" id="admin-dashboard-root">
      
      {/* 1. ADMIN CARD HEADER (Profile pic, name, and logout) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md mb-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Profile info segment */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] rounded-full opacity-70 blur-[3px]" />
            <img 
              src={user.photoURL || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'} 
              alt={user.displayName || 'Shubham'} 
              referrerPolicy="no-referrer"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover relative border border-[#050816] z-10"
            />
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-[#050816] rounded-full z-20" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF] font-mono text-[10px] uppercase tracking-[0.25em] font-black bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded">
                Verified Admin
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-display font-black tracking-tight text-white mt-1">
              {user.displayName || 'Wanderer Shubham'}
            </h1>
            <p className="text-gray-400 text-xs md:text-sm font-mono mt-0.5 select-all">
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Button Segment */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => { resetForm(); setActiveTab('manage-trips'); loadData(); }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5 rounded-xl transition-all text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Refresh Database
          </button>
          
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="flex-1 md:flex-none px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] transition-all text-red-400 font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      {/* STATUS FEEDBACK POPUP CONTAINER */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {syncError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3 text-red-400 animate-pulse">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm uppercase tracking-wider font-display">Database Synchronization Failure</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {syncError}
            </p>
            <button
              onClick={loadData}
              className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/35 text-red-300 rounded-lg text-[10px] uppercase font-bold tracking-wider font-mono border border-red-500/20 transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* 2. ADMIN METRIC CARDS (Total Trips, Photos, Videos, States) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10" id="admin-stats-bento">
        {/* Trips Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[#00E5FF]/20 group-hover:text-[#00E5FF]/40 transition-colors">
            <Compass className="w-8 h-8" />
          </div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Total Trips</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white">{trips.length}</span>
            <span className="text-[10px] text-[#00E5FF] font-mono">active documents</span>
          </div>
          <div className="mt-3 text-[10px] text-gray-500">
            Fallback target config: {globalStats.trips}
          </div>
        </div>

        {/* Photos Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[#00E5FF]/20 group-hover:text-[#00E5FF]/40 transition-colors">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Total Photos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white">{photosCount}</span>
            <span className="text-[10px] text-[#00E5FF] font-mono">uploaded</span>
          </div>
          <div className="mt-3 text-[10px] text-gray-500">
            Configured fallback count: {globalStats.photos}
          </div>
        </div>

        {/* Videos Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[#00E5FF]/20 group-hover:text-[#00E5FF]/40 transition-colors">
            <VideoIcon className="w-8 h-8" />
          </div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Total Videos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white">{videosCount}</span>
            <span className="text-[10px] text-[#00E5FF] font-mono">linked clips</span>
          </div>
          <div className="mt-3 text-[10px] text-gray-500">
            Configured fallback count: {globalStats.videos}
          </div>
        </div>

        {/* States Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[#00E5FF]/20 group-hover:text-[#00E5FF]/40 transition-colors">
            <BarChart3 className="w-8 h-8" />
          </div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Total States</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white">
              {Array.from(new Set(trips.map(t => t.state))).filter(Boolean).length || globalStats.states}
            </span>
            <span className="text-[10px] text-[#00E5FF] font-mono">explored</span>
          </div>
          <div className="mt-3 text-[10px] text-gray-500">
            Global metrics card count: {globalStats.states}
          </div>
        </div>
      </div>

      {/* 3. SUB-NAV / CONTROL TABS */}
      <div className="flex border-b border-white/10 gap-1 sm:gap-2 mb-8 overflow-x-auto pb-px">
        <button
          onClick={() => { resetForm(); setActiveTab('manage-trips'); }}
          className={`px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'manage-trips' 
              ? 'border-[#00E5FF] text-white bg-white/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Manage Trips
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('add-trip'); }}
          className={`px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'add-trip' 
              ? 'border-[#00E5FF] text-white bg-white/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Trip
        </button>

        {activeTab === 'edit-trip' && (
          <button
            className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 border-[#00E5FF] text-white bg-white/5 whitespace-nowrap flex items-center gap-1.5"
          >
            Editing: {editingTrip?.title.slice(0, 15)}...
          </button>
        )}

        <button
          onClick={() => setActiveTab('update-stats')}
          className={`px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'update-stats' 
              ? 'border-[#00E5FF] text-white bg-white/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Global Stats
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('storage-manager'); }}
          className={`px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'storage-manager' 
              ? 'border-[#00E5FF] text-white bg-white/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          Storage Manager
        </button>
      </div>

      {/* 4. ACTIVE SUB-VIEW RENDERING */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-mono">Synchronizing with live database collections...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: MANAGE TRIPS */}
          {activeTab === 'manage-trips' && (
            <motion.div
              key="manage-trips"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-white font-display text-lg font-bold">Current Journeys ({trips.length})</h3>
                <button
                  onClick={() => setActiveTab('add-trip')}
                  className="px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Journey
                </button>
              </div>

              {trips.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-gray-400 text-sm mb-4">No trips currently stored in Firestore. Seed the database to get started.</p>
                  <button 
                    onClick={loadData}
                    className="px-5 py-2.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-[#00E5FF]/20 transition-all"
                  >
                    Attempt Reload
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
                  {/* Table Layout */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Cover & Title</th>
                          <th className="p-4 text-xs font-mono text-gray-400 uppercase tracking-wider hidden sm:table-cell">Geographics</th>
                          <th className="p-4 text-xs font-mono text-gray-400 uppercase tracking-wider hidden md:table-cell">Stats</th>
                          <th className="p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="p-4 text-xs font-mono text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {trips.map((trip) => (
                          <tr key={trip.id} className="hover:bg-white/[0.01] transition-all">
                            {/* Trip title & visual identifier */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={trip.coverImage} 
                                  alt={trip.title} 
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10" 
                                />
                                <div className="max-w-[200px] sm:max-w-sm">
                                  <span className="font-bold text-white text-sm line-clamp-1">{trip.title}</span>
                                  <span className="text-gray-400 text-xs block font-mono">ID: {trip.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Location geographical identifiers */}
                            <td className="p-4 hidden sm:table-cell">
                              <span className="text-white text-xs block">{trip.location}</span>
                              <span className="text-[#00E5FF] text-[10px] font-mono tracking-wider uppercase block">{trip.state}</span>
                            </td>

                            {/* Count summaries */}
                            <td className="p-4 hidden md:table-cell">
                              <div className="text-xs text-gray-300 font-mono space-y-0.5">
                                <div>Photos: <span className="text-[#00E5FF] font-bold">{trip.photosCount}</span></div>
                                <div>Videos: <span className="text-white">{trip.videosCount}</span></div>
                                <div>Dist: <span className="text-gray-400">{trip.distance} km</span></div>
                              </div>
                            </td>

                            {/* Starting details */}
                            <td className="p-4">
                              <span className="text-white text-xs block whitespace-nowrap">{trip.startDate}</span>
                              <span className="text-gray-400 text-[10px] block font-mono">{trip.duration}</span>
                            </td>

                            {/* Operations */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEditingTrip(trip)}
                                  className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20 rounded-lg transition-all"
                                  title="Edit Trip details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTrip(trip.id, trip.title)}
                                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                  title="Delete from Firestore"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2 & 3: ADD TRIP & EDIT TRIP FORM */}
          {(activeTab === 'add-trip' || activeTab === 'edit-trip') && (
            <motion.div
              key="trip-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md max-w-4xl mx-auto shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <button
                  onClick={() => { resetForm(); setActiveTab('manage-trips'); }}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-white font-display text-lg font-bold">
                    {activeTab === 'add-trip' ? 'Create New Trip Document' : 'Edit Existing Journey Document'}
                  </h3>
                  <p className="text-gray-400 text-xs">Configure properties that will sync dynamically to our layouts.</p>
                </div>
              </div>

              <form onSubmit={handleTripSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Trip Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spiti Desert Expedition"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Slugified Identifier */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Document Identifier (Slug ID) *</label>
                    <input
                      type="text"
                      required
                      disabled={activeTab === 'edit-trip'}
                      placeholder="e.g. spiti-valley-2026"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all disabled:opacity-50"
                    />
                    {activeTab === 'add-trip' && (
                      <span className="text-[10px] text-gray-500">Automatically slugified from title. Standard format: lowercase with dashes.</span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Location (Cities/Points) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Srinagar & Gulmarg, Kashmir"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* State selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">State / Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jammu & Kashmir"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Cover Image URL */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Cover Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">StartDate (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Duration string *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10 Days"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Photos count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Photos Metric *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPhotosCount}
                      onChange={(e) => setFormPhotosCount(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  {/* Videos Count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Videos Metric *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formVideosCount}
                      onChange={(e) => setFormVideosCount(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  {/* Distance */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Distance Traversed (km) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formDistance}
                      onChange={(e) => setFormDistance(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Himalayas, Road Trip, Buddhist"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Description textarea */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Detailed Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe the landscape features, itinerary nodes, elevation metrics..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl p-4 outline-none text-sm leading-relaxed transition-all resize-none"
                    />
                  </div>

                </div>

                {/* Submission button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setActiveTab('manage-trips'); }}
                    className="px-6 py-3 border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Synchronizing...' : 'Save and Deploy'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 4: UPDATE STATS DIRECTLY */}
          {activeTab === 'update-stats' && (
            <motion.div
              key="update-stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md max-w-2xl mx-auto shadow-2xl"
            >
              <div className="mb-6 border-b border-white/10 pb-4">
                <h3 className="text-white font-display text-lg font-bold">Configure Travel Statistics</h3>
                <p className="text-gray-400 text-xs">These values update the counters appearing on the homepage statistics panel.</p>
              </div>

              <form onSubmit={handleStatsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Stat: Trips */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Trips Done Count</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsTrips}
                      onChange={(e) => setStatsTrips(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Stat: Photos */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Total Photographed</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsPhotos}
                      onChange={(e) => setStatsPhotos(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Stat: Videos */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Total Video Clips</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsVideos}
                      onChange={(e) => setStatsVideos(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Stat: States */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">States Traversed</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsStates}
                      onChange={(e) => setStatsStates(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Stat: Distance */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Distance Metric (km)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsDistance}
                      onChange={(e) => setStatsDistance(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Stat: Years */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase font-semibold">Years Exploring</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={statsYears}
                      onChange={(e) => setStatsYears(Number(e.target.value))}
                      className="bg-black/30 border border-white/10 focus:border-[#00E5FF]/50 text-white rounded-xl px-4 py-3 outline-none text-sm font-mono"
                    />
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('manage-trips')}
                    className="px-6 py-3 border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Updating...' : 'Save Metrics'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 5: GOOGLE DRIVE STORAGE MANAGER & UPLOAD ENGINE */}
          {activeTab === 'storage-manager' && (() => {
            const formatBytes = (bytes: number) => {
              if (bytes === 0) return '0.00 Bytes';
              const k = 1024;
              const dm = 2;
              const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };

            const connectedDrives = drives.filter(d => d.connectedStatus === 'connected');
            const onlineDrives = connectedDrives.filter(d => d.healthStatus !== 'offline');
            const totalStorageCapacity = onlineDrives.reduce((acc, d) => acc + d.totalStorage, 0);
            const totalStorageUsed = onlineDrives.reduce((acc, d) => acc + d.usedStorage, 0);
            const totalStorageRemaining = Math.max(0, totalStorageCapacity - totalStorageUsed);
            const globalPercentUsed = totalStorageCapacity > 0 ? (totalStorageUsed / totalStorageCapacity) * 100 : 0;

            const sortedByFreeSpace = [...onlineDrives].sort((a, b) => b.remainingStorage - a.remainingStorage);
            const nextTargetDrive = sortedByFreeSpace[0];

            return (
              <motion.div
                key="storage-manager"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 text-left"
              >
                {/* Section Hero Banner */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-white font-display text-xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-[#00E5FF]" />
                        Distributed Multi-Drive Storage Workspace
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 max-w-3xl">
                        An intelligent, client-authoritative backup array designed to scale storage capacity infinitely across separate Google Drive pools.
                        Uploads are automatically routed to the healthiest drive with the largest available free space, complete with sequential failover routing.
                      </p>
                    </div>
                    <button
                      onClick={handleRefreshAllStorage}
                      disabled={isRefreshingAll || connectedDrives.length === 0}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                      {isRefreshingAll ? 'Refreshing Pool...' : 'Refresh All Drives'}
                    </button>
                  </div>
                </div>

                {/* Global Storage Pool Overview & Next Upload Routing Target */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Global Capacity Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                      Aggregate Storage Pool
                    </h4>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Total Capacity</span>
                        <span className="text-white font-mono text-base md:text-lg font-bold">{formatBytes(totalStorageCapacity)}</span>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Pool Space Used</span>
                        <span className="text-[#00E5FF] font-mono text-base md:text-lg font-bold">{formatBytes(totalStorageUsed)}</span>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Free Space Available</span>
                        <span className="text-emerald-400 font-mono text-base md:text-lg font-bold">{formatBytes(totalStorageRemaining)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">Combined Capacity Load</span>
                        <span className="text-white font-bold">{globalPercentUsed.toFixed(2)}% Used</span>
                      </div>
                      <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-[#00B0FF] to-indigo-500 transition-all duration-700"
                          style={{ width: `${globalPercentUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Next Upload Selector Display Card */}
                  <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div>
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        Next Upload Routing Target
                      </h4>
                      
                      {nextTargetDrive ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                              <HardDrive className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-white font-bold block text-lg">{nextTargetDrive.name}</span>
                              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> Preferred Active Target
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-xs leading-relaxed">
                            Currently has the largest available capacity pool: <strong className="text-white font-mono">{formatBytes(nextTargetDrive.remainingStorage)}</strong> of free space.
                          </p>
                        </div>
                      ) : (
                        <div className="py-4 space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 animate-pulse" />
                            {connectedDrives.length > 0 ? 'All Targets Offline!' : 'No Active Google Drive Linked'}
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {connectedDrives.length > 0 ? (
                              "All connected drives are currently set to offline. Configure at least one to healthy or degraded to enable routing."
                            ) : (
                              "No real Google Drive accounts are linked yet. Link a Google account below to start backing up your travel media."
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px] font-mono text-gray-500">
                      <span>Failover Routing Mode:</span>
                      <span className="text-[#00E5FF] uppercase font-bold">Dynamic Sorted Space</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Drive Configuration Accounts List Grid */}
                <div className="space-y-4">
                  <h4 className="text-white font-display text-base font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00E5FF]" />
                    Configured Google Drive Pools
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drives.map((drive) => {
                      const isConnected = drive.connectedStatus === 'connected';
                      const totalStorage = isConnected ? drive.totalStorage : 0;
                      const usedStorage = isConnected ? drive.usedStorage : 0;
                      const remainingStorage = isConnected ? drive.remainingStorage : 0;
                      const percentUsed = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;
                      const hasTestResult = testResults[drive.id];
                      
                      return (
                        <div 
                          key={drive.id} 
                          className={`bg-white/5 border rounded-3xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                            drive.healthStatus === 'offline' 
                              ? 'border-red-500/20 bg-red-500/[0.01]' 
                              : drive.healthStatus === 'degraded'
                              ? 'border-amber-500/20 bg-amber-500/[0.01]'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
                          
                          <div>
                            {/* Drive Card Header */}
                            <div className="flex justify-between items-start mb-5">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${
                                  drive.healthStatus === 'offline' 
                                    ? 'bg-red-500/10 text-red-400' 
                                    : drive.healthStatus === 'degraded'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-[#00E5FF]/10 text-[#00E5FF]'
                                }`}>
                                  <HardDrive className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold text-base flex items-center gap-1.5">
                                    {drive.name}
                                    {nextTargetDrive?.id === drive.id && (
                                      <span className="text-[9px] font-mono text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">Next Upload Target</span>
                                    )}
                                  </h4>
                                  <p className="text-gray-400 text-xs font-mono">ID: {drive.id}</p>
                                </div>
                              </div>

                              {/* Health Badge */}
                              <div className="flex flex-col items-end gap-1">
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                  drive.healthStatus === 'offline'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : drive.healthStatus === 'degraded'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {drive.healthStatus === 'offline' ? (
                                    <WifiOff className="w-3 h-3" />
                                  ) : (
                                    <Wifi className="w-3 h-3" />
                                  )}
                                  {drive.healthStatus}
                                </div>
                              </div>
                            </div>

                            {/* Storage Metric Progress Bar */}
                            <div className="space-y-2 mb-5">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-gray-400">Storage Distribution</span>
                                <span className="text-white font-bold">{percentUsed.toFixed(1)}% Used</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    drive.healthStatus === 'offline'
                                      ? 'bg-red-500'
                                      : drive.healthStatus === 'degraded'
                                      ? 'bg-amber-500'
                                      : 'bg-gradient-to-r from-[#00E5FF] to-[#00B0FF]'
                                  }`}
                                  style={{ width: `${percentUsed}%` }}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-gray-500 text-center">
                                <div className="text-left">
                                  <span className="block text-[9px] text-gray-400 uppercase">Used</span>
                                  <span className="text-gray-300 font-semibold">{formatBytes(usedStorage)}</span>
                                </div>
                                <div className="text-center">
                                  <span className="block text-[9px] text-gray-400 uppercase">Free</span>
                                  <span className="text-emerald-400 font-semibold">{formatBytes(remainingStorage)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[9px] text-gray-400 uppercase">Total</span>
                                  <span className="text-gray-300 font-semibold">{formatBytes(totalStorage)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Connection Status Error Box */}
                            {!isConnected ? (
                              <div className="p-3.5 rounded-2xl text-xs mb-5 border font-mono bg-red-500/10 border-red-500/20 text-red-400">
                                <div className="flex justify-between items-center font-bold mb-1 uppercase text-[9px] tracking-wider">
                                  <span>Connection Status: Disconnected</span>
                                </div>
                                <p className="leading-relaxed">
                                  Google Account is not connected. Link your Google Account to authorize connection and fetch real storage.
                                </p>
                              </div>
                            ) : driveErrors[drive.id] ? (
                              <div className="p-3.5 rounded-2xl text-xs mb-5 border font-mono bg-red-500/10 border-red-500/20 text-red-400">
                                <div className="flex justify-between items-center font-bold mb-1 uppercase text-[9px] tracking-wider">
                                  <span>Sync Error</span>
                                </div>
                                <p className="leading-relaxed">
                                  {driveErrors[drive.id]}
                                </p>
                              </div>
                            ) : null}

                            {/* Account & Folder Metadata Info */}
                            <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-white/5 text-xs mb-5">
                              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <span className="text-gray-400 font-mono">Google Account</span>
                                <span className={`font-mono font-semibold truncate max-w-[170px] ${drive.connectedStatus === 'connected' ? 'text-[#00E5FF]' : 'text-gray-500'}`} title={drive.email || 'Unlinked'}>
                                  {drive.connectedStatus === 'connected' ? drive.email : 'Disconnected'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <span className="text-gray-400 font-mono">Root Folder</span>
                                <span className="font-mono text-gray-300 truncate max-w-[170px] bg-black/40 px-1.5 py-0.5 rounded border border-white/5" title={drive.rootFolderId}>
                                  {drive.rootFolderId}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-mono">Last Evaluated</span>
                                <span className="text-gray-300 font-mono text-[10px]">
                                  {new Date(drive.lastSyncTime).toLocaleDateString()} {new Date(drive.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Connection Handshake Diagnostic Box */}
                            {hasTestResult && (
                              <div className={`p-4 rounded-2xl text-xs mb-5 border font-mono ${
                                hasTestResult.success 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}>
                                <div className="flex justify-between items-center font-bold mb-2 uppercase text-[10px] border-b border-white/5 pb-1">
                                  <span>Integration Test Report</span>
                                  <span className="text-[9px] opacity-75">{hasTestResult.timestamp}</span>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap font-mono text-[11px] overflow-x-auto">{hasTestResult.message}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 pt-3 border-t border-white/5">
                            {/* Toggle State Simulator */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Configure State Simulator:</span>
                              <div className="flex gap-1">
                                {(['healthy', 'degraded', 'offline'] as const).map((h) => (
                                  <button
                                    key={h}
                                    onClick={() => handleToggleHealth(drive.id, h)}
                                    className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded transition-all ${
                                      drive.healthStatus === h
                                        ? h === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                                          : h === 'degraded' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                                          : 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Utility Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleTestConnection(drive.id)}
                                disabled={testingDriveId === drive.id}
                                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {testingDriveId === drive.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Activity className="w-3.5 h-3.5" />
                                )}
                                Test Connection
                              </button>
                              <button
                                onClick={() => handleRefreshStorage(drive.id)}
                                disabled={refreshingDriveId === drive.id}
                                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {refreshingDriveId === drive.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3.5 h-3.5" />
                                )}
                                Sync Quota
                              </button>
                            </div>

                            {drive.connectedStatus === 'connected' ? (
                              <button
                                onClick={() => handleDisconnectDrive(drive.id)}
                                className="w-full py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                              >
                                Disconnect Google Drive
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleConnectDrive(drive.id)}
                                  disabled={connectingDriveId === drive.id}
                                  className="w-full py-2.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                >
                                  {connectingDriveId === drive.id ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Authorizing...
                                    </>
                                  ) : (
                                    <>
                                      <LinkIcon className="w-3.5 h-3.5" />
                                      Link Google Account
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleConnectSandboxDrive(drive.id)}
                                  className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Activity className="w-3 h-3" />
                                  Sandbox / Demo Connection
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Queue Configuration Panel & Testing Console */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-5 mb-6">
                    <div>
                      <h3 className="text-white font-display text-lg font-bold flex items-center gap-2">
                        <CloudUpload className="w-5 h-5 text-[#00E5FF]" />
                        Upload Queue Manager & Integration Tester
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Pre-stage files and test multi-drive routing scenarios. Set a drive to "Offline" or reduce space above to verify seamless storage failovers!
                      </p>
                    </div>
                    
                    {/* Setup trip selector for queue items */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
                        <span className="text-[10px] font-mono text-gray-400 uppercase">Target Trip:</span>
                        <select
                          value={uploadTripId}
                          onChange={(e) => setUploadTripId(e.target.value)}
                          className="bg-transparent text-white outline-none text-xs font-semibold cursor-pointer max-w-[180px]"
                        >
                          {trips.map(trip => (
                            <option key={trip.id} value={trip.id} className="bg-[#050816]">
                              {trip.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {!integrationTestPassed ? (
                    <div className="p-8 border border-white/10 rounded-2xl bg-black/40 text-center space-y-4 my-8">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Upload UI Locked</h4>
                        <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                          To ensure data safety, you must verify your Google Drive connection by running a successful 10-step integration test. Click <span className="text-[#00E5FF] font-bold font-mono">"Test Connection"</span> on your connected Google Drive account above to initiate the diagnostic suite and unlock media uploads.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Quick-Stage Presets Row */}
                      <div className="space-y-4 mb-8">
                    <h5 className="text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#00E5FF]" />
                      Add Test Files to Queue:
                    </h5>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => handleEnqueueMockFile('small-photo')}
                        className="py-3 px-4 bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 text-gray-300 hover:text-white rounded-2xl text-xs transition-all text-left flex flex-col justify-between h-20"
                      >
                        <span className="font-bold flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> Scenic Photo</span>
                        <span className="text-[10px] font-mono text-gray-500">Kashmir Gondola • 4.8 MB</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnqueueMockFile('medium-photo')}
                        className="py-3 px-4 bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 text-gray-300 hover:text-white rounded-2xl text-xs transition-all text-left flex flex-col justify-between h-20"
                      >
                        <span className="font-bold flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> Sunset Photo</span>
                        <span className="text-[10px] font-mono text-gray-500">Dal Lake Reflection • 8.4 MB</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnqueueMockFile('large-video')}
                        className="py-3 px-4 bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 text-gray-300 hover:text-white rounded-2xl text-xs transition-all text-left flex flex-col justify-between h-20"
                      >
                        <span className="font-bold flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> Glacial Trek Video</span>
                        <span className="text-[10px] font-mono text-gray-500">Thajiwas Sonamarg • 48.6 MB</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnqueueMockFile('exhaustion-video')}
                        className="py-3 px-4 bg-white/5 border border-white/5 hover:border-red-500/30 text-gray-300 hover:text-white rounded-2xl text-xs transition-all text-left flex flex-col justify-between h-20"
                      >
                        <span className="font-bold flex items-center gap-1 text-red-400"><VideoIcon className="w-3.5 h-3.5 text-red-500" /> Gigantic Backup</span>
                        <span className="text-[10px] font-mono text-gray-500">Triggers Failover • 12.5 GB</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Queue Table */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                        Active Queue List ({uploadQueue.length} files staged)
                      </h5>
                      {uploadQueue.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleClearQueue}
                            disabled={processingQueue}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase transition-all"
                          >
                            Clear Queue
                          </button>
                          <button
                            onClick={processQueue}
                            disabled={processingQueue || uploadQueue.filter(q => q.status === 'pending').length === 0}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1"
                          >
                            {processingQueue ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CloudUpload className="w-3 h-3" />
                                Run Queue
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {uploadQueue.length === 0 ? (
                      <div className="border border-dashed border-white/10 rounded-2xl p-8 bg-black/10 text-center flex flex-col items-center justify-center">
                        <CloudUpload className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-gray-300 text-sm font-bold">Staging Queue is Empty</p>
                        <p className="text-gray-500 text-xs font-mono mt-1">Select your target trip and click any preset button above to enqueue test uploads.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10 font-mono text-[10px] text-gray-400 uppercase">
                              <th className="p-3">File details</th>
                              <th className="p-3">Organized Trip</th>
                              <th className="p-3">Simulated Size</th>
                              <th className="p-3">Target Drive</th>
                              <th className="p-3">Progress</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                            {uploadQueue.map((item) => (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-3 max-w-[200px]">
                                  <div className="flex items-center gap-2">
                                    {item.mediaType === 'photos' ? (
                                      <ImageIcon className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                                    ) : (
                                      <VideoIcon className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                                    )}
                                    <div className="truncate">
                                      <span className="text-white font-bold block truncate">{item.fileName}</span>
                                      <span className="text-[10px] text-gray-500 truncate block">{item.caption}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-gray-300">{item.tripTitle}</td>
                                <td className="p-3 text-gray-400 font-mono">{formatBytes(item.fileSize)}</td>
                                <td className="p-3">
                                  {item.targetDriveId ? (
                                    <span className="px-2 py-0.5 bg-white/5 text-[#00E5FF] border border-[#00E5FF]/20 rounded font-bold">{item.targetDriveId}</span>
                                  ) : (
                                    <span className="text-gray-500">Auto-Router</span>
                                  )}
                                </td>
                                <td className="p-3 w-32">
                                  <div className="space-y-1">
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          item.status === 'failed' ? 'bg-red-500' : 'bg-[#00E5FF]'
                                        }`}
                                        style={{ width: `${item.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold">{item.progress}%</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : item.status === 'uploading'
                                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                      : item.status === 'failed'
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : 'bg-white/5 text-gray-400 border border-white/5'
                                  }`}>
                                    {item.status === 'uploading' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                                    {item.status}
                                  </span>
                                  {item.error && (
                                    <span className="block text-[9px] text-red-400 mt-1 truncate max-w-[120px]" title={item.error}>
                                      {item.error}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleRemoveFromQueue(item.id)}
                                    disabled={processingQueue}
                                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                    title="Remove from queue"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Real-time Dynamic Console Logger */}
                  <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                        Dynamic Failover Routing console
                      </span>
                      {uploadLogs.length > 0 && (
                        <button
                          onClick={() => setUploadLogs([])}
                          className="text-[10px] font-mono text-gray-500 hover:text-white uppercase transition-colors"
                        >
                          Clear Logs
                        </button>
                      )}
                    </div>
                    
                    <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/80">
                      <div className="bg-white/5 px-4 py-2 flex justify-between items-center border-b border-white/10">
                        <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold">Trace & Diagnostic Console Log</span>
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono uppercase">
                          <span>Status: active</span>
                        </div>
                      </div>
                      <div className="p-4 font-mono text-[10px] md:text-[11px] text-[#00E5FF]/90 space-y-1.5 max-h-56 overflow-y-auto leading-relaxed select-text select-all-logs">
                        {uploadLogs.length === 0 ? (
                          <div className="text-gray-600 italic">No operations logged. Enqueue and process files to observe live dynamic failover routing trace paths.</div>
                        ) : (
                          uploadLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap font-mono">{log}</div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      )}

    </div>
  );
}
