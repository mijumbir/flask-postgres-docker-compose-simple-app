app.controller('systemsController', ['$scope', '$http', 'graphService', 'graphService', function($scope, $http, graphService) {

    $scope.systems = undefined;
	//$scope.current_route = undefined;
	//$scope.currentView = undefined;
	//$scope.tags = undefined;
	//$scope.search = undefined;
	//$scope.selected_system = undefined;
	$scope.system_list = undefined;
	//$scope.selected_plt = undefined;
	$scope.plt_list = undefined;


	var defaultSort = 'Alias';
    $scope.tags = [];
    //$scope.msg = "";
    $scope.sort = defaultSort;
    $scope.reverse = false;
    $scope.selectedPageSize = 20;
    $scope.pageSizes = [20, 100, 250];
    $scope.currentPage = 0;
    //$scope.pages = [1, 2, 3, 4];

    $scope.new_system = {'building' : '','system_name' : '', 'system_code':'', 'equipment_name':'', 'equipment_code':'', 'comment':''};

	$http.get('/api/all_systems').then(function(response) {
	        $scope.systems = response.data.system_list
	        console.log($scope.systems)
	});

    $scope.save_system = function() {
            console.log("save system..........")
            console.log($scope.new_system)
    }

    $scope.setSort = function(sort) {
      if ($scope.sort === sort) {
        $scope.reverse = !$scope.reverse;
      }
      if ($scope.sort !== undefined) {
        $scope.sort = sort;
      }
    }

    //save system (create & update)
    $scope.savesystem = function(system, index) {
      if (system.editMode) {
         console.log(system)
         console.log("INDEX: "+index)


//        var parameters = { params: { details: system} };
//        $http.get('/api/update_tag', parameters).then(function(response) {
//			console.log(response.data)
//		});
//
//		system.editMode = false;
//        $scope.sort = defaultSort;
//
//      } else {
//        console.log("Tag Already Saved !!!!!!!!")
//
//
        system.editMode = false;
     }

    }

    //bulk update tags
    $scope.bulkUpdatetags = function() {
      for (var i = 0; i < $scope.tags.length; i++) {
        var system = $scope.tags[i];
        if (system.editMode) {
          $scope.savetag(system, i);
        }
      }
    }

    //var lastEditedtag={};
    //edit system details
    $scope.editsystem = function(system) {
      //angular.extend(lastEditedtag,system);
      system.editMode = true;
      $scope.sort = undefined;
    }

    //cancel
    $scope.cancel = function(system) {
      //getAlltags();
      system.editMode = false;

      //angular.extend(system,lastEditedtag);
    }

    //delete system
    $scope.deletesystem = function(system, index) {
    console.log("DELETE: ", system, index)
      $scope.tags = [];
      tagsSvc.deletetag(system, index)
        .then(function(response) {
          system.editMode = false;
          refreshtags();
          notificationService.success("system deleted successfully.");
        }, function(response) {
          $scope.msg = response;
        });
    }


}]);




