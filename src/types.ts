// TypeScript interfaces for Cincinnati Steel Engravings project

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Creator {
  engraver: string;
  publisher: string;
}

export interface Dates {
  created: string;
  published: string;
}

export interface Viewpoint {
  description: string;
  coordinates: Coordinates;
}

export interface Location {
  subject: string;
  neighborhood: string;
  viewpoint: Viewpoint;
}

export interface Technical {
  dimensions: string;
  technique: string;
}

export interface EngravingMetadata {
  id: string;
  title: string;
  creator: Creator;
  dates: Dates;
  location: Location;
  technical: Technical;
  description: string;
}

export interface MapLayer {
  name: string;
  url: string;
  attribution: string;
  isHistorical: boolean;
}

export interface AppState {
  selectedEngraving: EngravingMetadata | null;
  currentMapLayer: 'modern' | 'historical';
  filteredEngravings: EngravingMetadata[];
  searchQuery: string;
  dateRange: {
    start: number;
    end: number;
  };
}
