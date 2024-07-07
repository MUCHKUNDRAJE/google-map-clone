const socket = io(); // Ensure your server supports Socket.io
const map = L.map("map", {
    zoomControl: false
}).setView([21.137029, 79.128739], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Google Map mimic"
}).addTo(map);

const redIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png', // Red marker icon URL
    iconSize: [25, 25], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

// Create a fixed marker with the specified red icon
let fixedMarker = L.marker([21.137029, 79.128739], { icon: redIcon }).addTo(map);
fixedMarker.bindPopup("<b>Your Location</b>").openPopup();

// Add only the custom zoom control to the map, positioning it in the bottom right corner
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var geocoder = L.Control.geocoder({
    position: 'topleft', // Change this to 'topright', 'bottomleft', or 'bottomright' as needed
    defaultMarkGeocode: false,
    collapsed: false,
    placeholder: "Search Your Location...."
}).on('markgeocode', function (e) {
    var latlng = e.geocode.center;
    map.setView(latlng, 14);
    addMarker(latlng, e.geocode.name);
}).addTo(map);

var currentlocation = document.querySelector("#location");

currentlocation.addEventListener("click", function () {
    map.setView([21.137029, 79.128739], 17);
});

var routingControl = L.Routing.control({
    position: 'bottomleft', // Change this to 'topleft', 'topright', or 'bottomleft' as needed
    waypoints: [],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

// Array to store dynamic markers
var dynamicMarkers = [];

// Function to add markers
function addMarker(latlng, popupText) {
    // If there are already two dynamic markers, remove the oldest one
    if (dynamicMarkers.length === 2) {
        var oldestMarker = dynamicMarkers.shift();
        map.removeLayer(oldestMarker);
    }

    // Create a new marker and add it to the map
    var marker = L.marker(latlng).addTo(map).bindPopup(popupText).openPopup();

    // Add popupclose event listener to the marker's popup
    marker.on('popupclose', function () {
        map.removeLayer(marker);
        // Remove marker from the array
        dynamicMarkers = dynamicMarkers.filter(m => m !== marker);
        updateRoutingControl();
    });

    // Add the new marker to the array
    dynamicMarkers.push(marker);

    // Update routing control waypoints
    updateRoutingControl();
}

// Function to reverse geocode coordinates to an address
function reverseGeocode(latlng, callback) {
    geocoder.options.geocoder.reverse(latlng, map.options.crs.scale(map.getZoom()), function (results) {
        var r = results[0];
        if (r) {
            callback(r.name);
        }
    });
}

// Function to update routing control waypoints
function updateRoutingControl() {
    var waypoints = [fixedMarker.getLatLng()];
    dynamicMarkers.forEach(m => waypoints.push(m.getLatLng()));
    routingControl.setWaypoints(waypoints);

    // Ensure the fixed marker always has the red icon
    fixedMarker.setIcon(redIcon);

    // Log the name of the destination if there are waypoints
    if (routingControl.getWaypoints().length > 1) {
        const lastWaypoint = routingControl.getWaypoints()[routingControl.getWaypoints().length - 1].latLng;
        if (lastWaypoint) {
            // reverseGeocode(lastWaypoint, function(name) {
            //     var element = document.querySelector("#from span")
            //     element.innerHTML=<p> ${name} </p>
            //     console.log("Destination name:", name);
            // });
        }
    }

    // Update the panel content with start and end addresses
    // updatePanelContent();
}

// Function to update panel content with start and end addresses
// function updatePanelContent() {
//     const fromElement = document.querySelector('#from h5');
//     const toElement = document.querySelector('#to #toAddress');

//     if (routingControl.getWaypoints().length > 1) {
//         const fromAddress = routingControl.getWaypoints()[0].name || 'Your Location';
//         const toAddress = routingControl.getWaypoints()[1].name || 'Destination';
        
//         fromElement.innerHTML = From <i class="ri-arrow-right-double-fill"></i> ${fromAddress};
//         toElement.innerHTML = ${toAddress};
//     }
// }

// Add a click event listener to the map
map.on('click', function (e) {
    var latlng = e.latlng;
    reverseGeocode(latlng, function(name) {
        addMarker(latlng, name);
    });
});

// Add an event listener for the routesfound event to get all route details
routingControl.on('routesfound', function (e) {
    var routes = e.routes;
    var distances = (routes[0].summary.totalDistance).toFixed(3);
    const fromElement = document.querySelector('#distances h1');
    if(distances > 1000) {
        fromElement.innerHTML =` ${(distances/1000).toFixed(2)}km` ;
    } else {
        fromElement.innerHTML = `${(distances)}m` ;
    }

    // Ensure the fixed marker always has the red icon
    fixedMarker.setIcon(redIcon);

    // Log the destination name
    const waypoints = routingControl.getWaypoints();
    if (waypoints.length > 1) {
        const lastWaypoint = waypoints[waypoints.length - 1].latLng;
        if (lastWaypoint) {
            reverseGeocode(lastWaypoint, function(name) {
                var element = document.querySelector("#toAddress")
                  element.innerHTML = name;
            });
        }
    }
});

var geocodersElement = document.querySelector('.leaflet-routing-geocoders');

// Check if the element exists
if (geocodersElement) {
    // Create the h1 element
    var h1 = document.createElement('h1');

    // Set the content of the h1 element including HTML for <i> tag
    h1.innerHTML = 'Navigation<i class="ri-arrow-right-double-fill"></i>';

    // Insert the h1 element as the first child of .leaflet-routing-geocoders
    var firstChild = geocodersElement.firstChild;
    geocodersElement.insertBefore(h1, firstChild);
} else {
    console.error('Element with class .leaflet-routing-geocoders not found.');
}

var tl = gsap.timeline();

tl.to("#loader",{
        opacity:0,
       delay:4,
},"anime")
tl.to("#loader",{
    display:"none",
    delay:4,
},"anime")
tl.from(" #map",{
    scale:0, 
    duration:0.5,
    ease:"power3",
},"a")
tl.from("#panel",{
    scale:0, 
    duration:0.5,
    ease:"power3",
},"a")
tl.from("#location",{
    scale:0, 
    duration:0.5,
    ease:"power3",
},"a")
tl.from(" .leaflet-control-geocoder",{
    scale:0, 
    duration:0.5,
    ease:"power3",
},"a")
