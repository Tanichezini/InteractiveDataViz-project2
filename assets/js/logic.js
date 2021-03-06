d3.json("http://127.0.0.1:5000/unemploymentData?start_date='banana'&end_date='orange'&state='New%20York'", returnData => {
  console.log("return", returnData)
});


// Creating map object
var myMap = L.map("map", {
  center: [39.8283, -98.5795],
  zoom: 3
});


// Adding tile layer
var streets = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY,
  }
);

var light = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY,
  }
);

var dark = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY,
  }
);

var baseMaps = {
  Streets: streets,
  Light: light,
  Dark: dark,
};

// Load in geojson data
var geoDataPath = "assets/data/US.geojson";
var geojson;

/**
 * Takes in geoJson object and appends data returned from the API to each states geoJSON entry
 * @param {geoJSON OBJECT} geoData The geoJson that is returned from d3.json when querying the geojson file attached
 * @param {*} apiReturn The return from the API
 */
function zipAPIDataToGeoJSON(geoData, apiReturn) {
  //Create array of states in the order that the apiReturn came back in
  apiDataStates = apiReturn.map((datum) => datum.state);

  geoData.features.forEach((geoDatum) => {
    // Lookup the corresponding entry from the API's data return with the most recent date that matches this entry by state
    apiDataIndex = apiDataStates.indexOf(geoDatum.properties.NAME);

    let newProps = {
      GEO_ID: geoDatum.properties.GEO_ID,
      CENSUSAREA: geoDatum.properties.CENSUSAREA,
      ...testData[apiDataIndex],
    };

    geoDatum.properties = newProps;
  });

  return geoData;

}

d3.json(geoDataPath, function (data) {
  console.log("testData", testData);
  data = zipAPIDataToGeoJSON(data, testData);

  console.log("data after zipping together files", data);



L.geoJson(data).addTo(myMap);
function getColor(d) {
  return d > 100000 ? '#008000' :
         d > 50000 ? '#449500' :
         d > 20000 ? '#6caa00' :
         d > 10000  ? '#91bf00' :
         d > 5000   ? '#b5d400' :
         d > 2000   ? '#dae900' :
         d > 1000   ? "#ffff00" :
                    'black';
}
function style(feature) {
  return {
      fillColor: getColor(feature.properties.initial_claims),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
  };
}


function onEachFeature(feature, layer) {
  layer.bindPopup(
    // console.log(feature.properties.state)
    feature.properties.state +
      " </br>New Unemployment Claims: " +
      feature.properties.initial_claims
  );
}

geojson = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(myMap);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
});

  var overlayMaps = {
    Choropleth: geojson,
  };

  L.control.layers(baseMaps).addTo(myMap);
  // Adding legend to the map

