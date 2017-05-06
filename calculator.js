angular.module('todoApp', ['ngCookies', 'chart.js'])
  .controller('CalculatorController', function($http, $cookies, $timeout) {
    var cCtl = this;
    cCtl.graph = {};
    cCtl.showDetails = {};

    // Options for Chart.JS graph
    cCtl.chartOptions = {
      scales: { 
        yAxes: [
          { 
            stacked: true,
            ticks: {
              callback: function(value, index, values) {
                return value.toLocaleString("en-US",{style:"currency", currency:"USD"});
              }
            }
          }
        ], 
        xAxes: [{ stacked: true }] 
      },
      legend: {
          display: true
      }      
    };

    // If this cookie is set, user has saved input before
    if ($cookies.get("input")) {
      cCtl.savedInput = true;
    }

    // If no cookie value, get data from input.sample.json
    if (!cCtl.input) {
      $http.get('input.sample.json')
      .then(function(response) {
        cCtl.input = response.data;                
        updateEverything();
      })
      .catch(function(response) {
        // If we can't read from input.json 
        // (run locally from file://), use JS defaults
        cCtl.input = loadDefault();
        updateEverything();
      });
    }

    // Return a default object for input
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
          "Cash": [
            [5000, "Salary", {}],
            [-1000, "Fed taxes", {}],
            [-500, "Social security & Medicare", {}],
            [-500, "401K from salary", {}],
            [-1000, "House mortgage", {"end": "2018-9"}],
            [5001, "Bonus", {"start": "2017-6", "recurs": 6}]
          ],
          "401K": [
            [1000, "Savings", {}]
          ],
          "House": [
            [800, "Ownership", {"end": "2018-10"}]
          ]
        },
        "yearlyNumbers": {
          "Cash": {
            "2": [5000, "Annual bonus"],
            "7": [-1000, "House taxes"]
          }
        },
        "annualIncreases": {
          "401K": 5
        },
        "specialNumbers": {
          "Cash": {
            "2017-9": [-10000, "Big expense"],
            "2018-4": [2000, "Friend paid me back"],
            "2018-7": [-900, "House repairs"]
          }
        }
      };
    }

    // Is this start of the year?
    cCtl.startOfYear = function(date) {
      return fromDate(date).month == 1;
    }

    // Convert from string to date object
    function fromDate(str) {
      var arr = str.split("-");
      return { "year": parseInt(arr[0]), "month": parseInt(arr[1]) };
    }

    // Convert to string from date object
    function toDate(yyyy, mm) {
      return "" + yyyy + "-" + mm;
    }

    // Check difference between two string objects
    function dateDiff(str1, str2) {
      var d1 = fromDate(str1);
      var d2 = fromDate(str2); 
      return 12 * (d1.year - d2.year) + d1.month - d2.month;
    }

    // Save input JSON to a cookie
    cCtl.saveInput = function() {
      cCtl.savedMessage = "Saving...";
      deleteSavedMessage();
      $cookies.put("input", cCtl.inputJson);
      cCtl.savedInput = true;
    }

    // Load input JSON from a cookie
    cCtl.loadInput = function() {
      cCtl.savedMessage = "Loading...";
      deleteSavedMessage();
      var cookieInput = $cookies.get("input");
      if (cookieInput) {
        cCtl.input = JSON.parse(cookieInput);
        updateEverything();
      }
    }

    // Delete the stored cookie
    cCtl.deleteInput = function() {
      $cookies.remove("input");
      cCtl.savedInput = false;
    }

    // Show the user that we are deleting the input locally
    function deleteSavedMessage() {
      $timeout(function() { delete cCtl.savedMessage; }, 100);      
    }

    // Update input parameters by loading from JSON string
    cCtl.updateInput = function() {
      cCtl.input = angular.fromJson(cCtl.inputJson);
      updateEverything();  
    }

    // Main internal function that updates all data structures
    // from updated JSON input.
    function updateEverything() {
      cCtl.inputJson = angular.toJson(cCtl.input);

      // Calculate internal start and end date objects
      var startDate = fromDate(cCtl.input.startDate);
      var startYear = startDate.year;
      var startMonth = startDate.month;

      var endDate = fromDate(cCtl.input.endDate);
      var endYear = endDate.year;
      var endMonth = endDate.month;

      // Initialize variables and objects
      var savings = {};
      cCtl.output = {};
      cCtl.outputTotals = {};
      cCtl.details = {};

      cCtl.graph.data = [];
      cCtl.graph.labels = [];
      cCtl.graph.series = [];

      // Use startingSavings numbers for local objects
      for (var sType in cCtl.input.startingSavings) {
        savings[sType] = cCtl.input.startingSavings[sType];
        cCtl.graph.series.push(sType);
        cCtl.graph.data.push([]);
      }

      // Make a copy to keep track of recurring numbers
      var copyForRecurs = angular.copy(cCtl.input.monthlyNumbers);

      // Iterate over each year from start to end
      for (var year = startYear; year <= endYear; year++) {
        // If we are over the final year, quit
        if (year > endYear) break;

        // Initialize objects for this year
        cCtl.output[year] = {};
        cCtl.outputTotals[year] = {};
        cCtl.details[year] = {};

        // Iterate over every month for this year
        for (var month = 1; month <= 12; month++) {
          // If we are before the first month, continue
          if (year == startYear && month < startMonth) continue;
          // If we are after the last month, quit
          if (year == endYear && month == endMonth) break;

          // Initalize parameters for this month
          var thisDate = toDate(year, month);
          cCtl.graph.labels.push(thisDate);

          cCtl.output[year][month] = {};
          cCtl.details[year][month] = {};
          cCtl.outputTotals[year][month] = 0.0;

          var i = 0;
          // For each category in savings
          for (var sType in cCtl.input.startingSavings) {
            cCtl.details[year][month][sType] = {};

            var savingsThisMonth = 0.0;
            var mNumbers = cCtl.input.monthlyNumbers[sType];
            // For each monthly income or expense related to this category
            for (var count in mNumbers) {
              var number = mNumbers[count][0];
              var comment = mNumbers[count][1];
              var metadata = mNumbers[count][2];

              // Is there a start date meta-data for this income-expense?
              var mStart = metadata['start'];
              if (mStart && dateDiff(thisDate, mStart) < 0) continue;  

              // Is there an end date meta-data for this income-expense?
              var mEnd = metadata['end'];
              if (mEnd && dateDiff(thisDate, mEnd) > 0) continue;  

              // Does this income-expense recur every few months?
              var mRecurs = metadata['recurs'];
              if (mRecurs) {
                // Get handle to clone object to keep track of recurring
                var rObj = copyForRecurs[sType][count][2];
                rObj.recurs--;
                if (rObj.recurs == 0) {
                  rObj.recurs = mRecurs;
                }
                if (rObj.recurs != mRecurs - 1) {
                  continue;
                }
              }

              // Add up the savings, as well as detailed breakdown
              savingsThisMonth += number;
              cCtl.details[year][month][sType][comment] = number;
            }
            savings[sType] += savingsThisMonth;

            // Is there an annual percentage increase for this number
            var aIncreases = cCtl.input.annualIncreases[sType];
            if (aIncreases) {
              var oldNumber = savings[sType];
              // Approximate the annual percentage increase per month
              savings[sType] *= 1 + (aIncreases / (100*12*1.4));
              cCtl.details[year][month][sType]["Monthly increase"] = savings[sType] - oldNumber;
            }

            // Are there yearly income-expense numbers for this category?
            var yNumbers = cCtl.input.yearlyNumbers[sType];
            for (var m in yNumbers) {
              // Do those numbers apply for this month?
              if (month == m) {
                var number = yNumbers[m][0];
                var comment = yNumbers[m][1];
                savings[sType] += number;
                cCtl.details[year][month][sType][comment] = number;
              }
            }

            // Are there special one-off income-expense numbers for this category?
            var sNumbers = cCtl.input.specialNumbers[sType];
            for (var ym in sNumbers) {
              // Do they apply to this year-month?
              if (toDate(year, month) == ym) {
                var number = sNumbers[ym][0];
                var comment = sNumbers[ym][0];
                savings[sType] += number;
                cCtl.details[year][month][sType][comment] = number;
              }
            }

            // Finalize the calculated numbers
            cCtl.output[year][month][sType] = savings[sType];
            cCtl.graph.data[i++].push(savings[sType]);
            cCtl.outputTotals[year][month] += savings[sType];
          }
        }
      }
    }
  });
