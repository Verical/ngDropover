angular.module('verical.ngdoIE', ['ui.router'])

.config(["$stateProvider", function config($stateProvider) {
    $stateProvider.state('ngdoIE', {
        url: '/ngdoIE',
        views: {
            "main": {
                controller: 'ngdoIECtrl',
                templateUrl: '/src/app/ngdoIE/ngdoIE.tpl.html'
            }
        },
        data: {
            pageTitle: 'ngdoIE'
        }
    });
}])

.controller('ngdoIECtrl', ["$scope","$window", function ngdoIECtrl($scope, $window) {

    

}]);
