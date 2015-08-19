angular.module('example', ['ngDropover'])
    .controller('AppCtrl', function AppCtrl($scope, $rootScope) {

        $scope.leftMenuOptions = {
            'triggerEvent': 'click',
            'position': 'left-bottom'
        };

        $rootScope.exampleOptions = {
            'horizontalOffset': 0,
            'verticalOffset': 0,
            'triggerEvent': "causeerror",
            'position': 'causeerror',
            'closeOnClickOff': true
        };

        $rootScope.$on('ngDropover.opening', function(event, dropObj) {
            $(dropObj.element).stop().slideDown();
        });
        
        $rootScope.$on('ngDropover.closing', function(event, dropObj) {
            $(dropObj.element).show();
            $(dropObj.element).stop().slideUp();
        });

    }).run(function($rootScope) {

        var links = document.querySelectorAll('.menu-link > a');

        Array.prototype.forEach.call(links, function(elem) {
            angular.element(elem).on('touchstart click', function(event) {
                event.preventDefault();
                console.log('close all');
                $rootScope.$emit('ngDropover.closeAll', {
                    ngDropoverId: null
                });
            });
        });
    }).directive('testDirective', function($interval) {
        return {
            templateUrl: 'temp2.html',
            link: function(scope, elem, attrs) {
                scope.markEvent = function(event) {
                    scope.$emit('ngDropover.close', 'directiveEx');
                };

                scope.delayClose = function() {
                    scope.countdown = 3;
                    var count = $interval(function() {
                        scope.countdown--;
                        if (scope.countdown == 0) {
                            scope.$emit('ngDropover.close', 'directiveEx');
                            $interval.cancel(count);
                        }
                    }, 1000);
                };
            }
        };
    });;
