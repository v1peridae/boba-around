import { useState, useRef, useEffect } from "react";

function App() {
  const [address, setAddress] = useState("");
  const [bobaCafe, setBobaCafe] = useState("");
  const mapRef = useRef(null);  
  const googleMapRef = useRef(null);
  const inputRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [AdvancedMarkerElement, setAdvancedMarkerElement] = useState(null);

  useEffect(() => {
    const initMap = () => {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        mapId: '67ee8a2828f6dd00',
      });
    };
    initMap();
  }, []);

  useEffect(() => {
    const loadMarkerLibrary = async () => {
      try {
        const { AdvancedMarkerElement: MarkerElement } = await google.maps.importLibrary("marker");
        setAdvancedMarkerElement(() => MarkerElement);
      } catch (error) {
        console.error("Error loading marker library:", error);
      }
    };
    loadMarkerLibrary();
  }, []);

  const handleSearch = async () => {
    if (!AdvancedMarkerElement) return;
    console.log("Current address state:", address);
    
    if (!address || !address.trim()) {
      console.log('Address is empty:', address);
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address.trim() }, async (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          console.log('Found location:', location.toJSON());
          
          googleMapRef.current.setCenter(location);
          
          markers.forEach(marker => marker.map = null);

          const service = new window.google.maps.places.PlacesService(googleMapRef.current);
          
          const request = {
            location: location,
            radius: 16093,
            keyword: 'boba',
            type: 'food', 
          };

          service.nearbySearch(request, (results, status) => {
            console.log('Places API Status:', status);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              console.log('Found places:', results);
              setBobaCafe(results);
              
              const newMarkers = results.map(place => {
                const pin = document.createElement("img");
                pin.src = "/boba.png";
                pin.width = 40;
                pin.height = 40;
                
                const marker = new AdvancedMarkerElement({
                  map: googleMapRef.current,
                  position: place.geometry.location,
                  title: place.name,
                  content: pin
                });

                marker.addListener('click', () => {
                  handleMarkerClick(place);
                });

                return marker;
              });
              
              setMarkers(newMarkers);
            } else {
              console.log('Places search failed:', status);
            }
          });
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkerClick = (place) => {
    const service = new window.google.maps.places.PlacesService(googleMapRef.current);
    service.getDetails({
      placeId: place.place_id,
      fields: ['name', 'formatted_phone_number', 'website', 'opening_hours', 'rating', 'user_ratings_total', 'vicinity', 'price_level'],
    }, (placeDetails, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
        setSelectedCafe(placeDetails);
        setIsInfoOpen(true);
      }
    });
  };

  return (
    <div className="bg-[#E59292] h-screen flex flex-col justify-center items-center">
      <h1 className="font-boba-cups text-[#4B3737] text-7xl mt-7">
        &lt; Boba Around &gt;
      </h1>
      <p className="font-boba-milky text-[#5A4646] text-2xl mt-5">
        Travelling to a new city and you dont know where to get boba?
      </p>
      <h2 className="font-boba-cups text-[#4B3737] text-4xl mt-5">
        Enter A Location To Find A Boba Cafe There
      </h2>
      <div className="relative w-1/2 mt-5">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Enter Location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="w-full p-4 rounded-full bg-[#8D5F5F] text-[#4B3737] font-boba-milky text-2xl placeholder:text-[#4B3737]/50 outline-none text-left pr-36 pl-10" 
        />
        <button 
          onClick={handleSearch} 
          className="text-2xl absolute right-[10px] top-1/2 -translate-y-1/2 px-7 py-2 bg-[#4B3737] text-[#8D5F5F] rounded-full font-boba-milky hover:bg-[#4B3737]/80 transition-all duration-300"
        >
          Boba?
        </button>
      </div>
      <div className="w-5/6 h-[400px] mt-10 flex gap-4">
        <div className={`outline-none rounded-3xl overflow-hidden shadow-lg border transition-all duration-300 ${isInfoOpen ? 'w-2/3' : 'w-full'}`}>
          <div ref={mapRef} className="w-full h-full"></div>
        </div>
        
        {isInfoOpen && selectedCafe && (
          <div className="w-1/4 bg-[#8D5F5F] rounded-3xl p-4 shadow-lg">
            <button 
              onClick={() => setIsInfoOpen(false)}
              className="float-right text-[#4B3737] font-bold text-2xl hover:text-[#E59292]"
            >
              ✕
            </button>
            <h3 className="font-boba-cups text-[#4B3737] text-2xl mb-4">{selectedCafe.name}</h3>
            <div className="font-boba-milky text-[#4B3737]">
              <p className="text-lg"><a className="font-boba-cups text-2xl">Rating:</a> {selectedCafe.rating} ⭐ ({selectedCafe.user_ratings_total} reviews)</p>
              {selectedCafe.opening_hours && (
                <>
                  
                  <div className="mt-2 text-lg">
                    <p className="font-boba-cups text-2xl">Today's Hours:</p>
                    <div className="ml-4 text-[#4B3737]">
                      {selectedCafe.opening_hours.weekday_text?.[
                        new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
                      ]}
                    </div>
                  </div>
                </>
              )}
              {selectedCafe.vicinity && (
                <p className="mt-2 text-lg"><a className="font-boba-cups text-2xl">Address</a><br />{"\t"}{selectedCafe.vicinity}</p>
              )}
              {selectedCafe.formatted_phone_number && (
                <p className="mt-2 text-lg"><a className="font-boba-cups text-2xl">Phone:</a> {selectedCafe.formatted_phone_number}</p>
              )}
              {selectedCafe.website && (
                <p className="font-boba-cups text-2xl mt-2 text-center">
                  <a 
                    href={selectedCafe.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#4B3737] underline"
                  >Website
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;