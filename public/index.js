var map=L.map('map').setView([51.505,-0.09],13)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker= L.marker([51.505,-0.09]).addTo(map)
var circle=L.circle([51.505,-0.11],{
    color:'red',
    fillColour:'#f03',
    fillOpacity:0.5,
     radius:400,
      
}).addTo(map)
marker.bindpopup("<b>hello world<b><br>I am a stand alone pop up").openPopup()
circle.bindpopup("i am a circle")