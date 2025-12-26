console.log("js file loaded")
let map;
let customerLocation=null;
let riderLocation=null;
let destination=null;
let customerMarker=null
let destinationMarker=null
let riderMarker=null

const socket= io('http://localhost:32000')

socket.on('connect', ()=>{

console.log("connected to the rt tracking server")
    
console.log('socket connected?', socket.connected)


socket.emit('test', { message: 'Hello from frontend!' })

})

socket.on('disconnect', ()=>{
    console.log('disconnected from the rt tracking server')
})

function initMap() {
    try{
  map = L.map('map').setView([6.626498, 3.356744], 13);

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      subdomains: 'abcd',
      maxZoom: 19
    }
  ).addTo(map);

  console.log("Map initialized successfully");
}catch(error){
      console.error('there is an error initalizing map',error)
    showMessage("error cannot initialize map")
}}



function showMessage(message){
     const statusDiv=document.getElementById('locationStatus')
     statusDiv.innerHTML=message
     statusDiv.style.color= message.startsWith('error') ? 'red' :'grey'
}

function handleError(error){
    switch(error.code){
        case error.PERMISSION_DENIED: showMessage("error access to location not granted")
        break;
        case error.POSITION_UNAVAILABLE: showMessage("error location is not available")
        break;
        case error.TIMEOUT: showMessage("error request took too long")
        break;
         default:
            showMessage("error an unexpected error occured")
    }
}

async function fetchRiderData(riderId){
    try{
      const response = await fetch(
  `http://localhost:32000/api/v1/users/rider-location/${riderId}`
);

        const riderLo = await response.json();
        console.log("Rider location data:", riderLo);

    console.log("sucessfully gotten location data of rider")

   if (riderLo) {
            return {
                lat: riderLo.lat,
                lng: riderLo.lng
            };
        }

}catch(error){
    console.error("unable to get rider location",error)
    return null
}
}


async function convertAddressToCoordinates(address){
    try{
        const response= await fetch(
            `http://localhost:32000/api/v1/orders/geocode?address=${encodeURIComponent(address)}`
        )
         return await response.json()
         
    }catch(error){
        console.error("unable to get the destination coords",error)
    }
}

async function Delivery(order){
     console.log("Processing delivery for order:", order);
    
    const riderId=order.rider

    destination= await convertAddressToCoordinates(order.destination)

    if(!destination){
        showMessage('destination not available')
        return
     }

     riderLocation= await fetchRiderData(riderId)

     if(!riderLocation){
        showMessage('rider location not available')
        return
     }


    if(riderMarker)map.removeLayer(riderMarker)

    if(destinationMarker)map.removeLayer(destinationMarker)

     riderMarker=L.marker(
        [riderLocation.lat,riderLocation.lng]
    ).addTo(map).bindPopup("i am the rider")

     destinationMarker=L.marker(
        [destination.lat,destination.lng]
    ).addTo(map).bindPopup("destination "+order.destination)

    if(customerMarker && destinationMarker){
        L.polyline([
            customerMarker.getLatLng(),
            destinationMarker.getLatLng()
        ],{color:"blue",weight:3}).addTo(map)
    }
      
   const bounds= L.latLngBounds([])
    if(customerMarker) bounds.extend(customerMarker.getLatLng())
    if(riderMarker) bounds.extend(riderMarker.getLatLng())
    if(destinationMarker) bounds.extend(destinationMarker.getLatLng())
        map.fitBounds(bounds)

        console.log("showing delivery")
}




document.getElementById('placeOrder').addEventListener('click',function(){
    document.getElementById('placeOrder').style.display='none'
    document.getElementById('orderForm').style.display='block'
})

document.getElementById('submitOrder').addEventListener('click', async function() {
    // Get form data
    const orderData = {
        name: document.getElementById('orderName').value,
        recipientPhoneNo: document.getElementById('recipientPhone').value,
        destination: document.getElementById('deliveryAddress').value,
        transportPIN: document.getElementById('pickupPin').value,
    };
    
    // Validate form
    if (!orderData.destination || !orderData.name) {
        showMessage("error: Please fill in all required fields");
        return;
    }
    
    document.getElementById('orderForm').style.display = 'none';
    document.getElementById('mapContainer').style.display = 'block';
    
 if(!map){
    initMap();
 }
    
    if (!navigator.geolocation) {
        showMessage("error: Browser does not support location which is needed to make an order");
        return;
    }
    
    // Get customer location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            customerLocation = [coordinates.lat, coordinates.lng];
            
            // Create/update customer marker
            if (customerMarker) {
                map.removeLayer(customerMarker);
            }
            customerMarker = L.marker(customerLocation)
                .addTo(map)
                .bindPopup('Your location')
                .openPopup();
            
            // Center map on customer
            map.setView(customerLocation, 15);
            
            showMessage("Creating your order...");
            
            // Create the order
            try {
                const requestData = {
                    senderLocation: {
                        type: "Point",
                        coordinates: [
                            customerLocation[1], // Longitude (lng)
                            customerLocation[0]  // Latitude (lat)
                        ]
                    },
                    ...orderData
                };
                
                console.log("Sending order data:", requestData);
                
                const response = await fetch('http://localhost:32000/api/v1/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
                
                const result = await response.json();
                console.log("Order creation response:", result);
                
                if (response.ok) {
                    showMessage('Order created! Assigning rider...');
                    // Call Delivery function with the created order
                    Delivery(result.data.order);
                } else {
                    showMessage('error: ' + (result.message || 'Failed to create order'));
                }
                
            } catch(error) {
                console.error("Order creation error:", error);
                showMessage("error: Unable to place order - " + error.message);
            }
        },
        handleError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge:10000
        }
    );
});

// Initialize map view on load
if (map) {
    console.log("Map initialized successfully");
}











