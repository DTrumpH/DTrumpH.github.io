import { pointsCollection } from "/js/Points.js"

export function turfFunctions(map) {
  console.log('Turf module loaded successfully')

  const pointCoords = [26.71552, 58.37393]
  const myPoint = turf.point(pointCoords)
  L.geoJSON(myPoint).addTo(map)

  const lineCoords = [
    [26.71379, 58.37476], [26.71554, 58.37349], [26.71553, 58.37434],
    [26.71630, 58.37378], [26.71473, 58.37407]
  ]
  const myLine = turf.lineString(lineCoords)
  L.geoJSON(myLine, {color: 'orange'}).addTo(map)

  const polygonCoords = [[
    [26.71355, 58.37468], [26.71404, 58.37430], [26.71433, 58.37429],
    [26.71550, 58.37345], [26.71660, 58.37388], [26.71615, 58.37420],
    [26.71589, 58.37431], [26.71552, 58.37461], [26.71521, 58.37496],
    [26.71480, 58.37481], [26.71449, 58.37502], [26.71355, 58.37468]
  ]]
  const myPolygon = turf.polygon(polygonCoords)
  L.geoJSON(myPolygon, {color: 'green', fillOpacity: 0.2}).addTo(map)
//distance
  const point2Coords = [26.71489, 58.37439] // Pond
  const myPoint2 = turf.point(point2Coords)
  
  const distance = turf.distance(myPoint, myPoint2, {units: 'meters'})
  const roundedDist = Math.round(distance * 100) / 100
  console.log(`Distance between Jakob Hurt and Pond: ${roundedDist} meters`)

  // area
  const area = turf.area(myPolygon)
  console.log(`Park Area: ${Math.round(area)} square meters`)

  // within poly
  const points = turf.points(pointsCollection)
  const pointsInPark = turf.pointsWithinPolygon(points, myPolygon)
  L.geoJSON(pointsInPark, {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, {radius: 4, color: 'purple'})
  }).addTo(map)

  // click for coords
  map.on('click', function(event) {
    console.log(`[${event.latlng.lng}, ${event.latlng.lat}]`)
  })
}