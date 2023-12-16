app.controller('tableController', ['$scope', '$http', 'graphService', function($scope, $http, graphService) {

	$scope.systems = undefined;
	$scope.current_route = undefined
	$scope.currentView = undefined;
	$scope.users = undefined
	$scope.search = undefined

	var defaultSort = 'firstName';
    $scope.users = [];
    $scope.msg = "";
    $scope.sort = defaultSort;
    $scope.reverse = false;
    $scope.selectedPageSize = 2;
    $scope.pageSizes = [1, 2, 3];
    $scope.currentPage = 1;
    $scope.pages = [1, 2, 3, 4];


	$http.get('/api/table').then(function(response) {

		$scope.users = response.data.users
		$scope.search = response.data.search
		//console.log(response.data)
		console.log($scope.users)
		console.log($scope.search)
		//console.log(currentPage*selectedPageSize - users.length)

	});



    $scope.setSort = function(sort) {
      if ($scope.sort === sort) {
        $scope.reverse = !$scope.reverse;
      }
      if ($scope.sort !== undefined) {
        $scope.sort = sort;
      }
    }

    //define user CRUD operations

    //save user (create & update)
    $scope.saveUser = function(user, index) {
      if (user.editMode) {
        user.editMode = false;
        $scope.sort = defaultSort;
        usersSvc.updateUser(user, index)
          .then(function() {
            notificationService.success("User updated successfully.");
          }, function(response) {
            $scope.msg = response;
          });
      } else {
        usersSvc.createUser(user)
          .then(function() {
            notificationService.success("User created successfully.");
          }, function(response) {
            $scope.msg = response;
          });
      }
    }

    //bulk update users
    $scope.bulkUpdateUsers = function() {
      for (var i = 0; i < $scope.users.length; i++) {
        var user = $scope.users[i];
        if (user.editMode) {
          $scope.saveUser(user, i);
        }
      }
    }

    //var lastEditedUser={};
    //edit user details
    $scope.editUser = function(user) {
      //angular.extend(lastEditedUser,user);
      user.editMode = true;
      $scope.sort = undefined;
    }

    //cancel
    $scope.cancel = function(user) {
      getAllUsers();
      user.editMode = false;

      //angular.extend(user,lastEditedUser);
    }


    //delete user
    $scope.deleteUser = function(user, index) {
    console.log("DELETE: ", user, index)
      $scope.users = [];
      usersSvc.deleteUser(user, index)
        .then(function(response) {
          user.editMode = false;
          refreshUsers();
          notificationService.success("User deleted successfully.");
        }, function(response) {
          $scope.msg = response;
        });
    }

    $scope.bulkDeleteUsers = function() {
      for (var i = 0; i < $scope.users.length; i++) {
        var user = $scope.users[i];
        if (user.editMode) {
          $scope.deleteUser(user, i);
        }
      }
    }

    //get all users
    function getAllUsers() {
      $scope.sort = defaultSort;
      usersSvc.retrieveAllUsers()
        .then(function(response) {
          $scope.users = angular.copy(response.data);
        }, function(response) {
          $scope.msg = response;
        });
    }


    function refreshUsers() {
      $scope.users = [];
      getAllUsers();
    }


     //createUser
    function createUserOffline(user) {
      var dfd = new $q.defer();
      offlineUsers = offlineUsers || [];
      offlineUsers.push(user);
      dfd.resolve("");
      return dfd.promise;
    }

    //retrieveAllUsers
    function retrieveAllUsersOffline() {
      var dfd = new $q.defer();
      offlineUsers = offlineUsers || [];
      dfd.resolve({
        data: offlineUsers
      });
      return dfd.promise;
    }

    //updateUser
    function updateUserOffline(user, index) {
      var dfd = new $q.defer();

      if (offlineUsers) {
        offlineUsers[index] = angular.copy(user);
      }
      dfd.resolve("");
      return dfd.promise;
    }

    //deleteUser
    function deleteUserOffline(user, index) {
      var dfd = new $q.defer();
      if (offlineUsers) {
        offlineUsers.splice(index, 1);
      }
      dfd.resolve("");
      return dfd.promise;
    }

    //----------------------User CRUD operations------------------------------------------
    //createUser
    function createUser(user) {
      return $http.post(dbConfigService.url, user, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //retrieveAllUsers
    function retrieveAllUsers() {
      return $http.get(dbConfigService.url, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //updateUser
    function updateUser(user, index) {
      return $http.put(dbConfigService.url + "/" + user._id.$oid, user, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //deleteUser
    function deleteUser(user, index) {
      return $http.delete(dbConfigService.url + "/" + user._id.$oid, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }


}]);




