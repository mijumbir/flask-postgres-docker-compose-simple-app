app.controller('loginController', ['$scope', '$http', function($scope, $http) {

	$scope.password = '';
	$scope.username = '';
	$scope.responseMessage = '';

	//--------------------------------------------------------------------------------------------//
	$scope.login = function() {
		// Parameters for request.
		var data = {
			username: $scope.username,
			password: $scope.password
		}

		// Get releases.
		$http.post('/api/user/login', data).then(function(response) {
			;	
		}, function(response) {

			if (response.status === 302) {
				window.location = response.data;
			}
			else {
				$scope.responseMessage = response.data;
			}
	        
    });
	}

}]);