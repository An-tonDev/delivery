//lagos
var map=L.map('map').setView([6.5244,3.3792],13)
L.tileLayer('https://{s}tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker= L.marker([6.5244,3.3792]).addTo(map)
marker.bindpopup("we are in lagos").openPopup()

//take the existing pin and move it to this location
marker.setLatLng([6.5280,3.3800])

//center map on a new location
map.panTo([6.5280,3.3800])

//draw lines between destination
const route=L.polyLines([
    [6.5244,3.3792],
    [6.5280,3.300]
],{color:'blue'}).addTo(map)

function simulateRiderMovement(startCoords, endCoords, riderMarker, map) {
    // 1. Set up simulation parameters
    const totalSteps = 100; // How many animation frames
    const stepDuration = 100; // Milliseconds between updates
    let currentStep = 0;
    
    // 2. Calculate how much to move each step
    const latStep = (endCoords[0] - startCoords[0]) / totalSteps;
    const lngStep = (endCoords[1] - startCoords[1]) / totalSteps;
    
    // 3. Start the animation loop
    const animationInterval = setInterval(() => {
        currentStep++;
        
        // Move the rider one step
        const hasArrived = moveRiderStepByStep(
            startCoords, 
            latStep, 
            lngStep, 
            currentStep, 
            riderMarker, 
            map, 
            endCoords,
            totalSteps
        );
        
        // Check if rider reached destination
        if (hasArrived || currentStep >= totalSteps) {
            clearInterval(animationInterval); // Stop the animation
            console.log("🎉 Delivery completed!");
        }
    }, stepDuration);
}
function moveRiderStepByStep(
    startCoords, 
    latStep, 
    lngStep, 
    currentStep, 
    riderMarker, 
    map, 
    endCoords,
    totalSteps
) {
    // 1. Calculate new position for this step
    const newLat = startCoords[0] + (latStep * currentStep);
    const newLng = startCoords[1] + (lngStep * currentStep);
    
    // 2. Update the marker position
    riderMarker.setLatLng([newLat, newLng]);
    
    // 3. Optional: Smoothly center map on rider (every 10 steps)
    if (currentStep % 10 === 0) {
        map.panTo([newLat, newLng]);
    }
    
    // 4. Calculate progress percentage
    const progress = (currentStep / totalSteps) * 100;
    console.log(`🚴 Rider progress: ${progress.toFixed(1)}%`);
    
    // 5. Check if rider has arrived (or very close)
    const distanceToDestination = calculateDistance(
        newLat, newLng, 
        endCoords[0], endCoords[1]
    );
    
    // 6. Return true if arrived, false if still moving
    return distanceToDestination < 0.001; // Within ~100 meters
}