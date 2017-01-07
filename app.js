var hePractice=angular.module('hePractice',[]);

hePractice.controller('PbmController',['$scope','pbmService',function($scope,pbmService){
    console.log(pbmService.hi);
    var getPbms=pbmService.getProblems();
    $scope.pbms="";
    getPbms.then(function(data){
        $scope.pbms=data.data.problems;
        console.log($scope.pbms);
    });
    
    
}]);

hePractice.service('pbmService',function($q,$http){
   this.hi="hello";
    var url='https://hackerearth.0x10.info/api/problems?type=json&query=list_problems';
    this.getProblems=function(){
        var deferred=$q.defer();
        $http.get(url)
        .then(function(data){
            deferred.resolve(data);
        },
        function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    };
    
    
});