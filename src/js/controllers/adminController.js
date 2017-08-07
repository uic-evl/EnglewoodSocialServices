"use strict";

console.log("we in nerds");

d3.select("#submitButton")
      .on("click", clickedButton);

d3.select("#confirmButton")
      .on("click", confirmClicked);

var input = document.getElementById("exampleInputFile").value;

// if(input.length != 0){
//       $('#modalAcceptButton').removeClass("disabled");
//     }
//     else{
//       $('#modalAcceptButton').addClass("disabled");
//     }


function clickedButton(){
	document.getElementById("fileName").innerHTML= document.getElementById("exampleInputFile").value;
}

function confirmClicked(){
	alert("The file has been updated!");
}