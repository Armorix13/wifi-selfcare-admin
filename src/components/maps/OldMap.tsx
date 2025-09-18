/// <reference types="google.maps" />

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BASE_URL, useGetOltDataQuery } from '@/api';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCf_6aGwNfuYI0Ylc0aI2F0H-75qepzIco';

// Add global type declaration for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// OLT Interface
interface OLT {
  _id: string;
  oltId: string;
  name: string;
  oltIp: string;
  macAddress: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  oltType: 'epon' | 'gpon' | 'xgs-pon';
  powerStatus: 'on' | 'off';
  oltPower: number;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  dnsServers: string[];
  attachments: string[];
  outputs: any[];
  createdAt: string;
  updatedAt: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
  ms_devices?: any[];
  fdb_devices?: any[];
  subms_devices?: any[];
  x2_devices?: any[];
  ownedBy?: {
    _id: string;
    email: string;
  };
}

interface OldMapProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  selectedOLTId?: string;
}

export default function OldMap({ isFullscreen = false, onToggleFullscreen, selectedOLTId }: OldMapProps) {
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: oltData, isLoading: oltLoading } = useGetOltDataQuery({});

  // Debug: Track component mount and ref availability
  useEffect(() => {
    // Check ref availability periodically
    const checkRef = () => {
      if (mapRef.current) {
        console.log('OldMap: Map container ready');
      }
    };
    
    // Check after short delays
    const timer1 = setTimeout(checkRef, 100);
    const timer2 = setTimeout(checkRef, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Get address from coordinates using Google Geocoding API
  const getAddressFromCoordinates = async (lat: number, lng: number, oltId: string) => {
    if (addresses[oltId]) return addresses[oltId];
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setAddresses(prev => ({ ...prev, [oltId]: address }));
        return address;
      }
      return 'Address not available';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not available';
    }
  };

  // Load Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google && window.google.maps) {
          setMapLoaded(true);
        } else {
          setLoadError(true);
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Wait a bit for the API to fully initialize
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.MapTypeId) {
          console.log('OldMap: Google Maps API fully loaded');
          setMapLoaded(true);
        } else {
          console.error('OldMap: Google Maps API not fully loaded after script load');
          setLoadError(true);
        }
      }, 100);
    };
    script.onerror = () => {
      setLoadError(true);
      setMapLoaded(false);
      
      // Retry mechanism (max 3 retries)
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setLoadError(false);
        }, 2000);
      }
    };
    document.head.appendChild(script);
  }, [retryCount]);

  // Initialize map
  useEffect(() => {
    console.log('OldMap: Map initialization effect - mapLoaded:', mapLoaded, 'mapRef.current:', !!mapRef.current);
    
    if (!mapLoaded) return;

    let retryAttempt = 0;
    const maxRetries = 20; // 2 seconds max (20 * 100ms)

    const initializeMap = () => {
      console.log(`OldMap: Initialize map attempt ${retryAttempt + 1}/${maxRetries}`);
      
      if (!mapRef.current) {
        retryAttempt++;
        if (retryAttempt >= maxRetries) {
          console.error('OldMap: Map container still not available after maximum retries');
          console.error('OldMap: DOM state debug:', {
            mapRefCurrent: !!mapRef.current,
            documentReady: document.readyState,
            bodyChildren: document.body.children.length
          });
          return;
        }
        
        console.log(`OldMap: Map container not ready, retrying in 100ms... (attempt ${retryAttempt}/${maxRetries})`);
        setTimeout(initializeMap, 100);
        return;
      }

      console.log('OldMap: Creating Google Map instance...');
      console.log('OldMap: Container element:', {
        element: mapRef.current,
        offsetWidth: mapRef.current.offsetWidth,
        offsetHeight: mapRef.current.offsetHeight,
        clientWidth: mapRef.current.clientWidth,
        clientHeight: mapRef.current.clientHeight,
        scrollWidth: mapRef.current.scrollWidth,
        scrollHeight: mapRef.current.scrollHeight
      });
      
      try {
        // Verify Google Maps API is available
        if (!window.google || !window.google.maps) {
          console.error('OldMap: Google Maps API not available on window object');
          return;
        }

        console.log('OldMap: Google Maps API verified, available classes:', {
          Map: !!google.maps.Map,
          MapTypeId: !!google.maps.MapTypeId,
          Marker: !!google.maps.Marker,
          InfoWindow: !!google.maps.InfoWindow
        });

        // Check if MapTypeId is available
        if (!google.maps.MapTypeId) {
          console.error('OldMap: MapTypeId not available, retrying...');
          setTimeout(() => {
            if (mapRef.current && window.google?.maps?.MapTypeId) {
              initializeMap();
            }
          }, 500);
          return;
        }

        const center = { lat: 30.84, lng: 76.19 };
        const mapOptions = {
          center,
          zoom: 8,
          mapTypeId: google.maps.MapTypeId?.ROADMAP || 'roadmap',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ],
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        };

        console.log('OldMap: Creating map with options:', mapOptions);
        const newMap = new google.maps.Map(mapRef.current, mapOptions);

        // Verify map was created successfully
        if (newMap) {
          console.log('OldMap: Map instance created successfully', newMap);
          
          // Wait a bit for map to initialize
          setTimeout(() => {
            console.log('OldMap: Map center:', newMap.getCenter()?.toString());
            console.log('OldMap: Map zoom:', newMap.getZoom());
          }, 500);
          
          setMap(newMap);
        } else {
          console.error('OldMap: Map instance is null or undefined');
        }
      } catch (error) {
        console.error('OldMap: Error creating map:', error);
        if (error instanceof Error) {
          console.error('OldMap: Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      }
    };

    // Start initialization
    initializeMap();
  }, [mapLoaded]);

  // Add markers
  useEffect(() => {
    if (!map || !oltData?.data) return;

    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    oltData.data.forEach((olt: OLT) => {
      const marker = new google.maps.Marker({
        position: { lat: olt.latitude, lng: olt.longitude },
        map,
        title: olt.name,
        icon: {
          url: getMarkerIcon(olt.status),
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(olt)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);

      // Fetch address for this OLT
      getAddressFromCoordinates(olt.latitude, olt.longitude, olt._id);
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
    }
  }, [map, oltData]);

  // Center map on selected OLT
  useEffect(() => {
    if (map && selectedOLTId && oltData?.data) {
      const selectedOLT = oltData.data.find((olt: OLT) => olt._id === selectedOLTId);
      if (selectedOLT) {
        map.setCenter({ lat: selectedOLT.latitude, lng: selectedOLT.longitude });
        map.setZoom(12);
      }
    }
  }, [map, selectedOLTId, oltData]);

  const getMarkerIcon = (status: string) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (status) {
      case 'active': return baseUrl + 'green-dot.png';
      case 'inactive': return baseUrl + 'red-dot.png';
      case 'maintenance': return baseUrl + 'yellow-dot.png';
      case 'error': return baseUrl + 'red-dot.png';
      default: return baseUrl + 'blue-dot.png';
    }
  };

  const createInfoWindowContent = (olt: OLT) => {
    return `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          ${olt.name}
        </h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; font-family: monospace;">
          ${olt.oltId}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">
          <strong>IP:</strong> ${olt.oltIp}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">
          <strong>Status:</strong> <span style="color: ${getStatusColor(olt.status)}; font-weight: 600;">${olt.status}</span>
        </p>
        <div style="margin-top: 8px;">
          <button onclick="window.open('/admin/olt-management/${olt._id}', '_blank')" 
                  style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            View Details
          </button>
        </div>
      </div>
    `;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'inactive': return '#dc2626';
      case 'maintenance': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  const resetMapView = () => {
    if (map) {
      const center = { lat: 30.84, lng: 76.19 };
      map.setCenter(center);
      map.setZoom(8);
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'w-full h-full bg-gray-100 min-h-[calc(100vh-4rem)]'}`}>
      {oltLoading ? (
        <div className={`absolute inset-0 ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>Loading OLTs</h3>
            <p className={isFullscreen ? 'text-gray-300' : 'text-gray-500'}>Please wait while we fetch the data</p>
          </div>
        </div>
      ) : loadError ? (
        <div className={`absolute inset-0 ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-4"></div>
            <h3 className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>Failed to Load Map</h3>
            <p className={`mb-4 ${isFullscreen ? 'text-gray-300' : 'text-gray-500'}`}>Unable to load Google Maps API</p>
            <div className={`text-xs mb-4 ${isFullscreen ? 'text-gray-400' : 'text-gray-400'}`}>
              <p>Possible issues:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Invalid API key</li>
                <li>Network connectivity issues</li>
                <li>API quota exceeded</li>
                <li>Domain restrictions</li>
              </ul>
            </div>
            <Button 
              onClick={() => {
                setRetryCount(0);
                setLoadError(false);
                setMapLoaded(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry Loading Map
            </Button>
          </div>
        </div>
      ) : !mapLoaded ? (
        <div className={`absolute inset-0 ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>Loading Google Maps</h3>
            <p className={isFullscreen ? 'text-gray-300' : 'text-gray-500'}>Please wait while we initialize the map</p>
            <p className={`text-xs mt-2 ${isFullscreen ? 'text-gray-400' : 'text-gray-400'}`}>This may take a few seconds...</p>
            <div className={`mt-4 text-xs ${isFullscreen ? 'text-gray-400' : 'text-gray-400'}`}>
              <p>If the map doesn't load, please check:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Internet connection</li>
                <li>Google Maps API key validity</li>
                <li>Browser console for errors</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-full" />
          
          {!map && (
            <div className={`absolute inset-0 ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>Initializing Map</h3>
                <p className={isFullscreen ? 'text-gray-300' : 'text-gray-500'}>Setting up the map interface...</p>
              </div>
            </div>
          )}
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {onToggleFullscreen && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 shadow-lg"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 shadow-lg"
              onClick={resetMapView}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">Map Legend</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Maintenance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back to OLT Management Button */}
          <div className="absolute top-4 left-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 shadow-lg"
              onClick={() => navigate('/olt-management')}
            >
              ← Back to OLT Management
            </Button>
          </div>

          {/* Map Info Panel */}
          {oltData?.data && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">OLT Summary</div>
              <div className="text-xs text-gray-600">
                <div>Total OLTs: <span className="font-medium">{oltData.data.length}</span></div>
                <div>Active: <span className="font-medium text-green-600">{oltData.data.filter((olt: OLT) => olt.status === 'active').length}</span></div>
                <div>Inactive: <span className="font-medium text-red-600">{oltData.data.filter((olt: OLT) => olt.status === 'inactive').length}</span></div>
                <div>Maintenance: <span className="font-medium text-yellow-600">{oltData.data.filter((olt: OLT) => olt.status === 'maintenance').length}</span></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
