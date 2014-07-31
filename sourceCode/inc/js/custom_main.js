/// Supporting JS File
/// Matthew Peters
/// Jan 14, 2014

//#region CONFIGURABLES

//Configure these...
var baseURL = 'http://hlmatt.com/uf';                                                       //MUST be pingable by google
var imageURL = baseURL;                                                                     //path to your images (must be google pingable)
var mapBaseImageURL = 'http://digital.wolfsonian.org/extra/pyramid/tiles/HumanPyramid/';    //MUST be pingable by google

//#endregion

//#region DEFINES

//add global vars
var map;                                    //holds the map object
var locations;                              //holds all point data
var markersOnMap = [];                      //holds all the markers on the map
var markersOnMapIds = [];
var messageCount = 0;                       //holds the message count which is used to delete multiple messages
var descOpen = true;                        //holds flag for desc button open by default
var annOpen = true;                         //holds flag for ann button open by default
var editOpen = false;                       //holds flag for edit button open by default
var deleteMode = false;                     //holds flag for delete mode button
var firstNewMarker = true;                  //holds flag for first new/drawn marker (fixes a possible bug where multi new markers may not save properly)
var defaultPageURLName = "Default.aspx";    //holds the default page name
//create and add custom map layer settings
function CustomMapType() { }
CustomMapType.prototype.tileSize = new google.maps.Size(256, 256);
CustomMapType.prototype.maxZoom = 7;
CustomMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
    var div = ownerDocument.createElement('DIV');
    var mapBaseURL = mapBaseImageURL;
    mapBaseURL += zoom + '_' + coord.x + '_' + coord.y + '.jpg'; //MUST be pingable by google
    div.style.width = this.tileSize.width + 'px';
    div.style.height = this.tileSize.height + 'px';
    div.style.backgroundColor = '#000000';
    div.style.backgroundImage = 'url(' + mapBaseURL + ')';
    return div;
};
CustomMapType.prototype.name = "Custom";
CustomMapType.prototype.alt = "Tile Coordinate Map Type";
var CustomMapType = new CustomMapType();

var infowindow = new google.maps.InfoWindow(); //creates a generic infowindow holder

//init map options
var mapOptions = {
    minZoom: 2,
    maxZoom: 9,
    isPng: false,
    mapTypeControl: false,
    streetViewControl: false,
    center: new google.maps.LatLng(2, -5),
    zoom: 3,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    overviewMapControl: true,
    overviewMapControlOptions: {
        opened: false
    }
};

//init new image
var imageInActive = new google.maps.MarkerImage(
    imageURL + '/iconInActiveSm.png',
    new google.maps.Size(13, 25), // size of the image (19,36)
    new google.maps.Point(0, 0), // origin, in this case top-left corner
    new google.maps.Point(9, 30) // anchor, i.e. the point half-way along the bottom of the image
);

//init existing image
var imageActive = new google.maps.MarkerImage(
    imageURL + '/iconActiveSm.png',
    new google.maps.Size(13, 25), // size of the image
    new google.maps.Point(0, 0), // origin, in this case top-left corner
    new google.maps.Point(9, 30) // anchor, i.e. the point half-way along the bottom of the image
);

//define drawing manager for this google maps instance
//support url: https://developers.google.com/maps/documentation/javascript/3.exp/reference#DrawingManager
var drawingManager = new google.maps.drawing.DrawingManager({
    //drawingMode: google.maps.drawing.OverlayType.MARKER, //set default/start type
    drawingControl: true,
    drawingControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP,
        drawingModes: [
            google.maps.drawing.OverlayType.MARKER
        ]
    },
    markerOptions: {
        map: map,
        draggable: true,
        icon: imageInActive //init as inactive
    }
});

//redirect to home (fixes save issue)
var loc = document.location.toString();
var loclen = loc.length;
var filename = "Default.aspx";
if (document.URL.indexOf("Admin") > -1) {
    filename = "Admin.aspx";
}
var filelen = filename.length;
loc = loc.substring(loclen - filelen, loclen);
if (loc.toUpperCase() != filename.toUpperCase()) {
    location.replace(filename);
}

//#endregion

//init gmaps with settings
function initialize() {
    
    //init
    initObjects(); //init geo objects (C# to js)
    initListeners();
    resizeView("init");
    
    //customize map obj
    map = new google.maps.Map(document.getElementById("container_map"), mapOptions);
    map.mapTypes.set('custom', CustomMapType);
    map.setMapTypeId('custom');
    
    //handle existing points
    for (var i = 0; i < locations.length; i++) {

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][2], locations[i][3]),
            map: map,
            draggable: false,           //default
            title: locations[i][4],     //default is the header
            icon: imageInActive         //default
        });

        markersOnMap[i] = marker; //add to markers on map holder
        markersOnMapIds[i] = locations[i][0]; //add the marker ID
        //console.log("assigning  " + i + ":" + locations[i][0] + ":" + markersOnMapIds[i]);
        
        //is markerActive
        if (locations[i][1]) {
            
        } else {
            //determine if we are not the admin
            if (document.URL.indexOf("Admin.aspx") == -1) {
                marker.setMap(null); //hide
            }
        }
        
        //determine status
        switch (locations[i][1]) {
            case -1: //deleted
                marker.setMap(null); //hide
                break;
            case 0: //inActive
                //determine if we are not the admin
                if (document.URL.indexOf("Admin.aspx") == -1) {
                    marker.setMap(null); //hide
                }
                break;
            case 1: //active
                marker.setOptions({ icon: imageActive });
                break;
        }

        google.maps.event.addListener(marker, 'click', function () {
            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                    console.log("hit  " + j + ":" + locations[j][0] + ":" + markersOnMapIds[j]);
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            //is page editng turned on?
            if (editOpen) {
                infowindow.setPosition(marker.getPosition());
                infowindow.setContent(writeHTML("existingPoint_editable", pointIndex, locations[pointIndex][4], locations[pointIndex][5], locations[pointIndex][6]));
                infowindow.open(map, marker);
            } else {
                infowindow.setContent(writeHTML("existingPoint", pointIndex, locations[pointIndex][4], locations[pointIndex][5], locations[pointIndex][6]));
            }
            infowindow.open(map, marker);

        });

        google.maps.event.addListener(marker, 'dragend', function() {
            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            locations[pointIndex][2] = marker.getPosition().lat();
            locations[pointIndex][3] = marker.getPosition().lng();
            createActionItem("update", pointIndex);
        });

        google.maps.event.addListener(marker, 'dragstart', function () {
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j][0] == this) {
                    //pointIndex = locations[j][0];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            infowindow.close();
        });

        google.maps.event.addListener(marker, 'rightclick', function () {
            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            //determine if we are editing
            if (editOpen) {
                //determine if marker is active
                if (locations[pointIndex][1]) {
                    locations[pointIndex][1] = 0; //inactivate
                    marker.setOptions({ icon: imageInActive });
                    createActionItem("update", pointIndex);
                    displayMessage(3, "Inactive");
                } else {
                    locations[pointIndex][1] = 1; //activate
                    marker.setOptions({ icon: imageActive });
                    createActionItem("update", pointIndex);
                    displayMessage(3, "Active");
                }
            }
            if (deleteMode) {
                if (confirm("Are you sure you want to delete this marker?")) {
                    //createActionItem("delete", pointIndex);
                    locations[pointIndex][1] = -1;
                    createActionItem("update", pointIndex);
                    marker.setMap(null);
                    //markersOnMap[pointIndex] = null;
                    displayMessage(5, "Deleted");
                }
            }

        });

    }

    //handle new points
    google.maps.event.addListener(drawingManager, 'markercomplete', function (marker) {

        //assign local new point Id
        var newPointIndex = locations.length;
        //loop through points already on the map and assign a unique id at the first (only if this is the first new marker)
        for (var j = 0; j < locations.length; j++) {
            //console.log(locations[j][0] + " : " + j);
            if (locations[j][0] != j) {
                newPointIndex = j;
                break;
            }
        }
        console.log("newPointIndex " + newPointIndex);

        //add to the locations array
        //locations[newPointIndex] = [newPointIndex, false, marker.getPosition().lat(), marker.getPosition().lng(), "New Point " + (newPointIndex + 1), "", ""];
        locations.splice(newPointIndex, 0, [newPointIndex, 0, marker.getPosition().lat(), marker.getPosition().lng(), "New Point " + (newPointIndex + 1), "", ""])

        //markersOnMap[newPointIndex] = marker; //add to markers on map holder
        markersOnMap.splice(newPointIndex, 0, marker);
        markersOnMapIds.splice(newPointIndex, 0, newPointIndex);

        //create the point
        createActionItem("create", newPointIndex);

        displayMessage(15, "Your note will appear on the site once it has been approved by a moderator.");
        
        //create and open the infowindw
        infowindow.setPosition(marker.getPosition());
        infowindow.setContent(writeHTML("newPoint", newPointIndex, null, null, null));
        infowindow.open(map, marker);

        google.maps.event.addListener(marker, 'click', function() {
            
            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            
            if (editOpen) {
                infowindow.setPosition(marker.getPosition());
                infowindow.setContent(writeHTML("newPoint", pointIndex, null, null, null));
                infowindow.open(map, marker);
            } else {
                infowindow.setContent(writeHTML("existingPoint", pointIndex, locations[pointIndex][4], locations[pointIndex][5], locations[pointIndex][6]));
            }
            infowindow.open(map, marker);

        });

        google.maps.event.addListener(marker, 'dragstart', function() {
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            infowindow.close();
        });

        google.maps.event.addListener(marker, 'dragend', function() {

            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            
            locations[pointIndex][2] = marker.getPosition().lat();
            locations[pointIndex][3] = marker.getPosition().lng();
            createActionItem("update", pointIndex);
            
        });

        google.maps.event.addListener(marker, 'rightclick', function() {

            var marker = this;
            var pointIndex = -1;
            //is this an existing marker?
            for (var j = 0; j < locations.length; j++) {
                if (markersOnMap[j] == this) {
                    //markersOnMapIds[j] = locations[j][0];
                    //pointIndex = markersOnMapIds[j];
                    pointIndex = j;
                }
            }
            //if no matches found, make new index
            if (pointIndex == -1) {
                pointIndex = locations.length;
            }
            console.log("pointIndex " + pointIndex);
            
            //determine if we are editing
            if (editOpen) {
                //determine if marker is active
                if (locations[pointIndex][1]) {
                    locations[pointIndex][1] = 0; //inactivate
                    marker.setOptions({ icon: imageInActive });
                    createActionItem("update", pointIndex);
                    displayMessage(3, "Inactive");
                } else {
                    locations[pointIndex][1] = 1; //activate
                    marker.setOptions({ icon: imageActive });
                    createActionItem("update", pointIndex);
                    displayMessage(3, "Active");
                }
            }
            if (deleteMode) {
                if (confirm("Are you sure you want to delete this marker?")) {
                    //createActionItem("delete", pointIndex);
                    locations[pointIndex][1] = -1;
                    createActionItem("update", pointIndex);
                    marker.setMap(null);
                    //markersOnMap[pointIndex] = null;
                    displayMessage(5, "Deleted");
                }
            }

        });

        drawingManager.setDrawingMode(null); //reset drawing mode
        
    });

}

//writes specific html and returns it as a string
function writeHTML(type, param1, param2, param3, param4) {
    var outputHTML;
    if (param2) {
        param2 = param2.replace(/<br\/>/g, "\n").replace(/&para;/g, "\n");
    }
    if (param3) {
        param3 = param3.replace(/<br\/>/g, "\n").replace(/&para;/g, "\n");
    }
    if (param4) {
        param4 = param4.replace(/<br\/>/g, "\n").replace(/&para;/g, "\n");
    }
    switch (type) {
        case "newPoint":
            outputHTML = "<div class=\"container_annotation\"> <textarea id=\"annotation_heading" + param1 + "\" class=\"annotation_heading\" placeholder=\"Heading\">" +
                "</textarea> <textarea id=\"annotation_description" + param1 + "\" class=\"annotation_description\" placeholder=\"Description\">" +
                "</textarea> <textarea id=\"annotation_attribution" + param1 + "\" class=\"annotation_attribution\" placeholder=\"Attribution Description [www.mylink.com] \">"+
                "</textarea> <br/> <div class=\"annotation_button\" id=\"getDesc\" onClick=\"getDesc(" + param1 + ");\" > Save </div> </div>";
        break;
        case "existingPoint":
            var stringBuilder = "<div class=\"container_annotation_readOnly\">";
            if (param2) {
                stringBuilder += "<div id=\"annotation_heading" + param1 + "\" class=\"annotation_heading_readOnly\">";
                stringBuilder += param2;
                stringBuilder += "</div>";
            }
            if (param3) {
                stringBuilder += "<div id=\"annotation_description" + param1 + "\" class=\"annotation_description_readOnly\">";
                stringBuilder += param3;
                stringBuilder += "</div>";
            }
            if (param4) {
                stringBuilder += "<div id=\"annotation_attribution" + param1 + "\" class=\"annotation_attribution_readOnly\">";
                stringBuilder += "<div class=\"annotation_attribution_heading\">Attribution:</div>";
                param4 = param4.replace(/\[/g, "<a href=\"http://").replace(/\]/g, "\" target=\"_blank\"> Link </a>"); //convert to decompiled
                stringBuilder += param4;
                stringBuilder += "</div>";
            }
            stringBuilder += "</div>";
            outputHTML = stringBuilder;
            break;
        case "existingPoint_editable":
            if (param4) {
                param4 = param4.replace(/<a href=\"http:\/\//g, '[').replace(/\" target=\"_blank\"> Link <\/a>/g, "]"); //convert to compiled
            }
            outputHTML = "<div class=\"container_annotation\"> <textarea id=\"annotation_heading" + param1 + "\" class=\"annotation_heading\" placeholder=\"Heading\">" +
                param2 + "</textarea> <textarea id=\"annotation_description" + param1 + "\" class=\"annotation_description\" placeholder=\"Description\">" +
                param3 + "</textarea> <textarea id=\"annotation_attribution" + param1 + "\" class=\"annotation_attribution\" placeholder=\"Attribution Description [www.mylink.com]\">" +
                param4 + "</textarea> <br/> <div class=\"annotation_button\" id=\"getDesc\" onClick=\"getDesc(" + param1 + ");\" > Save </div> </div>";
            break;
    }
    return outputHTML;
}

//assign the description
function getDesc(id) {
    console.log("getting stuff from id " + id);
    locations[id][4] = document.getElementById("annotation_heading" + id).value; //.replace(/([^a-z0-9\n\r.?!$%]+\,:@ )/gi, ''); //explicitly allow these...
    locations[id][5] = document.getElementById("annotation_description" + id).value;
    locations[id][6] = document.getElementById("annotation_attribution" + id).value;
    createActionItem("update", id);
    infowindow.close();
}

//sends save dataPackages to the server via json
function toServer(dataPackage) {
    jQuery('form').each(function () {
        var payload = JSON.stringify({ sendData: dataPackage });
        var hiddenfield = document.getElementById('payload');
        hiddenfield.value = payload;
        var hiddenfield2 = document.getElementById('action');
        hiddenfield2.value = 'save';
        //displayMessage(5,"working...");
        $.ajax({
            type: "POST",
            async: true,
            url: window.location.href.toString(),
            data: jQuery(this).serialize(),
            success: function () {
                displayMessage(3,"saved");
            }
        });
    });
}

//create a package to send to server to save item location
function createActionItem(handle, pointIndex) {
    console.log("pointIndex: " + pointIndex);
    var messageType = handle + "|" + "item"; //define what message type it is
    //handle special case
    var data;
    if (handle=="delete") {
        data = messageType + "|" + locations[pointIndex][0] + "|";
    } else {
        data = messageType + "|" + locations[pointIndex][0] + "|" + locations[pointIndex][1] + "|" + locations[pointIndex][2] + "|" + locations[pointIndex][3] + "|" + locations[pointIndex][4] + "|" + locations[pointIndex][5] + "|" + locations[pointIndex][6] + "|";
    }
    var dataPackage = data + "~";
    //one last check (filter all special/reserved characters)
    dataPackage = dataPackage.replace(/[\n\r]/g, '&para;').replace(/<br\/>/g, "&para;").replace(/[\<\>\=]/g, '&para;');
    //alert("saving item: " + dataPackage); //temp
    console.log(dataPackage);
    toServer(dataPackage);
}

//init listeners
function initListeners() {

    //if this is the admin page
    if (document.URL.indexOf("Admin.aspx") > -1) {
        
        //add the toggle action
        document.getElementById("toggleAdmin").onclick = function () {
            window.location = defaultPageURLName;
        };
        
        //add the edit action
        document.getElementById("toggleEdit").onclick = function () {
            if (editOpen) {
                displayMessage(3,"editing turned off");
                for (var i = 0; i < markersOnMap.length; i++) {
                    if (markersOnMap[i] == null) {
                        //do nothing
                    } else {
                        markersOnMap[i].setOptions({ draggable: false });
                    }
                }
                infowindow.close();
                drawingManager.setMap(null);
                editOpen = false;
                document.getElementById("toggleEdit").className = "";
                document.getElementById("toggleDelete").className = "";
            } else {
                displayMessage(3,"editing turned on");
                for (var i = 0; i < markersOnMap.length; i++) {
                    if (markersOnMap[i] == null) {
                        //do nothing
                    } else {
                        markersOnMap[i].setOptions({ draggable: true });
                    }
                }
                infowindow.close();
                displayMessage(10,"Drag an existing point or click on the image to create a note.");
                drawingManager.setMap(map);
                editOpen = true;
                deleteMode = false;
                document.getElementById("toggleEdit").className = "isActiveButton";
                document.getElementById("toggleDelete").className = "";
            }
        };
        
        //add the delete mode action
        document.getElementById("toggleDelete").onclick = function () {
            if (deleteMode) {
                displayMessage(3,"delete mode turned off");
                editOpen = false;
                deleteMode = false;
                document.getElementById("toggleEdit").className = "";
                document.getElementById("toggleDelete").className = "";
            } else {
                displayMessage(3,"delete mode turned on, right click a marker to delete");
                for (var i = 0; i < markersOnMap.length; i++) {
                    if (markersOnMap[i] == null) {
                        //do nothing
                    } else {
                        markersOnMap[i].setOptions({ draggable: false });
                    }
                }
                infowindow.close();
                drawingManager.setMap(null);
                editOpen = false;
                deleteMode = true;
                document.getElementById("toggleEdit").className = "";
                document.getElementById("toggleDelete").className = "isActiveButton";
            }
        };
        
    //if this is NOT the admin page
    } else {
        
        //toggle placer mode
        document.getElementById("togglePlacer").onclick = function () {
            displayMessage(10,"Click on the image to create a note.");
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
            drawingManager.setMap(map);
        };
        
        //toggle annotations
        document.getElementById("toggleAnn").onclick = function () {
            if (annOpen) {
                for (i = 0; i < markersOnMap.length; i++) {
                    if (markersOnMap[i] == null) {
                        //do nothing
                    } else {
                        //is markerActive
                        if (locations[i][1]) {
                            markersOnMap[i].setMap(null);
                        }
                    }
                }
                annOpen = false;
            } else {
                for (i = 0; i < markersOnMap.length; i++) {
                    if (markersOnMap[i] == null) {
                        //do nothing
                    } else {
                        //is markerActive
                        if (locations[i][1]) {
                            markersOnMap[i].setMap(map);
                        }
                    }
                }
                annOpen = true;
            }
        };

    }
    //for both pages

    //toggle description bar
    document.getElementById("toggleDesc").onclick = function () {
        if (descOpen) {
            document.getElementById("container_description").style.display = "none";
            descOpen = false;
        } else {
            document.getElementById("container_description").style.display = "block";
            descOpen = true;
        }
        resizeView();
    };
    
    //add the toggle action
    document.getElementById("container_banner").onclick = function () {
        window.location = "http://digital.wolfsonian.org/";
    };
   
}

//resizes container based on the viewport
function resizeView(param) {

    //get sizes of elements already drawn
    var totalPX = document.documentElement.clientHeight;
    var headerPX = document.getElementById("container_header").offsetHeight;
    var contentPX = document.getElementById("container_description").offsetHeight;
    var footerPX = document.getElementById("container_footer").offsetHeight;
    var controlsPX = document.getElementById("container_controls").offsetHeight;
    var widthPX = document.documentElement.clientWidth;
    var bodyPX = 0; //init
    //set the width of the main container
    //document.getElementById("container_main").style.width = widthPX + "px";

    //detect and handle different widths
    //todo make the 800,250 dynamic
    if (widthPX <= 800) {
        //de("tablet viewing width detected...");
        //toolbar
        //menubar
        //toolbox -min
    }
    if (widthPX <= 250) {
        //de("phone viewing width detected...");
        //toolbar -convert to bottom button style
        //menubar -convert to sidemenu
        //toolbox -close/disable
    }

    //calculate and set sizes (the header and toolbar are taken into account as 'ghosts' in all but IE)
    if (param == 'init') {
        bodyPX = totalPX - ((headerPX * 2) + (contentPX * 2 + footerPX)); //this accounts for toolbar not being loaded
    } else {
        bodyPX = totalPX - ((headerPX * 2) + contentPX + footerPX);
    }
    if (navigator.appName == 'Microsoft Internet Explorer') {
        bodyPX = totalPX - (headerPX + contentPX + footerPX); //for IE, no ghosts
    }

    //override algorithm
    //bodyPX = totalPX - (50 + 15 + 15 + (contentPX + controlsPX));
    bodyPX = totalPX - (50 + (contentPX + controlsPX));

    //assign height
    document.getElementById("container_map").style.height = bodyPX + "px";

    var pane0PX = bodyPX * .05;
    //document.getElementById("mapedit_container_pane_0").style.height = pane0PX + "px";
    var pane1PX = bodyPX * .05;
    //document.getElementById("mapedit_container_pane_1").style.height = pane1PX + "px";
    var pane2PX = bodyPX * .90;
    //document.getElementById("mapedit_container_pane_2").style.height = pane2PX + "px";

    //calculate percentage of height
    var percentOfHeight = Math.round((bodyPX / totalPX) * 100);
    //document.getElementById("mapedit_container").style.height = percentOfHeight + "%";
}

//display an inline message
function displayMessage(duration, message) {

    //keep a count of messages
    messageCount++;

    //compile divID
    var currentDivId = "message" + messageCount;

    //create unique message div
    var messageDiv = document.createElement("div");
    messageDiv.setAttribute("id", currentDivId);
    messageDiv.className = "message";
    document.getElementById("content_message").appendChild(messageDiv);
    
    //assign the message
    document.getElementById(currentDivId).innerHTML = message;

    duration = duration * 1000; //convert to milliseconds
    
    //determine if duplicate message
    var duplicateMessage = false;
    try {
        if (document.getElementById("message" + (messageCount - 1)).innerHTML == message) {
            duplicateMessage = true;
        }
    } catch (e) {
        //
    }

    if (duplicateMessage) {
        //remove the previous
        $("#" + "message" + (messageCount - 1)).remove();
        //display the new
        document.getElementById(currentDivId).style.display = "block"; //display element
        //fade message out
        setTimeout(function () {
            $("#" + currentDivId).fadeOut("slow", function () {
                $("#" + currentDivId).remove();
            });
        }, duration); //after 3 sec
    } else {
        //de("Unique message to display");
        //show message
        document.getElementById(currentDivId).style.display = "block"; //display element
        //fade message out
        setTimeout(function () {
            $("#" + currentDivId).fadeOut("slow", function () {
                $("#" + currentDivId).remove();
            });
        }, duration); //after 3 sec
    }

}

