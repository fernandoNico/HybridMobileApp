// Global Variables 
var ref = 0;
var lats = 42.3601;
var longs = -70.9495;
var propertyPostcode = "";

//Function used to get the ref od the property fromt the URL
function getParam(url) {
    var parsed = $.mobile.path.parseUrl(url),
        hash = parsed.hash.split("?");
    return {
        search: hash[1].split("=")[1]
    };
}

// Method that fetch data from database and append it to the DOM
function loadData() {
    $('#propertiesList').empty();
    dbHandler.dataBase.transaction(function (tx) {
        tx.executeSql(`SELECT Properties.propertyRef, Properties.monthFee, Properties.bedQty, Properties.propertyType, Properties.propertyRef, Properties.postcode,
        Properties.furnitureType, Properties.notes,  Properties.createdOn, Properties.postedBy,  Properties.avalabilityDate, Propertyimages.imgPath FROM Properties
        INNER JOIN Propertyimages ON Properties.propertyRef = Propertyimages.postRef `, [], function (tx, results) {
        var len = results.rows.length, i;
        var list="";
        for (i = 0; i < len; i++){
            $('#propertiesList').append(`<li>
                        <a  onClick="fullDetails(${ results.rows.item(i).propertyRef})">
                        <div><img src="${results.rows.item(i).imgPath}"></div>
                        <h1><strong>£ ${ results.rows.item(i).monthFee} Pcm </strong></h1>
                        <p>${ flatType (results.rows.item(i).bedQty)} ${ results.rows.item(i).propertyType} to rent in ${ results.rows.item(i).postcode}</p>
                        <p>${ results.rows.item(i).furnitureType}</p>
                        <p>${ results.rows.item(i).notes}</p>
                        <p>Listed on <strong> ${ results.rows.item(i).createdOn} by  ${ results.rows.item(i).postedBy} </strong> </p>
                        <p class="ui-li-aside"><strong><a href=""> Available ${ results.rows.item(i).avalabilityDate}</strong></a></p>
                        </a>
                    </li>`).listview('refresh');
        }
        }, null);
     });
     
}

// Method that fetch data from database and display property full details
// As well, to display the google map the endpoint Addresses API is called based on the property postcode previously fecthed from The DB
// bY doing so, the lat and lg can be obtained.
$(document).on("pagecontainerbeforetransition", function (e, data) {
    if ($.type(data.toPage) !== "undefined" && $.type(data.absUrl) !== "undefined" && data.toPage[0].id == "map-page") {
        var param = getParam(data.absUrl).search;
        ref = param;

        dbHandler.dataBase.transaction(function (tx) {
                tx.executeSql(`SELECT Properties.propertyRef, Properties.monthFee, Properties.bedQty, Properties.propertyType, Properties.propertyRef, Properties.postcode,Properties.street,
                Properties.furnitureType, Properties.notes,  Properties.createdOn, Properties.postedBy,  Properties.avalabilityDate, Propertyimages.imgPath FROM Properties
                INNER JOIN Propertyimages ON Properties.propertyRef = Propertyimages.postRef Where Properties.propertyRef =` + ref, [], function (tx, results) {

                var lent = results.rows.length, i;
                var data="";
                for (i = 0; i < lent; i++){
                    data += `
                        <h1 style="font-size:1.7rem;">${ flatType (results.rows.item(i).bedQty)} ${ results.rows.item(i).propertyType}
                        to rent <strong style="color:red">£ ${ results.rows.item(i).monthFee} Pcm </strong></h1>
                        <img src="${results.rows.item(i).imgPath}" id="img_camera" alt="" style="width:100%;padding: 0;">
                       
                        <div style="text-align:center">
                       
                        <img id="img_camera">
                        <p id="location"></p>  

                            <span class="tag is-primary">${ results.rows.item(i).furnitureType}</span>
                            <span class="tag is-link">Available ${ results.rows.item(i).avalabilityDate}</span>
                            <span class="tag">${ results.rows.item(i).street}</span>
                            <span class="tag is-primary">${ results.rows.item(i).postcode}</span>
                            <span class="tag is-warning">Owner 020893489</span>  
                            <span class="tag is-danger">Listed on ${ results.rows.item(i).createdOn} by  ${ results.rows.item(i).postedBy}</span>
                        </div><br>
                        <p>${ results.rows.item(i).notes}</p><br>`;
                        propertyPostcode = results.rows.item(i).postcode;

                }
                 document.getElementById('try').innerHTML= data;
                 GetpostNotes();
                 var apiKey = "vXOz9FPWLUa_3kJnSc8U1Q12813";
                //  var apiKey = "kH6Iob66dkqdMFQThCczyQ12057";
                 axios.get('https://api.getAddress.io/find/'+propertyPostcode+'?api-key='+ apiKey).then(function (response) {
                     console.log(response);
                     var lt = response.data.latitude;  
                     var lon = response.data.longitude; 
                    
                    var defaultLatLng = new google.maps.LatLng(lt,lon); 
                    drawMap(defaultLatLng);
                    function drawMap(latlng) {
                        var myOptions = {
                            zoom: 15,
                            center: latlng,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
                        // Add an overlay to the map of current lat/lng
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: "Greetings!"
                        });
                    }
                 })
                 .catch(function (error) {
                 console.log(error);
                 });
                 
            }, null);


        });
        
    }
});

// Method that fetch the notes associated with the property reference from the database and append it to the DOM
function GetpostNotes() {

    dbHandler.dataBase.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Propertynotes Where postRef =' + ref , [], function (tx, results) {
            var notes = results.rows.length, i;
            console.log(results)
            var dataNotes="";
            for (i = 0; i < notes; i++){
                dataNotes += `
                <article class="message is-small">
                        <div class="message-header">
                        <p>${ results.rows.item(i).postedOn} by <strong>${ results.rows.item(i).postedBy}</strong></p>
                        <button class="delete is-small"  onClick="deleteNote(${ results.rows.item(i).id})" aria-label="delete"></button>
                        </div>
                        <div class="message-body">
                        <h2><strong> ${ results.rows.item(i).title}</strong></h2>
                        <p> ${ results.rows.item(i).desc}</p>
                        </div>
                </article>`;
            }
             document.getElementById('postNotes').innerHTML= dataNotes;
        }, null);
    });
}

// Method that delete a note associated with the property reference
function deleteNote(id) {

    var r = confirm("Are you sure you want to delete this note");
    if(r == true){
        dbHandler.dataBase.transaction(function (tx){
            tx.executeSql('Delete FROM Propertynotes Where id =' + id  , [], function (tx, results) {
                alert("Note Successfully Deleted");
            });
        });
        $('#postNotes').empty();
        GetpostNotes();

        $("#postNoteTitle").val("");
        $("#postNoteDesc").val("");
        $("#postNoteBy").val("");

    }else{
        return false;
    }
}

// Method that creates a note associated with the property reference
function addNotePost(){
    
    if($("#form1").valid()){

        var noteTitle = $("#postNoteTitle").val();
        var noteDesc = $("#postNoteDesc").val();
        var noteBy = $("#postNoteBy").val();

        today = Date.now();
        creationDate = new Date(today);
        creationDate = (creationDate.getMonth()+1)+'/'+creationDate.getDate()+'/'+creationDate.getFullYear()+' '+(creationDate.getHours() > 12 ? creationDate.getHours() - 12 : creationDate.getHours())+':'+creationDate.getMinutes()+' '+(creationDate.getHours() >= 12 ? "PM" : "AM");
        
        var r = confirm("Note Title: " 	+ noteTitle + "\n" + 
                        "Note Desc: " 	+ noteDesc + "\n" + 
                        "Posted By: " 	+ noteBy + "\n"   );
        if(r == true){
            note.add(noteTitle, noteDesc, creationDate, noteBy, ref); 
            $( "#popupLogin1" ).popup( "close" );
            GetpostNotes();
            $("#postNoteTitle").val("");
            $("#postNoteDesc").val("");
            $("#postNoteBy").val("");
            document.getElementById("form1").reset();
        }else { return false }
       
    }else{
        alert("Invalid input. All fields must be entered")
        return false
    }
          
}

// Method that delete a the property 
function deletePost(){

    var r = confirm("Are you sure you want to delete this post");
    if(r == true){
        dbHandler.dataBase.transaction(function (tx){
            tx.executeSql('Delete FROM Properties Where propertyRef =' + ref , [], function (tx, results) {
                alert("Post Successfully Deleted");
            });
        });
        $('#propertiesList').empty();
        loadData();
        window.location.href = "#list";
    }else{
        return false;
    }
   
}

// Method that returns properies data from the database based on the user parameters selected
// The search is implemented using the logic found on the link below
//PhoneGap, S. (2018). SQL JOIN with SQL Database + PhoneGap. [online] Stackoverflow.com. 
//Available at: https://stackoverflow.com/questions/18626666/sql-join-with-sql-database-phonegap [Accessed 3 Apr. 2018].
function searchResults() {  
    dbHandler.dataBase.transaction(function (tx) {

        var feeFrom = $("#range-1a").val();
        var feeTo = $("#range-1b").val();
        var properTypeValue = $("#propertyTypeSearch").val();
        var bedroomsQty = $("#bedroomsQtySearch").val();
        var furnitureTypeValue = $("#furnitureTypeSearch").val();

        var propertyValues = `SELECT Properties.propertyRef, Properties.monthFee, Properties.bedQty, Properties.propertyType, Properties.propertyRef, Properties.postcode,
        Properties.furnitureType, Properties.notes,  Properties.createdOn, Properties.postedBy,  Properties.avalabilityDate, Propertyimages.imgPath FROM Properties
        INNER JOIN Propertyimages ON Properties.propertyRef = Propertyimages.postRef WHERE `;

        var sqlFilterValues = "";

        if (feeFrom != "" && feeTo != "") {
            sqlFilterValues += "AND monthFee BETWEEN " + feeFrom + " AND " + feeTo + " "; 
         }
        if (properTypeValue != "") {
            sqlFilterValues += "AND propertyType = '" + properTypeValue + "' "; 
         }
        if (bedroomsQty != "") {
            sqlFilterValues += "AND bedQty = '" + bedroomsQty + "' "; 
         }
         if (furnitureTypeValue != "") {
            sqlFilterValues += "AND furnitureType = '" + furnitureTypeValue + "' "; 
         }

         if (sqlFilterValues != "") {
            sqlFilterValues = sqlFilterValues.substring(4);
        }
        propertyValues += sqlFilterValues;
        tx.executeSql(propertyValues, [] , function (tx, results) {
        var checkData = results.rows.length, i;
        if (checkData == 0) {
            alert("No results found");
        }else{
            $('#mysearch').empty();
            $('#mysearch').append(` <div class="field is-grouped is-grouped-multiline level-item has-text-centered">
                                            <div class="control">
                                                <div class="tags has-addons">
                                                    <span class="tag is-dark">${checkData}</span>
                                                    <span class="tag is-info">Properties Found</span>
                                                    <span class="tag is-danger">Clear Search</span>
                                                    <a class="tag is-delete" onClick="clearSearch();"></a>
                                                </div>
							        </div></div>`);
            $('#propertiesList').empty();
            for (i = 0; i < checkData; i++){
                $('#propertiesList').append(`<li>
                            <a  onClick="fullDetails(${ results.rows.item(i).propertyRef})">
                            <img src="${results.rows.item(i).imgPath}" alt="">
                            <h2><strong>£ ${ results.rows.item(i).monthFee} Pcm </strong></h2>
                            <p>${ flatType (results.rows.item(i).bedQty)} ${ results.rows.item(i).propertyType} to rent in ${ results.rows.item(i).postcode}</p>
                            <p>${ results.rows.item(i).furnitureType}</p>
                            <p>${ results.rows.item(i).notes}</p>
                            <p>Listed on <strong> ${ results.rows.item(i).createdOn} by  ${ results.rows.item(i).postedBy} </strong> </p>
                            <p class="ui-li-aside"><strong><a href=""> Available ${ results.rows.item(i).avalabilityDate}</strong></a></p>
                            </a>
                        </li>`).listview('refresh');
            }

            $( "#popupLogin" ).popup( "close" );
        }

    }, null);

    });

    
 
}

// Clear search
function clearSearch() {
    $('#mysearch').empty();
    $('#propertiesList').empty();
    document.getElementById("seacrhForm").reset();
    loadData();
}
