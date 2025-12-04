
let map;
let watchId=null;
let customerLocation=null;
let riderLocation=null;
let destination=null;
let customerMarker=null
let destinationMarker=null
let riderMarker=null

try{
 map=L.map('map').setView([6.626498,3.356744],13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

}
catch(error){

    console.error('there is an error initalizing map',error)
    showMessage("error cannot initialize map")
}

function showMessage(message){

     const statusDiv=document.getElementById('locationStatus')
     statusDiv.innerHTML=message
     statusDiv.style.color= message.startsWith('error') ? 'red' :'grey'
}

function getUserCurrentLocation(){
    if(!navigator.geolocation){
      showMessage('error browser does not support location')
      return
    }

    if(!map){
        showMessage('error map was not initialized')
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position)=>{
            const cusCoordinates={
                lat:position.coords.latitude,
                lng:position.coords.longitude,
                accuracy: position.coords.accuracy
            }
            console.log('coordinates:',cusCoordinates)
            map.eachLayer((layer)=>{
                if(layer instanceof L.Marker){
                    map.removeLayer(layer)
                }
            })
            customerLocation=[cusCoordinates.lat,cusCoordinates.lng]

          customerMarker=L.marker(customerLocation)
           .addTo(map).
           bindPopup('this is the customer location')
           .openPopup()

           map.setView(customerLocation, 15);
            
        }, handleError,{
            enableHighAccuracy:true,
            timeout:100000,
            maximumAge:7000
        }
    )
    
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

function watchPosition(){
     if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    watchId= navigator.geolocation.watchPosition((position)=>{
            updateRiderPosition(position.coords)
            if(destination){
                const dist=calculateRealDistance(riderLocation[0],riderLocation[1],
                    destination[0],destination[1]
                )
                showMessage(`${dist}km away from destination`)
            }
    },handleError,{
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:2000
    })

}

function updateRiderPosition(coords){
    if(!riderLocation){
        riderLocation=[coords.latitude,coords.longitude]
    }else{
    riderLocation[0]= coords.latitude,
    riderLocation[1]=coords.longitude
    }


}

function stopTracking(){
    if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    showMessage("no longer tracking user")
}

function calculateRealDistance(lat1, lng1, lat2, lng2) {
    // Earth's radius 
    const R = 6371;
    
    // Convert degrees to radians
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    // Haversine formula
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}


async function fetchOrderdata(orderId){
    try{
   const response= await fetch(`api/orders/${orderId}`)
   const order= await response.json()

   console.log("order data received",order)
   return order

}catch(error){
    console.error("unable to get data order",error)
    return null
}

}

async function fetchRiderData(riderId){
    try{
    const response= await fetch(`api/users/${riderId}`)
    const rider= await response.json()

    console.log("sucessfully gotten data of rider")

    return rider.location

}catch(error){
    console.error("unable to get rider location",error)
    return null
}
}

async function convertAddressToCoordinates(address){
    try{
        const response= await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
        )
         const results=response.json()

         if(results && results.length>0){
            return{
                lat: parseFloat(results[0].lat),
                lng: parseFloat(results[0].lon)
            }
         }
    }catch(error){
        console.error("unable to get the destination coords",error)
    }
}

async function Delivery(orderId){
    const order= await fetchOrderdata(orderId)

    if(!order){
        console.log("no order with this id exists")
    }

    const riderId=order.rider

    riderLocation= await fetchRiderData(riderId)

     destination= await convertAddressToCoordinates(order.destination)

    if(riderMarker)map.removeLayer(riderMarker)
    if(destinationMarker)map.removeLayer(destinationMarker)

     riderMarker=L.marker(
        [riderLocation.latitude,riderLocation.longitude]
    ).addTo(map).bindPopup("i am the rider")

     destinationMarker=L.marker(
        [destination.lat,destination.lng]
    ).addTo(map).bindPopup("this is the destination")

    if(customerMarker && destinationMarker){
        L.polyline([
            customerMarker,
            destinationMarker
        ],{color:"blue"}).addTo(map)
    }
      
   const bounds= L.latLngBounds([])
    if(customerMarker) bounds.extend(customerMarker.getLatLang())
    if(riderMarker) bounds.extend(riderMarker.getLatLang())
    if(destinationMarker) bounds.extend(destinationMarker.getLatLang())
        map.fitBounds(bounds)

        console.log("showing delivery")
}




document.getElementById('location').addEventListener('click',getUserCurrentLocation)
document.getElementById('trackLocation').addEventListener('click',watchPosition)
document.getElementById('stop').addEventListener('click', stopTracking)





















/* //lagos
var map=L.map('map').setView([6.5244,3.3792],13)
L.tileLayer('https://{s}tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


//take an existing pin and move it to this location
marker.setLatLng([6.5280,3.3800])

//center map on a new location
map.panTo([6.5280,3.3800])

// exercise: simulation of delivery exercise
function simulateRiderMovement(startcoords,endcoords,riderMarker,map){
    const totalSteps=100
    const stepDuration=100
    let currentStep=0

    const latStep=(endcoords[0]-startcoords[0])/totalSteps
    const langStep=(endcoords[1]-startcoords[1])/totalSteps

    const animationInterval= setInterval(()=>{
        currentStep++
        const hasArrived= moveRiderStepByStep(
            latStep,
            langStep,
            riderMarker,
            map,
            currentStep,
            totalSteps,
            startcoords,
            endcoords
          )
          if(hasArrived||currentStep>=totalSteps){
            clearInterval(animationInterval)
            console.log('rider has arrived at location')
          }
    },stepDuration)


}

//func to simulate rider
function  moveRiderStepByStep(latStep,langStep,riderMarker,map, currentStep,
totalSteps,startcoords,endcoords){

    //current location
      const newLat=startcoords[0]+(latStep*currentStep)
      const newLang=startcoords[1]+(langStep*currentStep)

            //rider marker
      riderMarker.setLatLng([newLat,newLang])

      if(currentStep%10 == 0){
        map.panTo(newLang,newLat)
      }

      //progress
      const progress=(currentStep/totalSteps)*100
      console.log(`rider progress is ${progress.toFixed(1)}%`)

      const riderDistanceToDest= calRemainDistance(newLat,newLang,endcoords[0],endcoords[1])

      return riderDistanceToDest<0.001
}

//calculating the remaining distance
function calRemainDistance(lat1,lang1,lat2,lang2){
    const rLat= lat2-lat1
    const rlang=lang2-lang1

    return Math.sqrt((rlang*rlang)+(rLat*rLat))

}

const customerMarker=L.marker([6.5244,3.3792])
.addTo(map)
.bindpopup('this is the customer')

const riderMarker=L.marker([6.5100,3.3690])
.addTo(map)
.bindpopup('rider')

const destination=L.marker([6.6280,3.4800])
.addTo(map)
.bindpopup('finish line')

const route=L.polyLine([
    [6.5244,3.3792],
    [6.6280,3.4800]
],{color:'blue'}).addTo(map)

document.getElementById('delivery').addEventListener('click',()=>{
    simulateRiderMovement([6.5244,3.3792],[6.6280,3.4800],riderMarker,map)
})






//exercise: get current location at intervals
function getUserLocation(){
    if(!navigator.geolocation){
        showMessage("this browser does not support location")
        return
    }

    navigator.geolocation.getCurrentPosition(
        (positon)=>{
            const coords={
                lat:positon.coords.latitude,
                lng:positon.coords.longitude,
                accuracy: positon.coords.accuracy
            }
            showMessage(`current position is at ${coords.lat},${coords.lng}`)
        },handleError,
        {
            enableHighAccuracy:true,
            timeout:10000,
            maximumAge:10000
        })
}

function handleError(error){
    switch(error.code){
        case error.PERMISSION_DENIED: showMessage("access to location not granted")
        break;
        case error.POSITION_UNAVAILABLE: showMessage("location is not available")
        break;
        case error.TIMEOUT: showMessage("request took too long")
        break;
         default:
            showMessage("an unexpected error occured")
    }
}

function showMessage(message){
    const statusDiv= document.getElementById('locationStatus')
    statusDiv.innerHTML=message
    statusDiv.style.color= 'red'
}

//get location at real time
let watchId;
function realTimeMonitor(){
 navigator.geolocation.watchPosition(
    (position)=>{
        updateRiderLocation(position.coords)
    },
    handleError,
    {
        enableHighAccuracy:true,
        timeout:5000,
        maximumAge:1500,
    }
 )}

 function updateRiderLocation(coords){
    const coordinates={
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy
    }
    showMessage(`current location: ${coordinates.lat},${coordinates.lng}`)
 }

 function stopTracking(){
    if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    showMessage("no longer tracking user")
    return;
 }



document.getElementById('location').addEventListener('click',getUserLocation())
document.getElementById('trackLocation').addEventListener('click',realTimeMonitor())
document.getElementById('stop').addEventListener('click',stopTracking()) */