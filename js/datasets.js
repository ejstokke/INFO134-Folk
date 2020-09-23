//Konstruktør for befolkning
//Inneholder metodene getNames, getIDs, getInfo, load og onload (som er null)
//getNames/getIDs returnerer en en liste med kommunenavn/kommunenr,
//og tilordner også disse listene til objektet som en egenskap
function Dataset(url) {
  this.getNames = function() {
    this.names = Object.keys(this.dataset["elementer"]);
    return Object.keys(this.dataset["elementer"]);
  };
  this.getIDs = function() {
    var idList = [];
    for (var name in this.dataset["elementer"]) {
      idList.push(this.dataset["elementer"][name]["kommunenummer"])
    }
    this.IDs = idList;
    return idList;
  };
  this.getInfo = function(id) {
    for (var kommune in this.dataset["elementer"]) {
      var currentKommune = this.dataset["elementer"][kommune];
      if (currentKommune["kommunenummer"] == id) {
        var result = this.dataset["elementer"][kommune];
        result.name = kommune;
        return result;
      }
    }
  };
  this.load = function(object) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = xhr.responseText;
        object.dataset = JSON.parse(response);
        object.onload();
      }
    }
    xhr.send()
  };
  this.onload = function() {
    null;
  };
}

//Funksjon som kalles når bruker trykker send på detaljer.
//Inneholder to funksjoner:
//detailsOverview - henter informasjon om kommunen og returnerer verdien
//til et <textarea> i HTML-dokumentet.
//detailsTable - kaller getInfo-metoden på alle datasettene, sjekker hvilke
//år som er felles for alle datasettene og oppretter en tabell med
//informasjon for disse årene.
function createDetails(bef, sys, utd) {
  function detailsOverview() {
    var kommuneNummer = document.getElementById('detailsNr').value;
    var textArea = document.getElementById('detailsResult');

    try {
      var befolkningInfo = bef.getInfo(kommuneNummer);
      var sysselsatteInfo = sys.getInfo(kommuneNummer);
      var utdanningInfo = utd.getInfo(kommuneNummer);
      for (year in befolkningInfo["Menn"]) {
        var latestBef = year;
      };
      for (year in sysselsatteInfo["Begge kjønn"]) {
        var latestSys = year;
      };
      for (year in utdanningInfo["03a"]["Menn"]) {
        var latestUtd = year;
      };

      var totalPopulation = befolkningInfo["Menn"][latestBef] + befolkningInfo["Kvinner"][latestBef];
      var sysselsatteProsent = sysselsatteInfo["Begge kjønn"][latestSys];
      var sysselsatteAntall = Math.round((totalPopulation * sysselsatteProsent) / 100);

      function utdanningAntall(utdanning, befolkning) {
        return (befolkning / 100) * utdanning;
      };

      var kvinnerKort = utdanningAntall(utdanningInfo["03a"]["Kvinner"][latestUtd], befolkningInfo["Kvinner"][latestBef]);
      var kvinnerLang = utdanningAntall(utdanningInfo["04a"]["Kvinner"][latestUtd], befolkningInfo["Kvinner"][latestBef]);
      var mennKort = utdanningAntall(utdanningInfo["03a"]["Menn"][latestUtd], befolkningInfo["Menn"][latestBef]);
      var mennLang = utdanningAntall(utdanningInfo["04a"]["Menn"][latestUtd], befolkningInfo["Menn"][latestBef]);
      var totalUtdanningAntall = kvinnerKort + kvinnerLang + mennKort + mennLang;
      var utdanningProsent = (totalUtdanningAntall / totalPopulation) * 100;
      totalUtdanningAntall = Math.round(totalUtdanningAntall);
      utdanningProsent = Math.round(utdanningProsent * 100) / 100;

      textArea.value = "Kommune: " + befolkningInfo["name"] + "\n" + "KommuneNr: " + befolkningInfo["kommunenummer"] + "\n" + "Befolkning: " + totalPopulation + " (" + latestBef + ")" + "\n" + "Sysselsatte (antall): " + sysselsatteAntall + " (" + latestSys + ")" + "\n" +"Sysselsatte (prosent): " + sysselsatteProsent + "%" + "\n" + "Høyere utdanning (antall): " + totalUtdanningAntall + " (" + latestUtd + ")" + "\n" + "Høyere utdanning (prosent): " + utdanningProsent + "%";
    }

    catch (err) {
      textArea.value = "Ugyldig kommunenummer";
    }
  };
  function detailsTable() {
    try {
      var table = document.getElementById("detailsContent");
      table.innerHTML = null;
      var kommuneNummer = document.getElementById('detailsNr').value;
      var befInfo = bef.getInfo(kommuneNummer);
      var sysInfo = sys.getInfo(kommuneNummer);
      var utdInfo = utd.getInfo(kommuneNummer);
      var validYears = [];
      var td = "<td>";
      var tde = "</td>";

      for (year in befInfo["Menn"]) {
        if (year in sysInfo["Begge kjønn"] && year in utdInfo["01"]["Menn"]) {
          validYears.push(year);
        }
      }
      for (item in validYears) {
        var year = validYears[item];
        var tr = "<tr>" + td + "<strong>" + year + "</strong>" + tde;
        tr += td + befInfo["Menn"][year] + tde + td + befInfo["Kvinner"][year] + tde;
        tr += td + (befInfo["Menn"][year] + befInfo["Kvinner"][year]) + tde;
        tr += td + sysInfo["Menn"][year] + "%" + tde;
        tr += td + sysInfo["Kvinner"][year] + "%" + tde;
        tr += td + sysInfo["Begge kjønn"][year] + "%" + tde;
        tr += td + utdInfo["01"]["Menn"][year] + "%" + tde + td + utdInfo["01"]["Kvinner"][year] + "%" + tde;
        tr += td + utdInfo["02a"]["Menn"][year] + "%" + tde + td + utdInfo["02a"]["Kvinner"][year] + "%" + tde;
        tr += td + utdInfo["11"]["Menn"][year] + "%" + tde + td + utdInfo["11"]["Kvinner"][year] + "%" + tde;
        tr += td + utdInfo["03a"]["Menn"][year] + "%" + tde + td + utdInfo["03a"]["Kvinner"][year] + "%" + tde;
        tr += td + utdInfo["04a"]["Menn"][year] + "%" + tde + td + utdInfo["04a"]["Kvinner"][year] + "%" + tde;
        tr += td + utdInfo["09a"]["Menn"][year] + "%" + tde + td + utdInfo["09a"]["Kvinner"][year] + "%" + tde;
        tr += "</tr>";
        table.innerHTML += tr;
      }
    }
    catch {
    }
  }
  detailsOverview();
  detailsTable();
}

//Funksjon som kalles når bruker trykker "send" på sammenligning.
//Henter verdiene fra input-feltene og kaller på to indre funksjoner:
//createTable - oppretter en tabell med data fra Sysselsetting
//compareTable - som henter ut verdiene fra tabellene, sammenligner verdiene
//og erstatter den største verdien med seg selv innenfor <strong>-tagger.
function createComparison(sys) {
  var firstKommune = document.getElementById("compareIdOne").value;
  var secondKommune = document.getElementById("compareIdTwo").value;

  function createTable(kommuneNr, tableID, data, headerID) {
    try {
      var table = document.getElementById(tableID);
      var sysInfo = data.getInfo(kommuneNr);
      table.innerHTML = null;
      var tdIndex = 0;
      var yearCount = [];

      var header = document.getElementById(headerID);
      var headerVert = document.getElementById(headerID+"Vert");
      header.innerHTML = "Kommune: " + sysInfo["name"];
      headerVert.innerHTML = "Kommune: " + sysInfo["name"] + " (" + kommuneNr + ")";

      for (year in sysInfo["Menn"]) {
        var tr = "<tr>";
        tr += "<td>" + year + "</td>";
        tr += "<td>" + sysInfo["Menn"][year] + "%" + "</td>";
        tr += "<td>" + sysInfo["Kvinner"][year] + "%" + "</td>";
        tr += "<td id='" + sysInfo["name"] + tdIndex + "Menn'>" + "." + "</td>";
        tr += "<td id='" + sysInfo["name"] + tdIndex + "Kvinner'>" + "." + "</td>";
        tr += "</tr>";
        table.innerHTML += tr;
        tdIndex++;
        yearCount.push(year);
      };

      tdIndex = 1;
      for (year in sysInfo["Menn"]) {
        var nextYear = parseInt(year) + 1;
        var tdMenn = document.getElementById(sysInfo["name"] + tdIndex + "Menn");
        var tdKvinner = document.getElementById(sysInfo["name"] + tdIndex + "Kvinner");
        var sysGrowthMenn = sysInfo["Menn"][nextYear.toString()] - sysInfo["Menn"][year];
        var sysGrowthKvinner = sysInfo["Kvinner"][nextYear.toString()] - sysInfo["Kvinner"][year];
        sysGrowthMenn = Math.round(sysGrowthMenn * 10) /  10;
        sysGrowthKvinner = Math.round(sysGrowthKvinner * 10) /  10;

        tdMenn.innerHTML = sysGrowthMenn + "%";
        tdKvinner.innerHTML = sysGrowthKvinner + "%";
        tdIndex++;

        if (tdIndex === yearCount.length) {
          break;
        };
      };
    } catch {
      var header = document.getElementById(headerID);
      var headerVert = document.getElementById(headerID + "Vert");
      header.innerHTML = "Ugyldig kommunenummer";
      headerVert.innerHTML = "Ugyldig kommunenummer";
    };
  };
  function compareTables(firstKommuneNr, secondKommuneNr, data, gender) {
    try {
      var tdIndex = 1;
      var firstSysInfo = sys.getInfo(firstKommuneNr);
      var secondSysInfo = sys.getInfo(secondKommuneNr);
      while (tdIndex < 14) {
        var firstTd = document.getElementById(firstSysInfo["name"] + tdIndex + gender);
        var secondTd = document.getElementById(secondSysInfo["name"] + tdIndex + gender)
        var firstValue = parseFloat(firstTd.innerHTML);
        var secondValue = parseFloat(secondTd.innerHTML);

        if (firstValue > secondValue) {
          firstTd.innerHTML = "<strong>" + firstValue + "%</strong>";
        } else if (secondValue > firstValue) {
          secondTd.innerHTML = "<strong>" + secondValue + "%</strong>";
        };
        tdIndex++;
      };
    } catch {

    };
  };

  createTable(firstKommune, "compareContentOne", sys, "navn1");
  createTable(secondKommune, "compareContentTwo", sys, "navn2");
  compareTables(firstKommune, secondKommune, sys, "Menn");
  compareTables(firstKommune, secondKommune, sys, "Kvinner");
};

//Benytter Konstruktøren og tilordner objekter til respektive variabler
var sysselsatte = new Dataset("http://wildboy.uib.no/~tpe056/folk/100145.json");
var utdanning = new Dataset("http://wildboy.uib.no/~tpe056/folk/85432.json");
var befolkning = new Dataset("http://wildboy.uib.no/~tpe056/folk/104857.json");

//Tilordner en metode, createOverview til variablen befolkning.
//Denne metoden henter informasjon om alle kommuner i datasettet, regner ut
//den totale befolkningen og oppretter tabellen "Oversikt"
befolkning.createOverview = function() {
  var table = document.getElementById('overviewContent');
  for (element in this.dataset["elementer"]) {
    var kommune = this.getInfo(this.dataset["elementer"][element]["kommunenummer"]);
    var menn = kommune["Menn"];
    var kvinner = kommune["Kvinner"];
    for (year in menn) {
      var latest = year;
    };
    var malePopulation = menn[latest];
    var femalePopulation = kvinner[latest];
    var totalPopulation = malePopulation + femalePopulation;
    var tr = "<tr>" + "<td>" + kommune.name + "</td><td>";
    tr += kommune["kommunenummer"] + "</td><td>" + totalPopulation + "</td></tr>";
    table.innerHTML += tr;
  }
};

//Kaller createOverview()-metoden til befolkning når datasettet er lastet in.
befolkning.onload = function() {
  this.createOverview();
};

window.onload = function() {
  sysselsatte.load(sysselsatte);
  utdanning.load(utdanning);
  befolkning.load(befolkning);
}
