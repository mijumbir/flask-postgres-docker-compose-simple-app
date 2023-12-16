app.controller('tagsController', ['$scope', '$http', 'graphService', 'graphService', function($scope, $http, graphService) {

    $scope.systems = undefined;
	$scope.current_route = undefined;
	$scope.currentView = undefined;
	$scope.tags = undefined;
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
    $scope.selectedPageSize = 100;
    $scope.pageSizes = [50, 100, 250];
    $scope.currentPage = 0;
    //$scope.pages = [1, 2, 3, 4];


    $scope.modernBrowsers = [
        {icon: 'img', name: "Opera", maker: "(Opera Software)", ticked: true},
        {icon: 'img', name: "Internet Explorer", maker: "(Microsoft)", ticked: false},
        {icon: 'img', name: "Firefox", maker: "(Mozilla Foundation)", ticked: true},
        {icon: 'img', name: "Safari", maker: "(Apple)", ticked: false},
        {icon: 'img', name: "Opera", maker: "(Opera Software)", ticked: true},
        {icon: 'img', name: "Internet Explorer", maker: "(Microsoft)", ticked: false},
        {icon: 'img', name: "Firefox", maker: "(Mozilla Foundation)", ticked: true},
        {icon: 'img', name: "Safari", maker: "(Apple)", ticked: false},
        {icon: 'img', name: "Opera", maker: "(Opera Software)", ticked: true},
        {icon: 'img', name: "Internet Explorer", maker: "(Microsoft)", ticked: false},
        {icon: 'img', name: "Firefox", maker: "(Mozilla Foundation)", ticked: true},
        {icon: 'img', name: "Safari", maker: "(Apple)", ticked: false},
        {icon: 'img', name: "Chrome", maker: "(Google)", ticked: true}
    ];



	$http.get('/api/all_tags').then(function(response) {


        	$scope.tags = response.data.tags
	        //$scope.selected_system = response.data.selected_system
	        $scope.system_list = response.data.system_list
	        //$scope.selected_plt = response.data.selected_plt
	        $scope.plt_list = response.data.plt_list
			//$scope.search = response.data.search
			//console.log($scope.tags)
			//console.log($scope.systems)
	});

    $scope.plt_change = function() {
            //console.log($scope.output_plt_list)
            var parameters = { params: {plt_list:$scope.output_plt_list} };
            $http.get('/api/update_sys_list', parameters).then(function(response) {
               //console.log($scope.system_list )
			   $scope.system_list = response.data.sys_list
			   //console.log($scope.system_list )


			var selected_plt_list = []
            var selected_sys_list = []
            angular.forEach( $scope.system_list, function( value, key ) {
                if(value.ticked == true){selected_sys_list.push(value.name)}
                //selected_sys_list.push(value.name)
           });
           angular.forEach( $scope.output_plt_list, function( value, key ) {
                selected_plt_list.push(value.name)
           });
            var parameters = { params: {sys_list:selected_sys_list, plt_list:selected_plt_list} };
            $http.get('/api/update_plt_list', parameters).then(function(response) {
			$scope.tags = response.data.tags
		});






    		});

    }


    $scope.sys_change = function() {
            var selected_plt_list = []
            var selected_sys_list = []
            angular.forEach( $scope.output_sys_list, function( value, key ) {
                if(value.ticked == true){selected_sys_list.push(value.name)}
                //selected_sys_list.push(value.name)
           });
           angular.forEach( $scope.output_plt_list, function( value, key ) {
                if(value.ticked == true){selected_plt_list.push(value.name)}
           });
            var parameters = { params: {sys_list:selected_sys_list, plt_list:selected_plt_list} };
            $http.get('/api/update_plt_list', parameters).then(function(response) {
			$scope.tags = response.data.tags
		});
    }


    $scope.filter_tags = function() {
            var selected_plt_list = []
            var selected_sys_list = []
            angular.forEach( $scope.output_sys_list, function( value, key ) {
                //if(value.ticked == true){selected_sys_list.push(value.name)}
                if(value.ticked == true){selected_sys_list.push(value.name)}
           });
           angular.forEach( $scope.output_plt_list, function( value, key ) {
                if(value.ticked == true){selected_plt_list.push(value.name)}
           });
           //$scope.system_list = new_list
           //console.log(selected_plt_list)
           //console.log(selected_sys_list)

           var parameters = { params: {sys_list:selected_sys_list, plt_list:selected_plt_list} };
            $http.get('/api/update_plt_list', parameters).then(function(response) {
			$scope.tags = response.data.tags
		});
    }

    $scope.setSort = function(sort) {
      if ($scope.sort === sort) {
        $scope.reverse = !$scope.reverse;
      }
      if ($scope.sort !== undefined) {
        $scope.sort = sort;
      }
    }

    //save tag (create & update)
    $scope.savetag = function(tag, index) {
      if (tag.editMode) {
         console.log(tag)
         console.log("INDEX: "+index)


        var parameters = { params: { details: tag} };
        $http.get('/api/update_tag', parameters).then(function(response) {
			console.log(response.data)
		});


        $scope.sort = defaultSort;


//        tagsSvc.updatetag(tag, index)
//          .then(function() {
//            notificationService.success("tag updated successfully.");
//          }, function(response) {
//            $scope.msg = response;
//          });
      } else {
        console.log("Tag Already Saved !!!!!!!!")

      }

//       else {
//        tagsSvc.createtag(tag)
//          .then(function() {
//            notificationService.success("tag created successfully.");
//          }, function(response) {
//            $scope.msg = response;
//          });
//      }

        tag.editMode = false;
    }

    //bulk update tags
    $scope.bulkUpdatetags = function() {
      for (var i = 0; i < $scope.tags.length; i++) {
        var tag = $scope.tags[i];
        if (tag.editMode) {
          $scope.savetag(tag, i);
        }
      }
    }

    //var lastEditedtag={};
    //edit tag details
    $scope.edittag = function(tag) {
      //angular.extend(lastEditedtag,tag);
      tag.editMode = true;
      $scope.sort = undefined;
    }

    //cancel
    $scope.cancel = function(tag) {
      //getAlltags();
      tag.editMode = false;

      //angular.extend(tag,lastEditedtag);
    }

    //delete tag
    $scope.deletetag = function(tag, index) {
    console.log("DELETE: ", tag, index)
      $scope.tags = [];
      tagsSvc.deletetag(tag, index)
        .then(function(response) {
          tag.editMode = false;
          refreshtags();
          notificationService.success("tag deleted successfully.");
        }, function(response) {
          $scope.msg = response;
        });
    }

//    $scope.bulkDeletetags = function() {
//      for (var i = 0; i < $scope.tags.length; i++) {
//        var tag = $scope.tags[i];
//        if (tag.editMode) {
//          $scope.deletetag(tag, i);
//        }
//      }
//    }

//    //get all tags
//    function getAlltags() {
//      $scope.sort = defaultSort;
//      tagsSvc.retrieveAlltags()
//        .then(function(response) {
//          $scope.tags = angular.copy(response.data);
//        }, function(response) {
//          $scope.msg = response;
//        });
//    }

//    function refreshtags() {
//      $scope.tags = [];
//      getAlltags();
//    }

//     //createtag
//    function createtagOffline(tag) {
//      var dfd = new $q.defer();
//      offlinetags = offlinetags || [];
//      offlinetags.push(tag);
//      dfd.resolve("");
//      return dfd.promise;
//    }

//    //retrieveAlltags
//    function retrieveAlltagsOffline() {
//      var dfd = new $q.defer();
//      offlinetags = offlinetags || [];
//      dfd.resolve({
//        data: offlinetags
//      });
//      return dfd.promise;
//    }

//    //updatetag
//    function updatetagOffline(tag, index) {
//      var dfd = new $q.defer();
//
//      if (offlinetags) {
//        offlinetags[index] = angular.copy(tag);
//      }
//      dfd.resolve("");
//      return dfd.promise;
//    }

//    //deletetag
//    function deletetagOffline(tag, index) {
//      var dfd = new $q.defer();
//      if (offlinetags) {
//        offlinetags.splice(index, 1);
//      }
//      dfd.resolve("");
//      return dfd.promise;
//    }

//    //createtag
//    function createtag(tag) {
//      return $http.post(dbConfigService.url, tag, {
//        params: {
//          apiKey: dbConfigService.key
//        }
//      });
//    }

//    //retrieveAlltags
//    function retrieveAlltags() {
//      return $http.get(dbConfigService.url, {
//        params: {
//          apiKey: dbConfigService.key
//        }
//      });
//    }

//    //updatetag
//    function updatetag(tag, index) {
//      return $http.put(dbConfigService.url + "/" + tag._id.$oid, tag, {
//        params: {
//          apiKey: dbConfigService.key
//        }
//      });
//    }

//    //deletetag
//    function deletetag(tag, index) {
//      return $http.delete(dbConfigService.url + "/" + tag._id.$oid, {
//        params: {
//          apiKey: dbConfigService.key
//        }
//      });
//    }


}]);




