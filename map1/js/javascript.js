let map = L.map('map').setView([58.373523, 26.716045], 12)

const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

CartoDB_Voyager.addTo(map)

// add geoJSON polygons layer
async function addDistrictsGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const polygons = L.geoJson(data, {
    onEachFeature: popUPinfo,
    style: polygonStyle,
  })
  polygons.addTo(map)
}
addDistrictsGeoJson('geojson/tartu_city_districts_edu.geojson')

// add popup to each feature
function popUPinfo(feature, layer) {
  layer.bindPopup(feature.properties.NIMI)
}

// get color from feature property
function getColor(property) {
  switch (property) {
    case 1:
      return '#ff0000'
    case 13:
      return '#009933'
    case 6:
      return '#0000ff'
    case 7:
      return '#ff0066'
    default:
      return '#ffffff'
  }
}

// polygon style
function polygonStyle(feature) {
  return {
    fillColor: getColor(feature.properties.OBJECTID),
    fillOpacity: 0.5,
    weight: 1,
    opacity: 1,
    color: 'grey',
  }
}
// func for cell tower json addition
async function addCelltowersGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const circles = L.geoJson(data, {
    pointToLayer: createCircle,
  })
  circles.addTo(map)
}

function createCircle(feature, latlng) {
  let options = {
    radius: 5,
    fillColor: 'red',
    fillOpacity: 0.5,
    color: 'red',
    weight: 1,
    opacity: 1,
  }
  return L.circleMarker(latlng, options)
}