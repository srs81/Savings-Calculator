angular.module('todoApp', ['ngCookies', 'chart.js'])
  .controller('CalculatorController', function($http, $cookies) {
    var cCtl = this;
    cCtl.graph = {};


    $http.get('input.json')
    .then(function(response) {
      cCtl.input = response.data;                
      updateEverything();
    })
    .catch(function(response) {
      cCtl.input = $cookies.get("input");
      if (!cCtl.input) {
        cCtl.input = loadDefault();
      }
      updateEverything();
    });

    function loadDefault() {
      return {
        "startDate": "2017-3",
        "endDate": "2019-7",
        "startingSavings": {
          "Cash": 20000,
          "401K": 10000,
          "House": 40000
        },
        "monthlyNumbers": {
          "Cash": {
            "Salary": [5000, {}],
            "Fed taxes": [-1000, {}],
            "Social security & Medicare": [-500, {}],
            "401K from salary": [-500, {}],
            "House mortgage": [-1000, {"end": "2018-9"}]
          },
          "401K": {
            "Savings": [1000, {}]
          },
          "House": {
            "Ownership": [800, {"end": "2018-10"}]
          }
        },
        "yearlyNumbers": {
          "Cash": {
            "2": 5000,
            "7": -1000
          }
        },
        "annualIncreases": {
          "401K": 5
        },
        "specialNumbers": {
          "Cash": {
            "2017-9": 1000,
            "2018-4": 1500,
            "2018-7": -900
          }
        }
      };
    }

    cCtl.startOfYear = function(date) {
      return fromDate(date).month == 1;
    }

    function fromDate(str) {
      var arr = str.split("-");
      return { "year": parseInt(arr[0]), "month": parseInt(arr[1]) };
    }

    function toDate(yyyy, mm) {
      return "" + yyyy + "-" + mm;
    }

    function dateDiff(str1, str2) {
      var d1 = fromDate(str1);
      var d2 = fromDate(str2); 
      return 12 * (d1.year - d2.year) + d1.month - d2.month;
    }

    cCtl.updateInput = function() {
      cCtl.input = angular.fromJson(cCtl.inputJson);
      updateEverything();  
    }

    function updateEverything() {
      cCtl.inputJson = angular.toJson(cCtl.input);
      $cookies.put("input", cCtl.inputJson);

      var startDate = fromDate(cCtl.input.startDate);
      var startYear = startDate.year;
      var startMonth = startDate.month;

      var endDate = fromDate(cCtl.input.endDate);
      var endYear = endDate.year;
      var endMonth = endDate.month;

      var savings = {};
      cCtl.output = {};
      cCtl.outputTotals = {};

      cCtl.graph.data = [];
      cCtl.graph.labels = [];
      cCtl.graph.series = [];

      for (var sType in cCtl.input.startingSavings) {
        savings[sType] = cCtl.input.startingSavings[sType];
        cCtl.graph.series.push(sType);
        cCtl.graph.data.push([]);
      }

      for (var year = startYear; year <= endYear; year++) {
        if (year > endYear) break;
        cCtl.output[year] = {};
        cCtl.outputTotals[year] = {};

        for (var month = 1; month <= 12; month++) {
          if (year == startYear && month < startMonth) continue;
          if (year == endYear && month == endMonth) break;

          var thisDate = toDate(year, month);
          cCtl.graph.labels.push(thisDate);

          cCtl.output[year][month] = {};
          cCtl.outputTotals[year][month] = 0.0;

          var i = 0;
          for (var sType in cCtl.input.startingSavings) {
            var savingsThisMonth = 0.0;
            var mNumbers = cCtl.input.monthlyNumbers[sType];
            for (var type in mNumbers) {
              var number = mNumbers[type][0];
              var metadata = mNumbers[type][1];

              var mStart = metadata['start'];
              if (mStart && dateDiff(thisDate, mStart) < 0) continue;  

              var mEnd = metadata['end'];
              if (mEnd && dateDiff(thisDate, mEnd) > 0) continue;  

              savingsThisMonth += number;
            }
            savings[sType] += savingsThisMonth;

            var aIncreases = cCtl.input.annualIncreases[sType];
            if (aIncreases) {
              savings[sType] *= 1 + (aIncreases / (100*12*1.4));
            }

            var yNumbers = cCtl.input.yearlyNumbers[sType];
            for (var m in yNumbers) {
              if (month == m) {
                savings[sType] += yNumbers[m];
              }
            }

            var sNumbers = cCtl.input.specialNumbers[sType];
            for (var ym in sNumbers) {
              if (toDate(year, month) == ym) {
                savings[sType] += sNumbers[ym];
              }
            }

            cCtl.output[year][month][sType] = savings[sType];
            cCtl.graph.data[i++].push(savings[sType]);
            cCtl.outputTotals[year][month] += savings[sType];
          }
        }
      }
    }
  });
