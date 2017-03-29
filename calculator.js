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
        "startDate": "2017-03-01T07:00:00.000-0500",
        "endDate": "2019-07-01T07:00:00.000-0500",
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

    cCtl.startOfYear = function(month) {
      if (month.startsWith("1/1")) {
        return {  };
      }
    }

    cCtl.updateInput = function() {
      cCtl.input = angular.fromJson(cCtl.inputJson);
      updateEverything();  
    }

    function updateEverything() {
      cCtl.inputJson = angular.toJson(cCtl.input);
      var date = new Date(Date.parse(cCtl.input.startDate));
      console.log(date);
      var savings = {};
      cCtl.output = {};
      cCtl.outputTotals = {};

      for (var sType in cCtl.input.startingSavings) {
        savings[sType] = cCtl.input.startingSavings[sType];
      }

      var eDate = new Date(Date.parse(cCtl.input.endDate));
      while (date <= eDate) {
        var thisMonth = date.getMonth() + 1;
        date.setMonth(thisMonth);
        var thisDate = new Date(date).toLocaleDateString("en-US");
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
            if (thisMonth == m) {
              savings[sType] += yNumbers[m][0];
            }
          }

          cCtl.output[thisDate][sType] = savings[sType];
          cCtl.outputTotals[thisDate] += savings[sType];
        }
      }
    }
  });
