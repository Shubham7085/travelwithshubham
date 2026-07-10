import { Trip, Photo, Video, Stats } from './types';

export const INITIAL_STATS: Stats = {
  trips: 9,
  photos: 3450,
  videos: 128,
  states: 12,
  distance: 18500,
  yearsExploring: 6
};

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'spiti-valley-2026',
    title: 'Spiti Valley Expedition',
    description: 'A rugged journey through the cold desert mountain valley of Himachal Pradesh. Traversing high-altitude mountain passes, ancient monasteries like Key Monastery, and pristine lakes under starry clear skies.',
    location: 'Spiti Valley, Himachal Pradesh',
    duration: '10 Days',
    startDate: '2026-06-12',
    coverImage: 'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=1200&q=80',
    photosCount: 24,
    videosCount: 6,
    state: 'Himachal Pradesh',
    distance: 1200,
    tags: ['Adventure', 'Himalayas', 'Road Trip', 'Monasteries']
  },
  {
    id: 'kashmir-paradise-2026',
    title: 'Autumn in Kashmir',
    description: 'Exploring the true paradise on earth. Floating on the quiet waters of Dal Lake in standard Shikaras, capturing golden Chinar trees, and hiking through snow-dusted valleys of Gulmarg and Sonamarg.',
    location: 'Srinagar & Gulmarg, Kashmir',
    duration: '8 Days',
    startDate: '2025-10-18',
    coverImage: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?auto=format&fit=crop&w=1200&q=80',
    photosCount: 18,
    videosCount: 4,
    state: 'Jammu & Kashmir',
    distance: 850,
    tags: ['Scenic', 'Chinar', 'Shikara', 'Snow']
  },
  {
    id: 'sikkim-gangtok-2025',
    title: 'High Passes of Sikkim & Gangtok',
    description: 'Chasing clouds across Eastern India. From the vibrant streets of Gangtok to the dramatic, winding roads of Nathu La Pass, Gurudongmar Lake, and pristine rhododendron-filled valleys of North Sikkim.',
    location: 'Gangtok & Gurudongmar, Sikkim',
    duration: '9 Days',
    startDate: '2025-05-04',
    coverImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    photosCount: 32,
    videosCount: 8,
    state: 'Sikkim',
    distance: 950,
    tags: ['High Altitude', 'Lakes', 'Border Land', 'Buddhist']
  },
  {
    id: 'meghalaya-abode-of-clouds-2025',
    title: 'Meghalaya: Abode of Clouds',
    description: 'Hiking through the wettest place on Earth. Exploring the ancient Living Root Bridges of Cherrapunji, swimming in the crystal clear glass waters of Umngot River in Dawki, and discovering hidden limestone caves.',
    location: 'Shillong & Cherrapunji, Meghalaya',
    duration: '7 Days',
    startDate: '2025-08-11',
    coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    photosCount: 28,
    videosCount: 5,
    state: 'Meghalaya',
    distance: 600,
    tags: ['Monsoon', 'Root Bridges', 'Waterfalls', 'Caves']
  },
  {
    id: 'tawang-monastery-2025',
    title: 'Mystical Tawang & Sela Pass',
    description: 'An offbeat journey into the mystical Eastern Himalayas. Crossing the frozen Sela Pass at 13,700 ft and documenting the peaceful daily lives inside Asia’s second-largest Buddhist monastery.',
    location: 'Tawang, Arunachal Pradesh',
    duration: '8 Days',
    startDate: '2025-11-20',
    coverImage: 'https://images.unsplash.com/photo-1601919051950-bb9f3ff27fee?auto=format&fit=crop&w=1200&q=80',
    photosCount: 15,
    videosCount: 3,
    state: 'Arunachal Pradesh',
    distance: 1100,
    tags: ['Himalayas', 'Buddhism', 'Frozen Lakes', 'Offbeat']
  },
  {
    id: 'darjeeling-tea-gardens-2024',
    title: 'Vintage Darjeeling Slopes',
    description: 'Chasing the iconic Himalayan Toy Train through mist-covered tea gardens and catching the sunrise over Mount Kanchenjunga from Tiger Hill in a classic, cozy mountain escape.',
    location: 'Darjeeling, West Bengal',
    duration: '5 Days',
    startDate: '2024-12-05',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    photosCount: 20,
    videosCount: 4,
    state: 'West Bengal',
    distance: 400,
    tags: ['Tea Gardens', 'Heritage Train', 'Sunrise', 'Cozy']
  },
  {
    id: 'goa-beyond-beaches-2024',
    title: 'Goa Beyond Beaches',
    description: 'An exploration of Goa’s hidden green hinterlands. Discovering majestic Dudhsagar waterfalls, exploring old Portuguese quarters of Fontainhas, spice plantations, and quiet backwaters.',
    location: 'South & Central Goa',
    duration: '6 Days',
    startDate: '2024-09-14',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    photosCount: 22,
    videosCount: 5,
    state: 'Goa',
    distance: 500,
    tags: ['Monsoon Green', 'Heritage', 'Waterfalls', 'Culture']
  }
];

export const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'photo-1',
    tripId: 'spiti-valley-2026',
    url: 'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=800&q=80',
    caption: 'The majestic Key Monastery perched perfectly atop a hill in Spiti Valley.',
    location: 'Key Monastery, Spiti',
    createdAt: '2026-06-14T10:30:00Z',
    isFeatured: true
  },
  {
    id: 'photo-2',
    tripId: 'kashmir-paradise-2026',
    url: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?auto=format&fit=crop&w=800&q=80',
    caption: 'Classic wooden Shikara floating on the serene Dal Lake during golden hour.',
    location: 'Dal Lake, Srinagar',
    createdAt: '2025-10-19T17:15:00Z',
    isFeatured: true
  },
  {
    id: 'photo-3',
    tripId: 'sikkim-gangtok-2025',
    url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    caption: 'Prayer flags waving high in Nathu La Pass, right on the border.',
    location: 'Nathu La Pass, Sikkim',
    createdAt: '2025-05-06T09:00:00Z',
    isFeatured: true
  },
  {
    id: 'photo-4',
    tripId: 'meghalaya-abode-of-clouds-2025',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    caption: 'Deep in the jungle exploring the incredible double-decker Living Root Bridge.',
    location: 'Nongriat, Meghalaya',
    createdAt: '2025-08-13T12:00:00Z',
    isFeatured: true
  },
  {
    id: 'photo-5',
    tripId: 'tawang-monastery-2025',
    url: 'https://images.unsplash.com/photo-1601919051950-bb9f3ff27fee?auto=format&fit=crop&w=800&q=80',
    caption: 'The colorful prayer wheels framing the entrance of Tawang Monastery.',
    location: 'Tawang Monastery, Arunachal',
    createdAt: '2025-11-22T08:30:00Z',
    isFeatured: true
  },
  {
    id: 'photo-6',
    tripId: 'goa-beyond-beaches-2024',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Quiet pastel Portuguese heritage homes of Fontainhas Quarter.',
    location: 'Fontainhas, Panaji, Goa',
    createdAt: '2024-09-15T15:45:00Z',
    isFeatured: true
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'video-1',
    tripId: 'spiti-valley-2026',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Safe standard open source test video
    title: 'Driving through Kaza and Kunzum Pass',
    duration: '0:35',
    thumbnail: 'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=600&q=80',
    caption: 'Crossing dangerous but gorgeous roads of Himachal.',
    createdAt: '2026-06-15T18:00:00Z'
  },
  {
    id: 'video-2',
    tripId: 'meghalaya-abode-of-clouds-2025',
    url: 'https://www.w3schools.com/html/movie.mp4',
    title: 'The Clear Waters of Dawki River',
    duration: '0:15',
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
    caption: 'Boats literally look like they are floating in mid-air!',
    createdAt: '2025-08-14T11:00:00Z'
  }
];
