var hePractice = angular.module('hePractice', []);

hePractice.controller('PbmController', ['$scope', 'pbmService','localDb', function ($scope, pbmService, localDb) {
    console.log(pbmService.hi);
    var getPbms = pbmService.getProblems();
    $scope.pbms = "";
    var pbms;
    var openDb;
    var writeDb;
    getPbms.then(function (data) {
        openDb=localDb.openDb();
        
       writeDb=openDb.then(function(){
            localDb.writeDb(data.data);
            console.log(pbms);
        });
        
        writeDb.then(function(){
            var data =localDb.readDb(1);
            data.then(function(d){
                $scope.pbms=d.problems;
                 console.log($scope.pbms);
            });
        });
    });
    
    $scope.sortBy = function (val) {
        $scope.sortValue = val;
    };


}]);

hePractice.service('pbmService', function ($q, $http, localDb) {
    this.hi = "hello";
    var url = 'http://localhost:8000/sample.json';
    this.getProblems = function () {
        var deferred = $q.defer();
        $http.get(url)
            .then(function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
        return deferred.promise;
    };

});

hePractice.directive('errSrc', function () {
    return {
        restrict: 'AE',
        link: function (scope, elem, attr) {
            elem.on('error', function () {
                attr.$set('src', attr.errSrc);
            });
            if (!attr.src || attr.src === "") {
                attr.$set('src', attr.errSrc);
            }
        }
    }
});



hePractice.factory('localDb', function ($q) {

    var isDbSupported;
    var db;
    if ('indexedDB' in window) {
        isDbSupported = true;
    }
    return {

        openDb: function () {
            var deferred = $q.defer();
            if (isDbSupported) {
                indexedDB.deleteDatabase('problem');
                var requestOpen = indexedDB.open('problem');
                requestOpen.onupgradeneeded = function (e) {
                        console.log("Upgrading....");
                        var thisDb = e.target.result;
                        if (!thisDb.objectStoreNames.contains('problemList')) {
                            thisDb.createObjectStore('problemList');
                            console.log('problemList created');
                        }
                    };
                    requestOpen.onsuccess = function (e) {
                        db = e.target.result;
                        console.log(db);
                        deferred.resolve(db);
                    };
                    requestOpen.onerror = function (e) {
                        console.log(e);
                        deferred.reject(e);
                    };
                return deferred.promise;
            }
        },
        writeDb: function (data) {
            var deferred = $q.defer();
            var transaction = db.transaction(['problemList'], 'readwrite');
            var list = transaction.objectStore('problemList');
            var requestWrite = list.add(data,1);
            requestWrite.onerror = function (e) {
                console.log(e.target.error.name);
                deferred.reject(e.target.error.name);
            };
            requestWrite.onsuccess = function (e) {
                console.log("Data Added");
                deferred.resolve(e.target.result);
            };
            return deferred.promise;
        },
        readDb: function (key) {
            var deferred = $q.defer();
            var transaction = db.transaction(['problemList'], 'readonly');
            var list = transaction.objectStore('problemList');
            var requestRead = list.get(key);
            requestRead.onerror = function (e) {
                console.log(e.target.error.name);
                deferred.reject(e);
            };
            requestRead.onsuccess = function (e) {
                console.log(e.target.result);
                deferred.resolve(e.target.result);
            };
            return deferred.promise;
        }

    }
});