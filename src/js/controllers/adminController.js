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
	d3.event.preventDefault();
	document.getElementById("fileName").innerHTML= document.getElementById("exampleInputFile").value;

  getLogFile()
    .then(function(data) {
      console.log("Log:", data);
    });
}

function confirmClicked(){
	alert("The file has been updated!");
}

function getLogFile() {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();

    xhr.onload = function () {
      resolve(this.responseText);
    };
    xhr.onerror = function(e) {
      reject(e);
    };

    xhr.open("GET", "/admin/log");
    xhr.send();
  });
}
