/*
    FlemSem3\Collab\P2306\Del2
    python -m http.server

    This file adds a geoJson using JQuery
*/

// Add map baselayers
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
//Map declaration
const map = L.map('map', {
    center: [44.3, -77.8],    //44.5, -78
    zoom: 12,
    layers: [Esri_WorldImagery,osm]            
});
// Add baselayer info as array for layer control, control added lower to put it
// below the search bar
const baseLayers = {
    'Esri World Imagery': Esri_WorldImagery,
    'OpenStreetMap': osm
};
const baseControl = L.control.layers(baseLayers,null,{position:'topleft'}).addTo(map);

// var showjson = L.FeatureGroup();
let photoJSON = L.geoJSON(null,{
    style: function(feature) {
        return {
            color: 'purple'
        }
    }
}).addTo(map); // Variable to hold the GeoJSON data
let sameJson;

let outputList = $('#jsonResults'); // HTML ID to put the results into

$.getJSON('../geojson/aerials.json', function(data) {
    photoJSON.addData(data);
    sameJson = data;
    console.log(sameJson.features[1].properties) // for troubleshooting and viewing properties

    sameJson.features.sort(function(a,b) { // sort the JSON so it shows up nicely
        var propA = a.properties.PHOTO_ID;
        var propB = b.properties.PHOTO_ID;
        return propA - propB;
// .sort() orders by putting the lower number first, so if A - B is negative, A preceeds, if positive, B preceeds, if 0 they are equal
    });

});
baseControl.addOverlay(photoJSON,"Aerial Image Locations");

var userIn = new L.FeatureGroup().addTo(map);  // variable to store user drawn inputs


// add drawing control bar
var drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
    },
    edit: {
        featureGroup: userIn
    }
});
map.addControl(drawControl);

let userShape = null;
// save user drawn items as new layers in the layer group
map.on('draw:created', function(e) {
    var layer = e.layer;
    userIn.addLayer(layer);

    //save the polygon to GeoJSON for later analysis
    userShape = layer.toGeoJSON();
    console.log('User Input: ',userShape);
});

// add a button to summon photos on a drawn layer or point
var ourCustomControl = L.Control.extend({
    options: {
        position: 'topright'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('button'); 

        container.innerText = 'Find Aerial Imagery';    // text for button
        
        container.style.backgroundColor = 'white';      // styles for the button
        container.style.borderWidth = '2px';            // these options make it look like
        container.style.borderColor = '#b4b4b4';        // all of the other buttons that
        container.style.borderRadius = '5px';           // are already there
        container.style.borderStyle = 'solid';
        container.style.width = '140px';
        container.style.height = '30px';
        
//Set the function of the button to check if the user input overlaps the aerials
        container.onclick = function(){             // when we click the button
            console.log('Pull the lever, Cronk.');   // display a message confirming the click
            outputList.empty();
            outputList.append('<h3>Available Photos</h3>'); // title for the list of results

            if (userShape === null) {                  // if the user has not set an input
                console.log('Wrong levaaaaAAAAAAHHHHH!!!!!!');       // return an error message
                return;
            }
            console.log('Test sameJson:',sameJson);
            console.log('Test userShape:',userShape);
            count = 0;
            numResults = 0;
            //iterate through the json and check if the polygons overlap the user input
            sameJson.features.forEach(function(feature) {
                var properties = feature.properties;
                var geometry = feature.geometry;
                var item = feature.properties.PHOTO_ID
                count +=1;

                // check for null values, skip if present
                if(!geometry || !userShape) {
                    console.log('ERROR: Invalid geometry or userShape on Photo',item);
                    return; // skip if either item is null
                }
                // check that geojson items are polygons
                if(feature.geometry.type !== 'Polygon') {
                    console.log('ERROR: Not a polygon: Photo',item);
                    return;
                }

                // console.log('How many features does it show?',count);
                console.log('Photo ID:',feature.properties.PHOTO_ID);
                
                var overlap = turf.booleanContains(geometry,userShape) || turf.booleanContains(userShape,geometry);  // check user poly against air json for overlap
                
                if (overlap) {
                    outputList.append('<input type="checkbox">')
                    outputList.append('<label> ' + properties.PHOTO_ID + '</label></br>');
                    numResults += 1;
                }
                else {
                    console.log('No overlap.');
                }
                
            });
            if (numResults === 0) {
                outputList.append('There are no photos in this area.');
            }
            console.log('numResults',numResults);
        }
        return container;
    },
});
map.addControl(new ourCustomControl());