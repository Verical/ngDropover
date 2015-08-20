angular.module('verical.ngDropoverPage', ['ui.router'])

.config(["$stateProvider", function config($stateProvider) {
    $stateProvider.state('ngDropoverPage', {
        url: '/ngDropover',
        views: {
            "main": {
                controller: 'ngDropoverPageCtrl',
                templateUrl: '/src/app/ngDropoverPage/ngDropoverPage.tpl.html'
            }
        },
        data: {
            pageTitle: 'ngDropover'
        }
    });
}])

.controller('ngDropoverPageCtrl', ["$scope","$window", function ngDropoverPageCtrl($scope, $window) {

    $scope.exampleOptions = {
        'horizontalOffset': 0,
        'verticalOffset': 0,
        'trigger': "",
        'triggerEvent': "click",
        'position': "bottom-left",
        'closeOnClickOff': true,
        'groupId': 'exampleGroup'
    };

    $scope.openGithub = function() {
        $window.open('https://github.com/Verical/ngDropover', '_blank');
    };

}]);
