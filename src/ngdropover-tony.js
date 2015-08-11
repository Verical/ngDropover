/* global angular */
(function(window, document) {
    'use strict';

    /*
     * AngularJS ngDropOver
     * Version: 0.0.0
     *
     * Copyright 2015
     * All Rights Reserved.
     * Use, reproduction, distribution, and modification of this code is subject to the terms and
     * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
     *
     * Authors: Tony Smith & Ricky Sandoval
     * 
     */

    angular.module('ngDropOver', [])
        .constant(
            'ngDropOverConfig', {
                'offsetX': 0,
                'offsetY': 0,
                'dropOverContentsClass': '',
                'closeOthersOnOpen': false,
                'position': "bottom"
            }
        )
        .directive('ngDropOver', function(ngDropOverConfig, $compile, $position, $rootScope, $interval, $document, $window) {

            $document.on('touchstart click', function(event) {
                console.log(event);
                event.preventDefault();
                $rootScope.$broadcast("dropover.close", {
                    e: event
                });
            });

            var triggersArray = [];

            return {
                restrict: 'A',
                replace: true,
                scope: {
                    dropOverId: '@ngDropOver'
                },
                link: function(scope, elm, attrs) {

                    scope.config = angular.extend({}, ngDropOverConfig, scope.$eval(attrs.ngDropOverOptions));

                    //Move the menu contents to the body
                    var body = $document.find('body').eq(0);
                    var dropOverContents = angular.element(elm[0].querySelector('[ng-drop-over-contents]'));
                    dropOverContents.css({
                        'visibility': 'hidden',
                        'position': 'absolute'
                    });
                    body.prepend(dropOverContents);

                    scope.open = function(dropOverId) {
                        if (dropOverId == scope.dropOverId && !scope.isOpen) {

                            //reposition the dropover
                            positionDropOver();

                            dropOverContents.css('visibility', 'visible');

                            //start the display process and fire events
                            if (typeof Velocity !== 'undefined') {
                                Velocity(dropOverContents, "slideDown", 300);
                            }

                            // $rootScope.$broadcast('ngDropOver.opening', scope.dropOverId);
                            $rootScope.$broadcast('ngDropOver.opened', scope.dropOverId);
                            dropOverContents.addClass('ng-drop-over-open');
                            // $rootScope.$broadcast('ngDropOver.rendered', scope.dropOverId);
                            scope.isOpen = true;

                        }
                    };

                    scope.close = function(dropOverId) {
                        console.log(triggersArray);
                        if (dropOverId == scope.dropOverId && scope.isOpen) {
                            closer();
                        }
                    };

                    scope.toggle = function(dropOverId) {
                        if (!scope.isOpen) {
                            scope.open(dropOverId);
                        } else {
                            scope.close(dropOverId);
                        }
                    };

                    //reposition the dropover if the user resizes the browser window
                    angular.element($window).bind('resize', function() {
                        positionDropOver();
                    });

                    function closer() {
                        if (typeof Velocity !== 'undefined') {
                            Velocity(dropOverContents, "slideUp", 100);
                        } else {
                            dropOverContents.css('visibility', 'hidden');
                        }

                        // $rootScope.$broadcast('ngDropOver.closing', scope.dropOverId);
                        $rootScope.$broadcast('ngDropOver.closed', scope.dropOverId);
                        dropOverContents.removeClass('ng-drop-over-open');
                        scope.isOpen = false;
                    };

                    function positionDropOver() {
                        var contentPosition = $position.positionElements(elm, elm, scope.config.position, true);

                        contentPosition.top = contentPosition.top + scope.config.offsetY;
                        contentPosition.left = contentPosition.left + scope.config.offsetX;

                        contentPosition.top += 'px';
                        contentPosition.left += 'px';
                        dropOverContents.css('top', contentPosition.top);
                        dropOverContents.css('left', contentPosition.left);

                    };

                },
                controller: [
                    '$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {

                        $scope.colorSelect = "DIRECTIVE";

                        $scope.isOpen = false;

                        //ToDo: create a unique ID if one isn't provided
                        //warn user if id is not unique
                        if (angular.isUndefined($scope.dropOverId) || $scope.dropOverId === null) {
                            $scope.dropOverId = $scope.$id;
                        };

                        //set up event listeners
                        $scope.openListener = $rootScope.$on('ngDropOver.open', function(event, dropOverId) {
                            $scope.open(dropOverId);
                        });

                        $scope.closeListener = $rootScope.$on('ngDropOver.close', function(event, dropOverId) {
                            $scope.close(dropOverId);
                        });

                        $scope.toggleListener = $rootScope.$on('ngDropOver.toggle', function(event, dropOverId) {
                            console.log("toggle");
                            console.log(event);
                            $scope.toggle(dropOverId);
                        });

                        $scope.openListener = $rootScope.$on('ngDropOver.registerTrigger', function(element, dropOverId) {
                            //triggersArray.push();
                            console.log(element, dropOverId);
                        });

                        $scope.$on('$destroy', function() {
                            $scope.openListener();
                            $scope.openListener = null;
                            $scope.closeListener();
                            $scope.closeListener = null;
                            $scope.toggleListener();
                            $scope.toggleListener = null;
                        });
                    }
                ]
            };
        }).directive('ngDropOverContents', [function() {
            return {
                restrict: 'A',
                replace: true,
                transclude: true,
                template: "<div class='ng-drop-over-contents' ng-transclude></div>",
                link: function(scope, elm, attrs) {

                },
                controller: [
                    '$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {
                        $scope.colorSelect = "DO CONTENTS";
                    }
                ]
            }
        }]).directive('ngDropoverTrigger', function($rootScope, $document, triggerHelper) {
            return {
                restrict: 'AE',
                link: function (scope, element, attrs) {
                    var options = scope.$eval(attrs.ngDropoverTrigger);
                    var triggerObj = triggerHelper.getTriggers(options.triggerEvent || 'click');
                    element.addClass('ng-dropover-trigger');

                    if (options.action == "open" || options.action == "close") {
                        element.on(triggerObj.show, function(event) {
                            event.targetId = options.targetId;
                            scope.$emit('ngDropover.' + options.action, event);
                        });
                    } else {
                        if (triggerObj.show === triggerObj.hide) {
                            element.on(triggerObj.show, function(event) {
                                event.targetId = options.targetId;
                                scope.$emit('ngDropover.toggle', event);
                            });
                        } else {
                            element.on(triggerObj.show, function(event) {
                                event.targetId = options.targetId;
                                scope.$emit('ngDropover.open', event);
                            });

                            element.on(triggerObj.hide, function(event) {
                                event.targetId = options.targetId;
                                scope.$emit('ngDropover.close', event);
                            });
                        }
                    }
                    element.on('click', function(event) {
                        event.targetId = options.targetId;
                    });
                }
            };

        }).factory('$position', ['$document', '$window', function($document, $window) {

            function getStyle(el, cssprop) {
                if (el.currentStyle) { //IE
                    return el.currentStyle[cssprop];
                } else if ($window.getComputedStyle) {
                    return $window.getComputedStyle(el)[cssprop];
                }
                // finally try and get inline style
                return el.style[cssprop];
            }

            /**
             * Checks if a given element is statically positioned
             * @param element - raw DOM element
             */
            function isStaticPositioned(element) {
                return (getStyle(element, 'position') || 'static') === 'static';
            }

            /**
             * returns the closest, non-statically positioned parentOffset of a given element
             * @param element
             */
            var parentOffsetEl = function(element) {
                var docDomEl = $document[0];
                var offsetParent = element.offsetParent || docDomEl;
                while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docDomEl;
            };

            return {
                /**
                 * Provides read-only equivalent of jQuery's position function:
                 * http://api.jquery.com/position/
                 */
                position: function(element) {
                    var elBCR = this.offset(element);
                    var offsetParentBCR = {
                        top: 0,
                        left: 0
                    };
                    var offsetParentEl = parentOffsetEl(element[0]);
                    if (offsetParentEl != $document[0]) {
                        offsetParentBCR = this.offset(angular.element(offsetParentEl));
                        offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                        offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                    }

                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: elBCR.top - offsetParentBCR.top,
                        left: elBCR.left - offsetParentBCR.left
                    };
                },

                /**
                 * Provides read-only equivalent of jQuery's offset function:
                 * http://api.jquery.com/offset/
                 */
                offset: function(element) {
                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                        left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * Provides coordinates for the targetEl in relation to hostEl
                 */
                positionElements: function(hostEl, targetEl, positionStr, appendToBody) {

                    var positionStrParts = positionStr.split('-');
                    var pos0 = positionStrParts[0],
                        pos1 = positionStrParts[1] || 'center';

                    var hostElPos,
                        targetElWidth,
                        targetElHeight,
                        targetElPos;

                    hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

                    targetElWidth = targetEl.prop('offsetWidth');
                    targetElHeight = targetEl.prop('offsetHeight');

                    var shiftWidth = {
                        center: function() {
                            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                        },
                        left: function() {
                            return hostElPos.left;
                        },
                        right: function() {
                            return hostElPos.left + hostElPos.width;
                        }
                    };

                    var shiftHeight = {
                        center: function() {
                            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                        },
                        top: function() {
                            return hostElPos.top;
                        },
                        bottom: function() {
                            return hostElPos.top + hostElPos.height;
                        }
                    };

                    switch (pos0) {
                        case 'right':
                            targetElPos = {
                                top: shiftHeight[pos1](),
                                left: shiftWidth[pos0]()
                            };
                            break;
                        case 'left':
                            targetElPos = {
                                top: shiftHeight[pos1](),
                                left: hostElPos.left - targetElWidth
                            };
                            break;
                        case 'bottom':
                            targetElPos = {
                                top: shiftHeight[pos0](),
                                left: shiftWidth[pos1]()
                            };
                            break;
                        default:
                            targetElPos = {
                                top: hostElPos.top - targetElHeight,
                                left: shiftWidth[pos1]()
                            };
                            break;
                    }

                    return targetElPos;
                }
            };
        }]);
})(window, document);






// JunkYard


// slide down animation 
// function showElement(elementID, final_h, interval) {

//     var el = dropOverContentsRaw,
//         curr_h = el.offsetHeight;

//     console.log("FIRED");
//     console.log(final_h);
//     console.log(el.offsetHeight);


//     if (el.timer) {
//         clearTimeout(el.timer);
//     }

//     if (curr_h == final_h) {
//         return true;
//     }

//     if (curr_h < final_h) {
//         var dist = Math.ceil((final_h - curr_h) / 10);
//         curr_h = curr_h + dist;
//     }

//     if (curr_h > final_h) {
//         var dist = Math.ceil((curr_h - final_h) / 10);
//         curr_h = curr_h - dist;
//     }

//     el.style.height = curr_h + "px";

//     el.timer = setTimeout(function() {
//         showElement(elementID, final_h, interval);
//     });
// }
