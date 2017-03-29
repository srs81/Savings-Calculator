angular.module('todoApp', [])
  .controller('CalculatorController', function($http) {
    var cCtl = this;

    $http.get('input.json')
    .then(function(response) {
      cCtl.input = response.data;                
      updateEverything();
    })
    .catch(function(response) {
      cCtl.input = loadDefault();
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
            "Salary": 5000,
            "Fed taxes": -1000,
            "Social security & Medicare": -500,
            "401K from salary": -500,
            "House mortgage": -1000
          },
          "401K": {
            "Savings": 1000
          },
          "House": {
            "Ownership": 800
          }
        },
        "yearlyNumbers": {
          "Cash": {
            "2": 5000,
            "3": 5000,
            "7": -1000
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

    cCtl.updateInput = function() {
      cCtl.input = angular.fromJson(cCtl.inputJson);
      updateEverything();  
    }

    function updateEverything() {
      cCtl.inputJson = angular.toJson(cCtl.input);

      var startDate = fromDate(cCtl.input.startDate);
      var startYear = startDate.year;
      var startMonth = startDate.month;

      var endDate = fromDate(cCtl.input.endDate);
      var endYear = endDate.year;
      var endMonth = endDate.month;

      var savings = {};
      cCtl.output = {};
      cCtl.outputTotals = {};

      for (var sType in cCtl.input.startingSavings) {
        savings[sType] = cCtl.input.startingSavings[sType];
      }

      for (var year = startYear; year <= endYear; year++) {
        if (year > endYear) break;

        for (var month = startMonth; month <= 12; month++) {
          if (year == startYear && month < startMonth) continue;
          if (year == endYear && month == endMonth) break;

          var thisDate = toDate(year, month);

          cCtl.output[thisDate] = {};
          cCtl.outputTotals[thisDate] = 0.0;

          for (var sType in cCtl.input.startingSavings) {
            var savingsThisMonth = 0.0;
            var mNumbers = cCtl.input.monthlyNumbers[sType];
            for (var type in mNumbers) {
              var number = mNumbers[type];
              savingsThisMonth += number;
            }
            savings[sType] += savingsThisMonth;
            if (sType == "401K") {
              savings[sType] *= 1.005;
            }

            var yNumbers = cCtl.input.yearlyNumbers[sType];
            for (var m in yNumbers) {
              if (month == m) {
                savings[sType] += yNumbers[m];
              }
            }

            cCtl.output[thisDate][sType] = savings[sType];
            cCtl.outputTotals[thisDate] += savings[sType];
          }
        }
      }
    }
  });
