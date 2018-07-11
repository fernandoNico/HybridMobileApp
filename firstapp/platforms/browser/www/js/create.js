$( document ).ready(function() {
    
    var lat = 0;
    var lng = 0;
    var postcodeValidator = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;

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
                    $('#propertiesList').append(`
                            <li>
                                <a  onClick="fullDetails(${ results.rows.item(i).propertyRef})">
                                    <div><img src="${results. rows.item(i).imgPath}" ></div>
                                    <h2><strong>£ ${ results.rows.item(i).monthFee} Pcm </strong></h2>
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

    // Method that call API end point to fectch addresses associated to the postcode entered 
    // If postcode is valid the list of addresses is append it to the DOM
    $.mobile.document.on( "click", "#find", function() {
        
            var apiKey = "vXOz9FPWLUa_3kJnSc8U1Q12813";
            var postCodeValue = $("#postcode").val();

            if (!(postCodeValue.match(postcodeValidator))) {
                alert("Postcode is invalid!");
                return false;
            }

            axios.get('https://api.getAddress.io/find/'+ postCodeValue +'?api-key='+ apiKey).then(function (response) {
                console.log(response);
                lat = response.data.latitude;  console.log(lat);
                lng = response.data.longitude; console.log(lng);
                var addressComponents = response.data.addresses;
                var addressComponentsOutput = `
                    <legend>Select Address</legend>
                        <select name="propertyAddress" id="propertyAddress" required="">
                            <option value="" hidden>Select</option> `;
                for(var i = 0;i < addressComponents.length;i++){
                    addressComponentsOutput += `
                            <option value="${dataFormatting (addressComponents[i])}">${ dataFormatting (addressComponents[i])}</option>`;
                }

                addressComponentsOutput += '</select>';
                document.getElementById('listAddresses').innerHTML= addressComponentsOutput;
            })
            .catch(function (error) {
                alert("An error occurred while fetching the data" + error );
            console.log(error);
            });
        
            //Method that formats the addresses obtained
            function dataFormatting(value){
                let splits = value.split(',', );
                return splits[0] + splits[1];
            } 
    }); 

    // The method below creates a property and store it into the database
    // Validation here is implemented such as checking property duplicates
    $("#addPropertyForm").submit(function(e) {
            today = Date.now();
            var myDate = new Date();

            var pType = $("#propertyType").val();
            var bQty = $("#bedQty").val();
            var avalabilityDate = $("#avalabilityDate").val();
            var avalabilityTime = $("#avalabilityTime").val();
            var monthFees = $("#montlyfee").val();
            var furnitureType = $("#furnitureType").val();
            var street = $("#propertyAddress").val();
            var postCode = $("#postcode").val();
            var notes = $("#notes").val();
            var postedBy = $("#postby").val();

            var CurrentDate = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate());
            var inputDate = new Date(avalabilityDate);
            

            if(furnitureType === ''){
                furnitureType = "To be Confirmed";
            }

            if (!(postCode.match(postcodeValidator))) {
                alert("Postcode is invalid!");
                return false;
            }
            

            dbHandler.dataBase.transaction(function (tx) {
                tx.executeSql("SELECT * FROM Properties WHERE street = ? AND postcode = ?", [street,postCode] , function (tx, results) {
                var checkDuplicate = results.rows.length, i;
                
                if (checkDuplicate > 0) {
                    alert("Property location already exists");
                }else if(inputDate < CurrentDate) {
                    alert("Invalid Date selected!");
                    return false;           
                }else{
                    var confirmation = confirm(
                        "Property Type: " 	+ pType + "\n" + 
                        "Bedrooms: " 			 	+ bQty + "\n" + 
                        "Property Avalability: " 	+ avalabilityDate + " " + avalabilityTime + "\n" + 
                        "Monthly Fees: " 			+ "£ "+ monthFees + "\n" + 
                        "Furniture Type: " 		+ furnitureType + "\n" + 
                        "Street: " 					+ street + "\n" + 
                        "Postcode: " 				+ postCode + "\n" + 
                        "Notes: " 					+ notes + "\n" +
                        "Posted by: " 				+ postedBy + "\n" );

                        var postRef= Math.floor((Math.random() * 1000000) + 1);
                        creationDate = new Date(today);
                        creationDate = (creationDate.getMonth()+1)+'/'+creationDate.getDate()+'/'+creationDate.getFullYear()+
                        ' '+(creationDate.getHours() > 12 ? creationDate.getHours() - 12 : creationDate.getHours())+':'+creationDate.getMinutes()+
                        ' '+(creationDate.getHours() >= 12 ? "PM" : "AM");

                        

                        if(confirmation == true){
                            e.preventDefault();
                            product.add(pType, bQty, avalabilityDate, creationDate, monthFees, furnitureType, 
                            street , postCode, notes, postedBy, postRef); 

                            let defaultImage =  "https://cdn.pixabay.com/photo/2018/03/25/23/08/home-3261131_1280.jpg";
                            propertyImage.add(defaultImage, defaultImage, defaultImage, postRef );

                            $("#propertyType").val("");
                            $("#bedQty").val("");
                            $("#avalabilityDate").val("");
                            $("#avalabilityTime").val("");
                            $("#montlyfee").val("");
                            $("#furnitureType").val("");
                            $("#propertyAddress").val("");
                            $("#postcode").val("");
                            $("#notes").val("");
                            $("#postby").val("");
                            $('#listAddresses').empty();
                            document.getElementById("addPropertyForm").reset();
                            loadData();
                        }else{
                            return false;
                        }
                }
        
            }, null);
        
            });
            e.preventDefault();
            e.stopPropagation();
            return false;             
    });

    
})