var machines = [];
var columns = ["Machine", "Status", "Remaining time", "Start time"];
var loading = document.getElementById("refresh");

var washRoom6 = "77.75.162.69";
var washRoom18 = "77.75.162.70";

var getWashRoomData = function() {
  chrome.storage.sync.get("washRoom", function(result) {
    var currentWashRoom = result.washRoom;

    var x = new XMLHttpRequest();
    switch (currentWashRoom) {
      case 6:
        x.open('GET', "http://"+washRoom6+"/Status.asp");
        break;
      case 18:
        x.open('GET', "http://"+washRoom18+"/Status.asp");
        break;
      default:
        x.open('GET', "http://"+washRoom6+"/Status.asp");
        currentWashRoom = 6;
      }

    x.responseType = 'document';
    x.onload = function() {
      machines = [];

      //Extract raw data from dirty HTML
      var response = x.response;
      var table = response.getElementsByTagName("table")[1];
      var trs = table.getElementsByTagName("tr");
      var skip = true;
      for (var i = 0; i < trs.length; i++) {
        if (skip) {
          skip = false;
          continue;
        }
        var tr = trs[i];
        tds = tr.getElementsByTagName("td")

        machines.push({
          0: tds[0].textContent.replace(/\s/g,'').replace(/VASK/gi,'Washing machine ').replace(/TUMBLER\s*/gi,'Tumbler '),
          //1: tds[1].textContent.replace(/\s/g,''),
          1: tds[2].textContent.replace(/\s/g,'').replace(/Fri/gi,'Free').replace(/Optaget/gi,'Occupied'),
          2: tds[3].textContent.replace(/\s/g,''),
          3: tds[4].textContent.replace(/\s/g,'')
        });
      }

      //Populate GUI
      var body = document.getElementsByTagName("body")[0];
      var table = document.createElement("table");
      var cellpadding = document.createAttribute("cellpadding");
      cellpadding.value = 0;
      var cellspacing = document.createAttribute("cellspacing");
      cellspacing.value = 0;
      table.setAttributeNode(cellpadding);
      table.setAttributeNode(cellspacing);

      //Start with the table header
      var th = document.createElement("thead");
      for (var i = 0; i < columns.length; i++) {
        var td = document.createElement("td");
        td.innerHTML = columns[i];
        th.appendChild(td);
      }
      table.appendChild(th);

      //Rest of data for table
      for (var i = 0; i < machines.length; i++) {
        var machine = machines[i];
        var tr = document.createElement("tr");
        for (var j = 0; j < Object.keys(machine).length; j++) {
          var td = document.createElement("td");
          td.innerHTML = machine[j];
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }

      //Clean GUI and add the newly generated table
      var tables = document.getElementsByTagName("table");
      for (var i = 0; i < tables.length; i++) {
        tables[i].remove();
      }
      body.appendChild(table);

      //Update loading icon
      loading.classList.remove("loading");

      //Update tab classes
      for (tab of document.getElementsByClassName("tab")) {
        tab.classList.remove("active");
      }
      document.getElementById("tab-building-"+currentWashRoom).classList.add("active");
    };

    x.onerror = function() {
      console.log('Network error.');
    };

    x.send();

    //Spin the loading icon while we wait for the data
    loading.classList.add("loading");
  });
};

var chooseWashroom = function (e) {
  switch (e.target.id) {
    case "tab-building-6":
      chrome.storage.sync.set({'washRoom': 6});
      getWashRoomData();
      break;
    case "tab-building-18":
      chrome.storage.sync.set({'washRoom': 18});
      getWashRoomData();
      break;
    default:
      getWashRoomData();
  }
}

//Adding Event listeners
document.addEventListener("DOMContentLoaded", chooseWashroom);
document.getElementById("refresh").addEventListener('click', getWashRoomData);
for (tab of document.getElementsByClassName("tab")) {
  tab.addEventListener('click', chooseWashroom);
}
