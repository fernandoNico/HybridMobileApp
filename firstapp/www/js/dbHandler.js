var dbHandler = {
    dataBase: null,
    createDataBase: function () {
    this.dataBase = window.openDatabase('RentalZ App', '1.0', 'RentalZ DB App', 10 * 1024 * 1024);
    this.dataBase.transaction(
       function(tx) {
           tx.executeSql(`CREATE TABLE IF NOT EXISTS Properties 
           (id integer primary key, propertyType text, bedQty integer, avalabilityDate text, createdOn text, monthFee integer,
           furnitureType text, street text, postcode text, notes text, postedBy text, propertyRef integer)`,
           [], 
           function(txt, results) {},
           function(txt, error) {
               console.log(error.message + "in table creation")
               }
           ); 

          tx.executeSql(`CREATE TABLE IF NOT EXISTS Propertynotes 
           (id integer primary key, title text, desc text, postedOn text, postedBy text, postRef integer)`,
           [], 
           function(txt, results) {},
           function(txt, error) {
               console.log(error.message + "in table creation")
               }
           );

          tx.executeSql(`CREATE TABLE IF NOT EXISTS Propertyimages 
           (id integer primary key, imgName text, imgAlt text, imgPath text, postRef integer)`,
           [], 
           function(txt, results) {},
           function(txt, error) {
               console.log(error.message + "in table creation")
               }
           );  

       },
       function (error) {
          console.log(error.message) 
       },
       function () {
           console.log("DB created successfully!")   
       }
   );
 }
}


var product={
    add:function(propertyType, bedQty, avalabilityDate, createdOn, monthFee,furnitureType, street, postcode, notes, postedBy, propertyRef ){
      dbHandler.dataBase.transaction(
          function(tx){
             tx.executeSql(
                `Insert into properties 
                (propertyType, bedQty, avalabilityDate, createdOn , monthFee,
                furnitureType, street, postcode , notes , postedBy , propertyRef ) 
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [propertyType, bedQty, avalabilityDate, createdOn, monthFee,furnitureType, street, postcode, notes, postedBy, propertyRef],
                   function(tx, results){
                    alert("Post Saved Successfully");
                    window.location.href = "#list";	
                   },
                   function(tx, error){
                      console.log("adding error" + error.message);
                   }
                );
          },
          function(error){},
          function(error){}
       ); 
    }
 }

var propertyImage={
    add:function(  imgName, imgAlt, imgPath, postRef){
      dbHandler.dataBase.transaction(
          function(tx){
             tx.executeSql(
                `Insert into Propertyimages 
                (imgName, imgAlt, imgPath, postRef) 
                values (?, ?, ?, ?)`,
                [imgName, imgAlt, imgPath, postRef],
                   function(tx, results){
                    //alert("Image Saved Successfully!");
                   },
                   function(tx, error){
                      console.log(" error saving image" + error.message);
                   }
                );
          },
          function(error){},
          function(error){}
       ); 
    }
 }


 var note={
    add:function(  title, desc, postedOn, postedBy, postRef){
      dbHandler.dataBase.transaction(
          function(tx){
             tx.executeSql(
                `Insert into Propertynotes 
                (title, desc, postedOn, postedBy, postRef) 
                values (?, ?, ?, ?, ?)`,
                [title, desc, postedOn, postedBy, postRef],
                   function(tx, results){
                    alert("Note Saved Successfully");
                    // window.location.href = "#list";	
                   },
                   function(tx, error){
                      console.log("adding error" + error.message);
                   }
                );
          },
          function(error){},
          function(error){}
       ); 
    }
 }
