var machines = [];
var columns = ["Machine", "Status", "Remaining time", "Start time"];
var loading = document.getElementById("refresh");

var refresh = function() {
  var x = new XMLHttpRequest();
  x.open('GET', "http://77.75.162.69/Status.asp");
  x.responseType = 'document';
  x.onload = function() {
    machines = [];

    //Extract raw data from dirty HTML
    var response = x.response;
    console.log(response);
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
        0: tds[0].textContent.replace(/\s/g,'').replace(/VASK/g,'Washing machine ').replace(/TUMBLER/g,'Tumbler '),
        //1: tds[1].textContent.replace(/\s/g,''),
        1: tds[2].textContent.replace(/\s/g,'').replace(/Fri/g,'Free').replace(/Optaget/g,'Occupied'),
        2: tds[3].textContent.replace(/\s/g,''),
        3: tds[4].textContent.replace(/\s/g,'')
      });
    }

    //Clean GUI
    var tables = document.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      tables[i].remove();
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

    body.appendChild(table);

    //Hide the loading icon
    loading.classList.remove("loading");
  };

  x.onerror = function() {
    console.log('Network error.');
  };

  x.send();
  //Show the loading icon while we wait for the data
  loading.classList.add("loading");
};

document.addEventListener('DOMContentLoaded', refresh);

document.getElementById("refresh").addEventListener('click', refresh);
