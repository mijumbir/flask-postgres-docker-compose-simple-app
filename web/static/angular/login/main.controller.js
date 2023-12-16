app.controller('mainController', ['$scope', '$timeout', function($scope, $timeout) {

	//--------------------------------------------------------------------------------------------//
	$scope.login = function() {

		window.location = '/login';

	}

	var slidesInSlideshow = 4;
    var slidesTimeIntervalInMs = 5000; 
  
  $scope.slideshow = 1;
  var slideTimer =
    $timeout(function interval() {
      $scope.slideshow = ($scope.slideshow % slidesInSlideshow) + 1;
      slideTimer = $timeout(interval, slidesTimeIntervalInMs);
    }, slidesTimeIntervalInMs);



}]);