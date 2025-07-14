import './styles/modern.css';
import './styles/map.css';
import { loadAllEngravings, searchEngravings, filterByDateRange, sortByDate } from './data/engravings.js';
import type { EngravingMetadata, AppState } from './types.js';

// Import Leaflet
import L from 'leaflet';

/**
 * Cincinnati Steel Engravings - Main Application
 * Modern TypeScript application for exploring historical engravings
 */

// Application State
const appState: AppState = {
  selectedEngraving: null,
  currentMapLayer: 'modern',
  filteredEngravings: [],
  searchQuery: '',
  dateRange: {
    start: 1835,
    end: 1879
  }
};

// Global variables
let map: L.Map;
let engravingsData: EngravingMetadata[] = [];
let markersLayer: L.LayerGroup;

// Map layer configurations
const mapLayers = {
  modern: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }),
  historical: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: USGS, Esri, TANA, DeLorme, and NPS',
    maxZoom: 16
  })
};

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Initializing Cincinnati Steel Engravings app...');
    
    // Load engraving data
    engravingsData = await loadAllEngravings();
    appState.filteredEngravings = [...engravingsData];
    
    console.log(`📚 Loaded ${engravingsData.length} engravings`);
    
    // Initialize map
    initializeMap();
    
    // Render UI components
    renderEngravingsList();
    renderMapMarkers();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('✅ App initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    showError('Failed to load application. Please refresh the page.');
  }
}

/**
 * Initialize the Leaflet map
 */
function initializeMap(): void {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    throw new Error('Map container not found');
  }

  // Cincinnati coordinates (downtown)
  const cincinnatiCenter: [number, number] = [39.1031, -84.5120];
  
  // Create map
  map = L.map(mapContainer, {
    center: cincinnatiCenter,
    zoom: 12,
    zoomControl: true,
    attributionControl: true
  });

  // Add initial layer (modern)
  mapLayers.modern.addTo(map);
  
  // Create markers layer group
  markersLayer = L.layerGroup().addTo(map);
  
  console.log('🗺️ Map initialized');
}

/**
 * Render markers on the map for all engravings
 */
function renderMapMarkers(): void {
  // Clear existing markers
  markersLayer.clearLayers();
  
  appState.filteredEngravings.forEach(engraving => {
    const { lat, lng } = engraving.location.viewpoint.coordinates;
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content">
          <div class="marker-dot"></div>
          <div class="marker-label">${engraving.dates.created}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    // Create marker
    const marker = L.marker([lat, lng], { icon: customIcon })
      .bindPopup(`
        <div class="popup-content">
          <h4>${engraving.title}</h4>
          <p><strong>Artist:</strong> ${engraving.creator.engraver}</p>
          <p><strong>Year:</strong> ${engraving.dates.created}</p>
          <button class="btn btn-primary" onclick="showEngravingDetails('${engraving.id}')">
            View Details
          </button>
        </div>
      `)
      .on('click', () => {
        selectEngraving(engraving);
      });
    
    markersLayer.addLayer(marker);
  });
  
  console.log(`📍 Rendered ${appState.filteredEngravings.length} markers`);
}

/**
 * Render the engravings list in the sidebar
 */
function renderEngravingsList(): void {
  const listContainer = document.getElementById('engravings-list');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  if (appState.filteredEngravings.length === 0) {
    listContainer.innerHTML = `
      <div class="no-results">
        <p>No engravings match your current filters.</p>
      </div>
    `;
    return;
  }
  
  appState.filteredEngravings.forEach(engraving => {
    const card = document.createElement('div');
    card.className = 'card engraving-card';
    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${engraving.title}</h4>
        <p class="card-subtitle">${engraving.dates.created} • ${engraving.creator.engraver}</p>
      </div>
      <div class="card-body">
        <p class="location-info">
          <strong>Location:</strong> ${engraving.location.neighborhood}
        </p>
        <p class="description">${engraving.description.substring(0, 120)}...</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      selectEngraving(engraving);
      focusMapOnEngraving(engraving);
    });
    
    listContainer.appendChild(card);
  });
}

/**
 * Select an engraving and show its details
 */
function selectEngraving(engraving: EngravingMetadata): void {
  appState.selectedEngraving = engraving;
  showEngravingModal(engraving);
}

/**
 * Focus the map on a specific engraving
 */
function focusMapOnEngraving(engraving: EngravingMetadata): void {
  const { lat, lng } = engraving.location.viewpoint.coordinates;
  map.setView([lat, lng], 15, { animate: true });
}

/**
 * Show engraving details in modal
 */
function showEngravingModal(engraving: EngravingMetadata): void {
  const modal = document.getElementById('engraving-modal');
  const modalBody = document.getElementById('modal-body');
  
  if (!modal || !modalBody) return;
  
  modalBody.innerHTML = `
    <div class="engraving-details">
      <div class="engraving-image">
        <img src="/engravings/${engraving.id.replace('steel_engraving_', 'steel_engraving__')}.jpg" 
             alt="${engraving.title}" 
             class="engraving-img" />
      </div>
      <div class="engraving-info">
        <h2>${engraving.title}</h2>
        <div class="metadata-grid">
          <div class="metadata-item">
            <strong>Artist:</strong> ${engraving.creator.engraver}
          </div>
          <div class="metadata-item">
            <strong>Publisher:</strong> ${engraving.creator.publisher}
          </div>
          <div class="metadata-item">
            <strong>Created:</strong> ${engraving.dates.created}
          </div>
          <div class="metadata-item">
            <strong>Published:</strong> ${engraving.dates.published}
          </div>
          <div class="metadata-item">
            <strong>Location:</strong> ${engraving.location.neighborhood}
          </div>
          <div class="metadata-item">
            <strong>Viewpoint:</strong> ${engraving.location.viewpoint.description}
          </div>
          <div class="metadata-item">
            <strong>Dimensions:</strong> ${engraving.technical.dimensions}
          </div>
          <div class="metadata-item">
            <strong>Technique:</strong> ${engraving.technical.technique}
          </div>
        </div>
        <div class="description">
          <h3>Description</h3>
          <p>${engraving.description}</p>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
  modal.classList.add('fade-in');
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  // Search input
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Date range slider
  const dateRange = document.getElementById('date-range') as HTMLInputElement;
  if (dateRange) {
    dateRange.addEventListener('input', handleDateRangeChange);
  }
  
  // Map layer radio buttons
  const mapLayerRadios = document.querySelectorAll('input[name="map-layer"]');
  mapLayerRadios.forEach(radio => {
    radio.addEventListener('change', handleMapLayerChange);
  });
  
  // Modal close button
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('engraving-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

/**
 * Handle search input
 */
function handleSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  appState.searchQuery = input.value;
  applyFilters();
}

/**
 * Handle date range change
 */
function handleDateRangeChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const year = parseInt(input.value);
  
  // For now, we'll use a simple range around the selected year
  appState.dateRange.start = Math.max(1835, year - 10);
  appState.dateRange.end = Math.min(1879, year + 10);
  
  // Update display
  const startSpan = document.getElementById('date-start');
  const endSpan = document.getElementById('date-end');
  if (startSpan) startSpan.textContent = appState.dateRange.start.toString();
  if (endSpan) endSpan.textContent = appState.dateRange.end.toString();
  
  applyFilters();
}

/**
 * Handle map layer change
 */
function handleMapLayerChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const layerType = input.value as 'modern' | 'historical';
  
  // Remove current layer
  if (appState.currentMapLayer === 'modern') {
    map.removeLayer(mapLayers.modern);
  } else {
    map.removeLayer(mapLayers.historical);
  }
  
  // Add new layer
  mapLayers[layerType].addTo(map);
  appState.currentMapLayer = layerType;
  
  console.log(`🗺️ Switched to ${layerType} map layer`);
}

/**
 * Apply current filters to engravings
 */
function applyFilters(): void {
  let filtered = [...engravingsData];
  
  // Apply search filter
  if (appState.searchQuery) {
    filtered = searchEngravings(filtered, appState.searchQuery);
  }
  
  // Apply date range filter
  filtered = filterByDateRange(filtered, appState.dateRange.start, appState.dateRange.end);
  
  // Sort by date
  filtered = sortByDate(filtered, true);
  
  appState.filteredEngravings = filtered;
  
  // Re-render components
  renderEngravingsList();
  renderMapMarkers();
  
  console.log(`🔍 Applied filters: ${filtered.length} engravings shown`);
}

/**
 * Close the engraving modal
 */
function closeModal(): void {
  const modal = document.getElementById('engraving-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('fade-in');
  }
  appState.selectedEngraving = null;
}

/**
 * Show error message to user
 */
function showError(message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <div class="error-content">
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    document.body.removeChild(errorDiv);
  }, 5000);
}

// Global function for popup buttons
(window as any).showEngravingDetails = (id: string) => {
  const engraving = engravingsData.find(e => e.id === id);
  if (engraving) {
    selectEngraving(engraving);
  }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
