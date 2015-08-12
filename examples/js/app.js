angular.module('example', ['ngDropover'])
    .controller('AppCtrl', function AppCtrl($scope, $rootScope) {

        $scope.leftMenuOptions = {
            'triggerEvent': 'click',
            'position': 'left-bottom',
            'classOnly': true,
            'group': 'dropdown'
         };

        $rootScope.exampleOptions = {
            'horizontalOffset': 0,
            'verticalOffset': 0,
            'wrapperClass': '',
            'closeOthersOnOpen': false,
            'trigger': "",
            'triggerEvent': "click",
            'position': "bottom-left",
            'closeOnClickOff': true
        };

        $rootScope.$on('ngDropover.opening', function(event, dropObj){
            if (dropObj.group == 'dropdown'){
                $(dropObj.element).slideToggle();
            }
        });
        $rootScope.$on('ngDropover.closing', function(event, dropObj){
            if (dropObj.group == 'dropdown'){
                $(dropObj.element).slideToggle();
            }
        });

    });
