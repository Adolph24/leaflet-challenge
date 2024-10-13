// Get the GeoJSON
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Initialize the map, focusing on the United States
var map = L.map('map').setView([37.8, -96], 4); // Centered on the USA

// Add a tile layer (OpenStreetMap base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 20,
}).addTo(map);

// Function to determine marker color based on depth
function getColor(depth) {
  return depth > 500 ? '#800026' :
         depth > 300 ? '#BD0026' :
         depth > 100 ? '#E31A1C' :
         depth > 50  ? '#FC4E2A' :
         depth > 20  ? '#FD8D3C' :
         depth > 10  ? '#FEB24C' :
                       '#FFEDA0';
}

// Function to determine marker size based on magnitude
function getSize(magnitude) {
  return magnitude > 5 ? magnitude * 4 :
         magnitude > 3 ? magnitude * 3 :
         magnitude > 1 ? magnitude * 2 :
                         magnitude * 1;
}

// Fetch the GeoJSON data from the USGS link
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Filter to include only earthquakes within the USA (based on latitude/longitude)
    var usEarthquakes = data.features.filter(function (feature) {
      var coords = feature.geometry.coordinates;
      var lat = coords[1];
      var lng = coords[0];
      // Rough bounding box for the contiguous US (excluding Alaska, Hawaii, etc.)
      return lng >= -125 && lng <= -66 && lat >= 24 && lat <= 50;
    });

    // Add filtered GeoJSON layer to the map
    L.geoJSON(usEarthquakes, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getSize(feature.properties.mag), // Set marker size by magnitude
          fillColor: getColor(feature.geometry.coordinates[2]), // Set color by depth
          color: "#000",
          weight: 2,
          opacity: 2,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br>
                         <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                         <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
                         <strong>Time:</strong> ${new Date(feature.properties.time).toLocaleString()}`);
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error fetching GeoJSON:', error));

// Add a legend to the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      depths = [0, 10, 20, 50, 100, 300, 500],
      labels = [];

  // Loop through depth intervals to generate labels with colored squares
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
  }

  return div;
};

legend.addTo(map);
