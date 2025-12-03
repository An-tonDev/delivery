
let map;
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
             const customerLocation=[cusCoordinates.lat,cusCoordinates.lng]

           const customerMarker=L.marker(customerLocation)
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
    let watchId;

    navigator.geolocation.watchPosition((position)=>{
            updateRiderPosition(position.coords)
    },handleError,{
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:2000
    })

    const distance=calRemainDistance(riderLocation,destination)
}

function updateRiderPosition(coords){
    riderLocation[0]= coords.latitude,
    riderLocation[1]=coords.longitude
}

function stopTracking(){
    if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    showMessage("no longer tracking user")
}

function calRemainDistance(riderLocation,destination){
   const  rlat=riderLocation[0]-destination[0]
   const   rlang=riderLocation[1]-destination[1]

   return Math.sqrt((rlang*rlang)+(rlat*rlat))

}


let customerLocation=[];
const riderLocation=[6.6578,3.3567]

const riderMarker=L.marker(riderLocation).addTo(map).bindPopup('this is the rider')

const destination=[6.9546,3.7543]

const destinationMarker=L.marker(destination).addTo(map).bindPopup('destination')

const route=L.polyline([
    customerLocation,
    destination
],{color:'blue'}
).addTo(map)





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