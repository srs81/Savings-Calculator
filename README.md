# Savings Calculator

A free, open-source, browser-based savings calculator written in AngularJS 1.x. Written in HTML, CSS, Javascript (AngularJS). No backend technologies involved.

You can use it for calculating savings, net worth, profit / loss, income / expenses, etc. It can be used for personal and business finances.

This is meant to be run in your browser as a as a fully HTML / JS application, either online here on Github Pages, or locally on your computer. This has no dependencies on any backend service, and rendering is done fully in your browser.

## [Demo](https://srs81.github.io/Savings-Calculator/calculator.html)

You can run a [demo right here on Github pages](https://srs81.github.io/Savings-Calculator/calculator.html) using the link above. 

Note that when you update the JSON input, the values are rendered entirely in the browser. There is no backend call. 

## Technologies used

* [AngularJS 1.x](https://angularjs.org/)
* [Chart.JS](http://www.chartjs.org/) and [Angular-Chart](http://jtblin.github.io/angular-chart.js/) for charts
* Cookies for local storage: only used if you specifically choose to save the parameters.
* JSON for parameter input

The parameters are input using the JSON format documented below. A sample is pre-loaded when you load the page, and you can use that to customize and play with the JSON.

The "Save" and "Load" buttons basically save the JSON parameters in your local browser. Again, no backend technologies are used for this.

## JSON parameters

Currently, you need to input parameters into the application as pure JSON. There may be a GUI in the future to generate this JSON, but for now, you will have to input the JSON yourself by adjusting parameters in the sample JSON, and then saving locally on your computer if you need to reload it as some point.

The input JSON is one dictionary with these elements:

* **startDate**: Start month for calculations, expressed in yyyy-mm (year-month) format.
* **endDate**: End month for calculations, expressed in yyyy-mm (year-month) format.
* **startingSavings**: A dictionary with the starting amount of each category. You can have multiple categories here.
* **monthlyNumbers**: A dictionary with the income / expenses for each category here. Each entry consists of three elements
	* Number (can be positive for income, negative for expenses)
	* Description
	* Dictionary of meta-data. This meta-data lets you specify when an income / expense starts, ends or recurs.
* **yearlyNumbers**: A dictionary of yearly updates (as opposed to monthly above). For each category, you can specify the month of the year in which you have a corresponding income or expense.
* **annualIncreases**: A dictionary of percentage increases for each category.
* **specialNumbers**: A dictionary of special-case income or expenses in a particular month. You can use this for one-time revenue or expenses.

## JSON example

Here is a very simple example for the format you can enter. A sample JSON that is somewhat more complex is also included when you load the application in your browser.

	  {
	    "startDate": "2017-3",
	    "endDate": "2019-7",
	    "startingSavings": { "Cash": 20000 },
	    "monthlyNumbers": {
	      "Cash": [
	        [5000, "Salary", {}],
	        [-1000, "Fed taxes", {}]
	      ]
	    },
	    "yearlyNumbers": {
	      "Cash": { "2": [5000, "Annual bonus in February"] }
	    },
	    "annualIncreases": {
	      "Cash": 1
	    },
	    "specialNumbers": {
	      "Cash": {
	        "2017-9": [-10000, "Big expense"],
	        "2018-4": [2000, "Friend paid me back"]
	      }
	    }
	  }
