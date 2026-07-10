export interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  startDate: string;
  coverImage: string;
  photosCount: number;
  videosCount: number;
  state: string;
  distance: number;
  tags: string[];
}

export interface Photo {
  id: string;
  tripId: string;
  url: string;
  caption: string;
  location: string;
  createdAt: string;
  isFeatured: boolean;
}

export interface Video {
  id: string;
  tripId: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  caption: string;
  createdAt: string;
}

export interface Stats {
  trips: number;
  photos: number;
  videos: number;
  states: number;
  distance: number;
  yearsExploring: number;
}
