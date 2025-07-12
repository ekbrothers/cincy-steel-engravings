import type { EngravingMetadata } from '../types.js';

/**
 * Data management utilities for Cincinnati Steel Engravings
 */

// Cache for loaded metadata
let engravingsCache: EngravingMetadata[] | null = null;

/**
 * Load all engraving metadata from JSON files
 */
export async function loadAllEngravings(): Promise<EngravingMetadata[]> {
  if (engravingsCache) {
    return engravingsCache;
  }

  const engravingIds = [
    'steel_engraving_0001',
    'steel_engraving_0002', 
    'steel_engraving_0003',
    'steel_engraving_0004',
    'steel_engraving_0005',
    'steel_engraving_0006',
    'steel_engraving_0007',
    'steel_engraving_0008',
    'steel_engraving_0009'
  ];

  try {
    const promises = engravingIds.map(async (id) => {
      const response = await fetch(`/metadata/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${id}: ${response.statusText}`);
      }
      return response.json() as Promise<EngravingMetadata>;
    });

    engravingsCache = await Promise.all(promises);
    return engravingsCache;
  } catch (error) {
    console.error('Error loading engraving metadata:', error);
    throw error;
  }
}

/**
 * Get a single engraving by ID
 */
export async function getEngravingById(id: string): Promise<EngravingMetadata | null> {
  const engravings = await loadAllEngravings();
  return engravings.find(engraving => engraving.id === id) || null;
}

/**
 * Filter engravings by date range
 */
export function filterByDateRange(
  engravings: EngravingMetadata[], 
  startYear: number, 
  endYear: number
): EngravingMetadata[] {
  return engravings.filter(engraving => {
    const createdYear = parseInt(engraving.dates.created);
    return createdYear >= startYear && createdYear <= endYear;
  });
}

/**
 * Filter engravings by neighborhood
 */
export function filterByNeighborhood(
  engravings: EngravingMetadata[], 
  neighborhood: string
): EngravingMetadata[] {
  return engravings.filter(engraving => 
    engraving.location.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())
  );
}

/**
 * Search engravings by text query (title, description, creator)
 */
export function searchEngravings(
  engravings: EngravingMetadata[], 
  query: string
): EngravingMetadata[] {
  if (!query.trim()) return engravings;
  
  const searchTerm = query.toLowerCase();
  
  return engravings.filter(engraving => 
    engraving.title.toLowerCase().includes(searchTerm) ||
    engraving.description.toLowerCase().includes(searchTerm) ||
    engraving.creator.engraver.toLowerCase().includes(searchTerm) ||
    engraving.creator.publisher.toLowerCase().includes(searchTerm) ||
    engraving.location.subject.toLowerCase().includes(searchTerm) ||
    engraving.location.neighborhood.toLowerCase().includes(searchTerm)
  );
}

/**
 * Sort engravings by creation date
 */
export function sortByDate(engravings: EngravingMetadata[], ascending = true): EngravingMetadata[] {
  return [...engravings].sort((a, b) => {
    const yearA = parseInt(a.dates.created);
    const yearB = parseInt(b.dates.created);
    return ascending ? yearA - yearB : yearB - yearA;
  });
}

/**
 * Get unique neighborhoods from all engravings
 */
export function getUniqueNeighborhoods(engravings: EngravingMetadata[]): string[] {
  const neighborhoods = engravings.map(e => e.location.neighborhood);
  return [...new Set(neighborhoods)].sort();
}

/**
 * Get date range from all engravings
 */
export function getDateRange(engravings: EngravingMetadata[]): { min: number; max: number } {
  const years = engravings.map(e => parseInt(e.dates.created));
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
}
