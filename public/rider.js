let riderLocation=null
let watchId=null
let socket=null
let destination=null

function connectToSocketServer(){
    socket=io('http://localhost:32000')

    socket.on('connect',()=>{
        console.log('rider connected')
    })
}

function watchPosition(orderId,riderId){

     if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    
    watchId= navigator.geolocation.watchPosition((position)=>{

        const newLocation=[position.coords.latitude,position.coords.longitude]

        updateRiderPosition(newLocation)

               if (socket && socket.connected){
                socket.emit('rider_location_update',{
                    orderId,
                    riderId,
                    location: newLocation,
                    timestamp: new Date()

                })
               }

            if(destination){
                const dist=calculateRealDistance(...newLocation, ...destination)
                showMessage(`${dist.toFixed(2)}km away from destination`)
            }
    },handleError,{
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:2000
    })

}

function updateRiderPosition(coords){
    if(!riderLocation){
        riderLocation=coords
    }else{
    riderLocation[0]= coords[0],
    riderLocation[1]=coords[1]
    }


}

function stopTracking(){
    if(watchId){
        navigator.geolocation.clearWatch(watchId)
    }
    showMessage("no longer tracking rider")
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

function showMessage(message){
     const statusDiv=document.getElementById('locationStatus')
     statusDiv.innerHTML=message
     statusDiv.style.color= message.startsWith('error') ? 'red' :'grey'
}

function simulateRiderMovement(startcoords,endcoords, map, riderMarker,orderId,riderId){
    const totalSteps=100
    const stepDuration=100
    let currentStep=0

    const latStep=(endcoords[0]-startcoords[0])/totalSteps
    const lngStep=(endcoords[1]-startcoords[1])/totalSteps

    const animationInterval= setInterval(()=>{
            currentStep++

    const hasArrived= moveRiderStepByStep(
        startcoords,
        endcoords,
        riderMarker,
        map,
        latStep,
        lngStep,
        currentStep,
        totalSteps,
        orderId,
        riderId
    )

    if(hasArrived || currentStep>=totalSteps){
        clearInterval(animationInterval)
        console.log("delivery completed")

        if(socket){
            socket.emit('delivery_completed',{orderId,riderId})
        }
    }
        
    },stepDuration)


}


function moveRiderStepByStep(startcoords,endcoords,riderMarker,map,latStep,
lngStep,currentStep,totalSteps, orderId,riderId){

    const newLat= startcoords[0]+(latStep*currentStep)
    const newLng= startcoords[1]+(lngStep*currentStep)

    riderMarker.setLatLng([newLat,newLng])

     if (socket && socket.connected){
                socket.emit('rider_location_update',{
                    orderId,
                    riderId,
                    location: [newLat,newLng],
                    timestamp: new Date()

                })
               }

    const progress= (currentStep/totalSteps) * 100
    console.log(`rider progress: ${progress.toFixed(1)}% `)

    if(currentStep %10 === 0){
        map.panTo([newLat,newLng])
    }

    const distanceToDestination= calculateRealDistance(newLat,newLng,endcoords[0],endcoords[1])


    return distanceToDestination < 0.001
     
}
