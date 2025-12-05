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

module.exports={}