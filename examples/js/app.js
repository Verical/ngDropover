angular.module('example', ['ngDropover'])
    .controller('AppCtrl', function AppCtrl($scope, $rootScope) {

        $scope.leftMenuOptions = {
            'triggerEvent': 'click',
            'position': 'left-bottom'        };



        $rootScope.exampleOptions = {
            'offsetX': 0,
            'offsetY': 0,
            'wrapperClass': '',
            'closeOthersOnOpen': false,
            'trigger': "",
            'triggerEvent': "click",
            'position': "bottom-left",
            'closeOnClickOff': true
        };

    });
