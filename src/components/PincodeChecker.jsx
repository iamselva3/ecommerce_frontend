import React, { useEffect, useState } from 'react';
import { MapPin, Search, X, Loader, CheckCircle, XCircle, Truck, Map, Navigation } from 'lucide-react';
import { toast } from 'react-toastify';

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = import.meta.env.VITE_API_URL;

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
  zIndex: 1
};

const defaultCenter = [20.5937, 78.9629]; // Default to India center [lat, lng]

// Component for handling map clicks
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setPosition([position.lat, position.lng]);
        }
      }}
    />
  ) : null;
}

const PincodeChecker = ({ onPincodeValidated, selectedPincode, onPincodeChange }) => {
  const [pincode, setPincode] = useState(selectedPincode || '');
  console.log("suiauid", pincode);
  const [checking, setChecking] = useState(false);
  const [pincodeData, setPincodeData] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (selectedPincode) {
      setPincode(selectedPincode);
    }
  }, [selectedPincode]);

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setChecking(true);
    setPincodeData(null);

    try {
      const response = await fetch(`${API_URL}/api/pincode/check/${pincode}`);
      const data = await response.json();

      if (data.success) {
        setPincodeData(data.data);
        if (onPincodeValidated) {
          onPincodeValidated(data.data);
        }
        
        // Show toast based on deliverability
        if (data.data.isDeliverable) {
          // toast.success(` Deliverable to ${data.data.city}, ${data.data.state}`);
        } else {
          toast.error(` Not deliverable to ${pincode}`);
        }
      } else {
        toast.error(data.message || 'Invalid pincode');
      }
    } catch (error) {
      console.error('Pincode check error:', error);
      toast.error('Failed to check pincode. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setShowMapModal(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        await getPincodeFromCoordinates(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please select on map manually.');
        setLocationLoading(false);
      }
    );
  };

  const handleOpenMapSelection = () => {
    setSelectedLocation(null);
    setMapCenter(defaultCenter);
    setShowMapModal(true);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    setLocationLoading(true);
    await getPincodeFromCoordinates(selectedLocation[0], selectedLocation[1]);
    setLocationLoading(false);
    setShowMapModal(false);
  };

  // Update when location is confirmed
  const getPincodeFromCoordinates = async (lat, lng) => {
    setChecking(true);
    
    try {
      const response = await fetch(
        `${API_URL}/api/pincode/location?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();

      if (data.success) {
        const newPincode = data.data.pincode || selectedPincode;
        setPincode(newPincode);
        
        // Update parent's address pincode
        if (onPincodeChange) {
          onPincodeChange(newPincode);
        }
        
        setPincodeData(data.data);
        if (onPincodeValidated) {
          onPincodeValidated(data.data);
        }
        
        // Show toast based on deliverability
        if (data.data.isDeliverable) {
          toast.success(`Deliverable to ${data.data.city}, ${data.data.state}`);
        } else {
          toast.warning(` Currently not deliverable to ${data.data.pincode}`);
        }
      } else {
        toast.error('Could not determine your location');
      }
    } catch (error) {
      console.error('Location check error:', error);
      toast.error('Failed to get location details');
    } finally {
      setChecking(false);
    }
  };

  const handleClearPincode = () => {
    setPincode('');
    if (onPincodeChange) {
      onPincodeChange('');
    }
    setPincodeData(null);
  };

  const handlePincodeInput = (e) => {
    const newPincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(newPincode);
    
    // Update parent's address pincode
    if (onPincodeChange) {
      onPincodeChange(newPincode);
    }
    
    // Clear validation data when user types
    setPincodeData(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Truck size={20} className="text-blue-600" />
        Check Delivery Availability
      </h3>

      {/* Pincode Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeInput}
            placeholder="Enter pincode"
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength="6"
            disabled={checking}
          />
          <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
          {pincode && (
            <button
              onClick={handleClearPincode}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={handleCheckPincode}
          disabled={checking || pincode.length !== 6}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {checking ? (
            <>
              <Loader size={18} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search size={18} />
              Check
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout for Location Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Use My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={locationLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {locationLoading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} className="text-blue-600" />
          )}
          <span className="text-sm">My Location</span>
        </button>

        {/* Select on Map Button */}
        <button
          onClick={handleOpenMapSelection}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Map size={18} className="text-green-600" />
          <span className="text-sm">Select on Map</span>
        </button>
      </div>

      {/* Pincode Result */}
      {pincodeData && (
        <div className={`p-4 rounded-lg ${
          pincodeData.isDeliverable 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {pincodeData.isDeliverable ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              <p className={`font-semibold ${
                pincodeData.isDeliverable ? 'text-green-800' : 'text-red-800'
              }`}>
                {pincodeData.isDeliverable ? '✓ Deliverable' : '✗ Not Deliverable'}
              </p>
              
              {pincodeData.isDeliverable ? (
                <>
                  <p className="text-sm text-gray-600 mt-1">
                    {pincodeData.city}, {pincodeData.state} - {pincodeData.pincode}
                  </p>
                  
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{pincodeData.deliveryDays} days</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash on Delivery:</span>
                      <span className={`font-medium ${
                        pincodeData.codAvailable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pincodeData.codAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    
                    {pincodeData.expressDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Express Delivery:</span>
                        <span className="font-medium text-blue-600">
                          {pincodeData.expressDeliveryDays} day
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pickup Stores if available */}
                  {pincodeData.pickupStores?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Available Pickup Points:
                      </p>
                      {pincodeData.pickupStores.map((store, idx) => (
                        <div key={idx} className="text-xs text-gray-600 mb-2">
                          <p className="font-medium">{store.storeName}</p>
                          <p>{store.storeAddress}</p>
                          {store.distance && (
                            <p className="text-green-600">{store.distance} km away</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-600 mt-1">
                  We currently do not deliver to this location.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Modal with Leaflet */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Your Delivery Location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Click on the map to select your exact location. You can also drag the marker to adjust.
              </p>
            </div>

            {/* Leaflet Map */}
            <div style={mapContainerStyle} className="border border-gray-200 overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                  position={selectedLocation} 
                  setPosition={setSelectedLocation} 
                />
              </MapContainer>
            </div>

            {/* Selected Location Info */}
            {selectedLocation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Selected Location:
                </p>
                <p className="text-xs text-blue-600">
                  Lat: {selectedLocation[0].toFixed(6)}, Lng: {selectedLocation[1].toFixed(6)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowMapModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation || locationLoading}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {locationLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    Confirm Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;