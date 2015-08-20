angular.module('verical', ['verical.ngDropoverPage','verical.ngdoIE','ui.router','embedCodepen','ngDropover'])

.config(["$stateProvider", "$urlRouterProvider", function myAppConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/ngDropover');
}])

.run(function run() {})

.controller('AppCtrl', ["$scope", "$location", function AppCtrl($scope, $location) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (angular.isDefined(toState.data.pageTitle)) {
            $scope.pageTitle = toState.data.pageTitle + ' | Verical';
        }
    });
}]);
