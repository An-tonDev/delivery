let riderLocation=null
let watchId=null

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

function simulateRiderMovement(startcoords,endcoords, map, riderMarker){
    const totalSteps=100
    const stepDuration=100
    let currentStep=0

    const latStep=(endcoords[0]-startcoords[0])/totalSteps
    const lngStep=(endcoords[1]-startcoords[0])/totalSteps

    const animationInterval= setInterval(()=>{

    const hasArrived= moveRiderStepByStep(
        startcoords,
        endcoords,
        riderMarker,
        map,
        latStep,
        lngStep,
        currentStep,
        totalSteps
    )

    if(hasArrived || currentStep>=totalSteps){
        clearInterval(animationInterval)
        console.log("delivery completed")
    }
        
    },stepDuration)


}


function moveRiderStepByStep(startcoords,endcoords,riderMarker,map,latStep,lngStep,currentStep,totalSteps){

    const newLat= startcoords[0]+(latStep*currentStep)
    const newLng= startcoords[1]+(lngStep*currentStep)

    riderMarker.setView(newLat,newLng)

    const progress= (currentStep/totalSteps) * 100
    
    if(currentStep %10 === 0){
        map.panTo(newLat,newLng)
    }

    const distanceToDestination= calculateRealDistance(newLat,newLng,endcoords[0],endcoords[1])


    return distanceToDestination < 0.001
     
}
module.exports={}