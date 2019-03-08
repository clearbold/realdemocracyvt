var map = L.map('map').setView([44.3386209,-72.7547131], 9);
var gl = L.mapboxGL({
    accessToken: 'pk.eyJ1IjoiY2xlYXJib2xkIiwiYSI6IkI0ZWdMTW8ifQ.djN6eK5OWq7kAiEEKFhjFw',
    style: 'mapbox://styles/mapbox/outdoors-v9',
    attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
}).addTo(map);

var orange = 'rgb(217, 94, 31)';
function color(score) {
    adjustment = 100 - ((score * 45) / 100) - 55;
    return tinycolor(orange).lighten(adjustment).toString();
}
function radius(towns, population) {
    smallest = 8;
    biggest = 100;
    maxPop = 0;
    minPop = 0;
    var smallestTown;
    towns.forEach(function(d, i) {
        console.log(d);
        if (i == 0) {
            smallestTown = d;
            minPop = d.properties.population_2017 * 1;
            maxPop = d.properties.population_2017 * 1;
        }
        else {
            if (d.properties.population_2017 < minPop){
                smallestTown = d;
                minPop = d.properties.population_2017;
            }
            if (d.properties.population_2017 > maxPop)
                maxPop = d.properties.population_2017;
        }
    });
    // map.setView([smallestTown.geometry.coordinates[0], smallestTown.geometry.coordinates[1]], 9);
    range = maxPop - minPop;
    multiplier = population / maxPop;
    calcRadius = smallest * multiplier * 9;
    calcRadius = (calcRadius < smallest) ? smallest : calcRadius;
    calcRadius = (calcRadius > biggest) ? biggest : calcRadius;
    return calcRadius;
}

var request = new XMLHttpRequest();
request.open('GET', '/realdemocracyvt/data.json', true);

request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        data.features.forEach(function(d, i) {
            circle = L.circleMarker([d.geometry.coordinates[0], d.geometry.coordinates[1]],
                {
                    radius: radius(data.features, d.properties.population_2017),
                    stroke: false,
                    fillColor: color(d.properties.real_democracy_score),
                    fillOpacity: .9
                }).addTo(map);
            // marker = L.marker([d.latitude, d.longitude]);
            markerHtml = '<p><b>' + d.properties.town + '</b></p>';
            markerHtml += '<p><b>Real Democracy Score:</b> ' + d.properties.real_democracy_score + '</p>';
            markerHtml += '<p>';
            markerHtml += 'Peak Attendance: ' + d.properties.peak_attendance + '<br />';
            markerHtml += 'Attendance Rate: ' + d.properties.attendance_rate + '<br />';
            markerHtml += 'Peak Total Partipants: ' + d.properties.total_participants + '<br />';
            markerHtml += 'Participation Rate: ' + d.properties.participation_rate + '<br />';
            markerHtml += '2017 Population: ' + d.properties.population_2017 + '<br />';
            markerHtml += 'Length of Meeting: ' + d.properties.slength_of_meeting + '</p>';
            circle.bindPopup(markerHtml);
            // marker.addTo(map);
        });
    } else {
        // We reached our target server, but it returned an error
    }
};

request.onerror = function() {
    // There was a connection error of some sort
};

request.send();