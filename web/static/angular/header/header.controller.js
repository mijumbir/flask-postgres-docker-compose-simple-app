app.controller('headerController', ['$scope', '$http', '$location', function($scope, $http, $location) {

	// Variables.
	//	= 'config' contains information such as which nav elements should be included in the navbar.
	//	- 'currentUser' is the name of the user currently logged in.
	// 	- 'headerTitle' is the title dispayed in the top left corner of the header.
	//	- 'currentView' refers to the current view - e.g. Reliability, Quality, etc.
	//	- 'currentSubview' refers to the page in that view - e.g. SRGM, release-over-release, etc.
	$scope.config = {};
	$scope.currentUser = undefined;
	$scope.headerTitle = undefined;
	var currentView = undefined;
	var currentSubview = undefined;

	//------------------------------------- Header Settings --------------------------------------//
	//--------------------------------------------------------------------------------------------//
		$http.get('/api/header/get-header-config').then(function(response) {
			$scope.config = response.data;
		});


	//------------------------------- Header Title & Active State ---------------------------------//
	//--------------------------------------------------------------------------------------------//
	// Split URL using '/', giving us each component of the current path.
	$scope.components = $location.absUrl().split('/');

	console.log($scope.components)

	// If we are on the settings page, we don't need to worry about what view we are on.
	if ($scope.components[$scope.components.length - 3].toLowerCase() == 'settings') {

		var currentView = $scope.components[$scope.components.length - 2].toLowerCase();
		var currentSubview = $scope.components[$scope.components.length - 1].toLowerCase();

		// For the settings page, each page is prefixed with 'Settings - '
		$scope.headerTitle = 'Settings - ';

		// Use currentView and currentSubciew to set headerTitle.
		$scope.headerTitle += {
			'project': {
				'release-dates': 'Release Dates',
				'story-point-dates': 'Story Point Dates',
				'composite-releases': 'Composite Releases',
				'composite-$scope.components': 'Composite Components',
				'composite-severities': 'Composite Severities',
				'composite-locations': 'Composite Locations'
			},
			'quality': {
				'srgm-parameters': 'SRGM Parameters',
				'srgm-filters': 'SRGM Filters'
			},
			'pmv': {
				'pmv-parameters': 'PMV Parameters',
				'pmv-filters': 'PMV Filters'
			},
			'edp': {
				'edp1-parameters': 'EDP1 Parameters',
				'edp2-parameters': 'EDP2 Parameters',
				'edp3-parameters': 'EDP3 Parameters'
			},
			'users': {
				'user-permissions': 'User Permissions'
			}
		}[currentView][currentSubview];
	}

	// If we are not on settings page, we must determine what view we are on.
	else {
		var currentView = $scope.components[$scope.components.length - 2].toLowerCase();
		var currentSubview = $scope.components[$scope.components.length - 1].toLowerCase();

		// Use currentView to set headerTitle.
		$scope.headerTitle = { 
			'quality': '| BRACE: Quality View',
			'project-management-view': '| BRACE: Project Management View', 
			'early-defect-prediction': '| BRACE: Early Defect Prediction',
			'saoi': '| SAOI: Escaped Defect Analysis',
		}[currentView];

		// $scope.headerTitle = { 
		// 	'quality': 'Quality View',
		// 	'project-management-view': 'Project Management View', 
		// 	'early-defect-prediction': 'Early Defect Prediction',
		// 	'saoi': 'Escaped Defect Analysis',
		// }[currentView];
	}

	// Function to determine whether a view is the current view. 
	$scope.checkActiveView = function(view) {
		if ($scope.components[$scope.components.length - 3].toLowerCase() != 'settings') {
			return view === currentView ? 'active' : '';
		}
		else {
			return false;
		}
	};

	// Function to determine whether a subview is the current subview. 
	$scope.checkActiveSubview = function(view, subview) {
		if ($scope.components[$scope.components.length - 3].toLowerCase() != 'settings') {
			return (view === currentView) && (subview === currentSubview) ? 'active' : '';
		}
		else {
			return false;
		}
	};

}]);