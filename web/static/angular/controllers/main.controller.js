app.controller('mainController', ['$scope', '$http', 'graphService', function($scope, $http, graphService) {

	$http.get('/api/initialise').then(function(response) {
      var data = response.data
      console.log(data)
      var width = 1500;
        var chart = d3.timeline()
          .beginning(1355752800000) // we can optionally add beginning and ending times to speed up rendering a little
          .ending(1355774400000)
          .stack() // toggles graph stacking
          .margin({left:70, right:30, top:0, bottom:0})
          ;
        var svg = d3.select("#timeline6").append("svg").attr("width", width)
          .datum(data).call(chart);

	});


	$scope.displayTags = function() {

   		var parameters = { params: { details: $scope.current_route } };
		$http.get('/api/get_system_details', parameters).then(function(response) {
			$scope.tags = response.data.tags
			$scope.search = response.data.search
			console.log($scope.tags)
			console.log($scope.search)
		});

		$scope.currentView = 'table';
        var table = document.getElementById("tableDiv");
        var tree = document.getElementById("chart");
        table.style.display = "block";
        tree.style.display = "none";

	}

}]);




