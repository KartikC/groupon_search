/**
 *	@author Kartik Sathappan (kartiksathappan@gmail.com / kps5889@rit.edu)
 *
 *	Groupon MindSumo challenge.
 *	Help Consumers find deals by merchants they know.
 *
 *	Uses Google's geolocation services to get coordinates.
 *	Either via geolocation or address entry (press enter)
 *	Then uses those coordinates to find a Groupon Division.
 *	Loads all deals in order if distance as you type in
 *	search bar. Searches for query anywhere in the deal's
 *	title.
 *
 */
 
var CLIENT_ID = "***";
var myLatitude = 0;
var myLongitude = 0;
var numDeals = 0;
var myDict = [];
var geocoder;


$( document ).ready(function() {
	//Checks for enter on the address bar
	$('#address').keyup(function(ev) {
		if (ev.keyCode == 13) {
			findCoords($(this).val());
		}
	});
	
	//checks for input on the query bar
	$('#query').bind('input', function() {
		search($(this).val());
	});
	
	//detects clicks on the detect link
	$('#detect').click(function(){
		detectCoords();
		$('#address').val('');
		return false;
	});
});



function initialize() {
	//initialize google geocoder
	geocoder = new google.maps.Geocoder();
}

function search(query) {
	//searches myDict for the query
	$("#resultsTable").empty();
	
	if(query != "") {
		var empty = true;
		for (var i = 0; i < myDict.length; i++) {
			if(myDict[i].key.toLowerCase().indexOf(query.toLowerCase()) != -1){
				$("#resultsTable").append(dealHTML(myDict[i]));
				empty = false;
			}
		}
		if (empty) {
			$("#resultsTable").append("Sorry, no results :(");
		}
	}
}

function dealHTML(data) {
	//returns an HTML representation of a deal
	var result = '<tr><td><a href="' + data.value[2] + '">' + data.key + '</a></td><td class="distance">';
	if( data.value[0] == 0 ) {
		result += 'Online Deal</td></tr>';
	}
	else {
		result += data.value[0] + ' miles</td></tr>';
	}
	return result;
}

function getDivision() {
	//gets a groupon division
	$("#resultsTable").empty();
	$("#division").empty();
	$("#query").val('');
	
	var path = "https://api.groupon.com/v2/divisions.json?client_id=" + CLIENT_ID + "&lat=" +
					myLatitude + "&lng=" + myLongitude + "&show=id&sort=distance";
	$.ajax({
    url: path, 
    dataType: 'jsonp',
		success: function(data) {
			if(data.divisions.length > 0) {
				$("#division").append(data.divisions[0].id);
			}
		}
	});

}

function getDeals() {
	//gets all the deals for the division
	var path = "https://api.groupon.com/v2/deals.json?client_id=" + CLIENT_ID+ "&lat=" +
					myLatitude + "&lng=" + myLongitude + "&show=merchant,options,redemptionLocation,uuid,division,dealUrl&sort=distance";
	myDict = [];
	$("#numDeals").empty();
	
	$.ajax({
    url: path, 
    dataType: 'jsonp',
		success: function(data) {
			numDeals = data.deals.length;
			$.each(data.deals, function(key, val) {
				var name = val.merchant.name;
				var uuid = val.uuid;
				var link = val.dealUrl;
				var distance = 0;
				
				//skips online deals and gives them 0 distance
				if (val.redemptionLocation != "Online Deal") {
						var leastDistance = Number.MAX_VALUE;
						//iterate through every option and location for the closest one
						$.each(val.options, function(key, val) {
							$.each(val.redemptionLocations, function(key, val) {
								var tempDistance = getDistance(myLatitude, myLongitude, val.lat, val.lng);
								if(tempDistance < leastDistance){
									leastDistance = tempDistance;
								}
							});
						});
						distance = leastDistance;
						if(leastDistance == Number.MAX_VALUE) {
							distance = getDistance(myLatitude, myLongitude, val.division.lat, val.division.lng);
						}
				}
				addToHash(name, distance.toFixed(2), uuid, link);
			});
			myDict = getSortedKeys(myDict);
			$("#numDeals").append(numDeals);
		}
	});
}

function addToHash(name, distance, uuid, link) {
	//adds values to myDict
	myDict.push({
		key:   name,
		value: [distance, uuid, link]
	});
}

function getSortedKeys(obj) {
	//returns a dict sorted by distance
    var keys = [];
	for(var key in obj) keys.push(obj[key]);
    return keys.sort(function(a,b){
	return a.value[0] - b.value[0]});
}

function detectCoords() {
	//HTML5 reverse-geocoding
	var coords = "";
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			myLatitude = position.coords.latitude;
			myLongitude = position.coords.longitude;
			afterCoords();
		});
	}
}

function findCoords(input) {
	//Google geocoding
	geocoder.geocode( { 'address': input}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			myLatitude = results[0].geometry.location.lb;
			myLongitude = results[0].geometry.location.mb;
			afterCoords();
		}
		else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function afterCoords() {
	//runs after getting coordinates regardless of method 
	getDivision();
	getDeals();
	myDict = getSortedKeys(myDict);
}

function getDistance(lat1, lng1, lat2, lng2) {
	// using Spherical Law of Cosines
	var R = 3959; // miles
	var d = Math.acos(Math.sin(toRadian(lat1)) * 
				Math.sin(toRadian(lat2)) + Math.cos(toRadian(lat1)) * 
				Math.cos(toRadian(lat2)) * Math.cos(toRadian(lng2 - lng1))) * R;
	return d;
}

function toRadian(deg) {
	//convert to radians
      return deg /180 * Math.PI;
}