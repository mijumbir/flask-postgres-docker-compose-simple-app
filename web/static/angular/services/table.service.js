app.service('tableService', function() {

    this.Table = function(currentPage) {

        this.defaultSort = 'Alias';
        this.sort = this.defaultSort;
        this.reverse = false;
        this.tag = undefined;
        this.currentPage = currentPage

    }

    this.Table.prototype.setSort = function(sort) {
      if (this.sort === sort) {
        this.reverse = !this.reverse;
      }
      if (this.sort !== undefined) {
        this.sort = sort;
      }
    }

    //bulk update tags
    this.Table.prototype.bulkUpdatetags = function() {
      for (var i = 0; i < this.tags.length; i++) {
        var tag = this.tags[i];
        if (tag.editMode) {
          this.savetag(tag, i);
        }
      }
    }

    //var lastEditedtag={};
    //edit tag details
    this.Table.prototype.edittag = function(tag) {
      //angular.extend(lastEditedtag,tag);
      this.tag.editMode = true;
      this.sort = undefined;
    }

    //cancel
    this.Table.prototype.cancel = function(tag) {
      this.getAlltags();
      this.tag.editMode = false;

      //angular.extend(tag,lastEditedtag);
    }

    //delete tag
    this.Table.prototype.deletetag = function(tag, index) {
    //console.log("DELETE: ", tag, index)
      this.tags = [];
      tagsSvc.deletetag(tag, index)
        .then(function(response) {
          this.tag.editMode = false;
          this.refreshtags();
          notificationService.success("tag deleted successfully.");
        }, function(response) {
          this.msg = response;
        });
    }

    this.Table.prototype.bulkDeletetags = function() {
      for (var i = 0; i < this.tags.length; i++) {
        var tag = this.tags[i];
        if (tag.editMode) {
          this.deletetag(tag, i);
        }
      }
    }



    this.Table.prototype.refreshtags = function () {
      this.tags = [];
      this.getAlltags();
    }

     //createtag
    this.Table.prototype.createtagOffline = function (tag) {
      var dfd = new $q.defer();
      offlinetags = offlinetags || [];
      offlinetags.push(tag);
      dfd.resolve("");
      return dfd.promise;
    }

    //retrieveAlltags
    this.Table.prototype.retrieveAlltagsOffline = function () {
      var dfd = new $q.defer();
      offlinetags = offlinetags || [];
      dfd.resolve({
        data: offlinetags
      });
      return dfd.promise;
    }

    //updatetag
    this.Table.prototype.updatetagOffline = function updatetagOffline(tag, index) {
      var dfd = new $q.defer();

      if (offlinetags) {
        offlinetags[index] = angular.copy(tag);
      }
      dfd.resolve("");
      return dfd.promise;
    }

    //deletetag
    this.Table.prototype.deletetagOffline = function deletetagOffline(tag, index) {
      var dfd = new $q.defer();
      if (offlinetags) {
        offlinetags.splice(index, 1);
      }
      dfd.resolve("");
      return dfd.promise;
    }

    //createtag
    this.Table.prototype.createtag = function createtag(tag) {
      return $http.post(dbConfigService.url, tag, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //retrieveAlltags
    this.Table.prototype.retrieveAlltags = function retrieveAlltags() {
      return $http.get(dbConfigService.url, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //updatetag
    this.Table.prototype.updatetag = function updatetag(tag, index) {
      return $http.put(dbConfigService.url + "/" + tag._id.$oid, tag, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

    //deletetag
    this.Table.prototype.deletetag = function deletetag(tag, index) {
      return $http.delete(dbConfigService.url + "/" + tag._id.$oid, {
        params: {
          apiKey: dbConfigService.key
        }
      });
    }

});