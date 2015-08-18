/* global angular */
(function(window, document) {
    'use strict';

    /*
     * AngularJS ngDropover
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

    angular.module('ngDropover', [])
        .run(function($document, $rootScope) {
            $document.on('touchstart click', function(event) {
                if (event.which !== 3) {
                    event.fromDocument = true;
                    $rootScope.$emit("ngDropover.closeAll", event);
                }
            });
        })
        .constant(
            'ngDropoverConfig', {
                'horizontalOffset': 0,
                'verticalOffset': 0,
                'closeOthersOnOpen': true,
                'triggerEvent': 'click',
                'position': 'bottom-left',
                'closeOnClickOff': true,
                'groupId': ''
            }
        )
        .constant(
            'positions', [
                'bottom',
                'bottom-left',
                'bottom-center',
                'bottom-right',
                'top',
                'top-left',
                'top-center',
                'top-right',
                'left',
                'left-bottom',
                'left-center',
                'left-top',
                'right',
                'right-bottom',
                'right-center',
                'right-top'
            ]
        )
        .factory('triggerEventsMap', function() {

            var triggerMap = {
                'mouseenter': 'mouseleave',
                'click': 'click',
                'focus': 'blur',
                'none': 'none',
                'touchstart click': 'touchstart click'
            };

            return {
                getTriggers: function(triggerEvent) {
                    if (triggerEvent === 'hover') {
                        triggerEvent = 'mouseenter'
                    }
                    if (triggerEvent === 'click') {
                        triggerEvent = 'touchstart click';
                    }

                    if (triggerMap.hasOwnProperty(triggerEvent)) {
                        return {
                            'show': triggerEvent,
                            'hide': triggerMap[triggerEvent]
                        }
                    }
                    return null;
                }
            }
        })
        .directive('ngDropover', function(ngDropoverConfig, positions, $rootScope, $position, $document, $window, triggerEventsMap, $timeout) {

            function logError(id, element, message) {
                console.log("∇ ngDropover Error | ID:" + id + " ∇");
                console.log(element);
                console.log(message);
                console.log("");
            }

            return {
                restrict: 'A',
                replace: true,
                scope: {
                    target: '@ngDropover',
                    ngDropoverOptions: '@ngDropoverOptions'
                },
                link: function(scope, elm, attrs) {

                    var dropoverContents, triggerElements, handlers, transition = {
                        duration: 0
                    };

                    init();

                    function init() {

                        scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                        scope.positions = positions;



                        setHtml();
                        handlers = {
                            toggle: function(e) {
                                // This is to check if the event came from inside the directive contents
                                e.preventDefault();
                                if (!e.ngDropoverId) {
                                    e.ngDropoverId = scope.ngDropoverId;
                                    scope.toggle(scope.ngDropoverId);
                                }
                            },
                            open: function(e) {
                                e.ngDropoverId = scope.ngDropoverId;
                                if (!scope.isOpen) {
                                    scope.open(scope.ngDropoverId);
                                }
                            },
                            close: function(e) {
                                e.ngDropoverId = scope.ngDropoverId;
                                if (scope.isOpen) {
                                    scope.close(scope.ngDropoverId);
                                }
                            },
                            markEvent: function(e) {
                                e.ngDropoverId = scope.ngDropoverId;
                            }
                        }

                        scope.$watch('ngDropoverOptions', function() {
                            unsetTriggers();
                            scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                            if (typeof(scope.config.position) !== 'string' || scope.positions.indexOf(scope.config.position) == -1) {
                                logError(scope.ngDropoverId, angular.element(elm), "Position must be a string and one of these values: " + scope.positions);
                                scope.config.position = "bottom-left";
                            };
                            setTriggers();
                            positionContents();
                            setPositionClass();
                        }, true);

                        dropoverContents.on('touchstart click', handlers.markEvent);
                        $document.ready(function() {
                            positionContents();
                        });
                    }


                    function setHtml() {
                        elm.attr("ng-dropover", scope.ngDropoverId)
                        dropoverContents = getDropoverContents();
                        elm.addClass(scope.config.wrapperClass);
                        dropoverContents.css({
                            'position': 'absolute'
                        }).addClass('ngdo-contents');
                        transition.event = getTransitions();
                        transition.handler = function(event) {
                            if (event.propertyName == "visibility") {
                                return;
                            }
                            dropoverContents.css({
                                'display': 'none'
                            });
                            dropoverContents[0].removeEventListener(transition.event, transition.handler);
                        };
                    }



                    //Get the trigger from the config if the user set it. Otherwise the trigger will default to the scope's element
                    function setTriggers() {

                        var triggerObj = triggerEventsMap.getTriggers(scope.config.triggerEvent);

                        if (!triggerObj) {
                            logError(scope.ngDropoverId, angular.element(elm), "triggerEvent must be a string: 'none', 'click', 'hover', 'focus'");
                        };

                        if (triggerObj && triggerObj.show !== "none") {
                            //If the the trigger's event to open matches the event to close, then send to the toggle method
                            //else send to individual open and close methods
                            if (triggerObj.show === triggerObj.hide) {
                                elm.on(triggerObj.show, handlers.toggle);
                            } else {
                                elm.on(triggerObj.show, handlers.open);
                                elm.on(triggerObj.hide, handlers.close);
                                elm.on('touchstart click', handlers.markEvent);
                            }
                        }
                    };

                    function unsetTriggers() {
                        if (triggerElements && triggerElements.length > 0) {
                            var triggerObj = triggerEventsMap.getTriggers(scope.config.triggerEvent);
                            for (var i = 0; i < triggerElements.length; i++) {
                                var el = angular.element(triggerElements[i]);
                                if (triggerObj.show === triggerObj.hide) {
                                    el.off(triggerObj.show, handlers.toggle);
                                } else {
                                    el.off(triggerObj.show, handlers.open);
                                    el.off(triggerObj.hide, handlers.close);
                                    el.off('touchstart click', handlers.markEvent);
                                }
                            }
                        }
                    };

                    function positionContents() {

                        var offX, offY, positions;

                        offX = parseInt(scope.config.horizontalOffset, 10) || 0;
                        offY = parseInt(scope.config.verticalOffset, 10) || 0;

                        dropoverContents.css({
                            'visibility': 'hidden',
                            'display': ''
                        });

                        positions = $position.positionElements(elm, dropoverContents, scope.config.position, false);
                        dropoverContents.css({
                            'left': positions.left + offX + 'px',
                            'top': positions.top + offY + 'px',
                            'display': 'none',
                            'visibility': 'visible'
                        });
                    };

                    function setPositionClass() {
                        var classList = elm[0].className.split(' ');
                        for (var i = 0, l = classList.length; i < l; i++) {
                            var stripPrefix = classList[i].substring(5, classList[i].length);
                            if (scope.positions.indexOf(stripPrefix) > 0) {
                                elm.removeClass(classList[i]);
                            }
                        };
                        elm.addClass('ngdo-' + scope.config.position);
                    };

                    function getDropoverContents() {
                        var ret;
                        if (elm[0].querySelector('[ng-dropover-contents]')) {
                            ret = angular.element(elm[0].querySelector('[ng-dropover-contents]')).addClass(scope.config.groupId);
                            return ret;
                        } else {

                            ret = angular.element("<div class='ngdo-empty'>Oops, you forgot to specify what goes in the dropdown</div>").addClass(scope.config.groupId);
                            elm.append(ret);
                            return ret;
                        }
                    }

                    //ToDo: Detect previous display value
                    scope.open = function(ngDropoverId) {
                        if (transition.event) {
                            dropoverContents[0].removeEventListener(transition.event, transition.handler);
                        }
                        if (ngDropoverId === scope.ngDropoverId && !scope.isOpen) {

                            if (scope.config.closeOthersOnOpen) {
                                $rootScope.$emit("ngDropover.closeAll", {
                                    ngDropoverId: scope.ngDropoverId
                                });
                            };

                            positionContents();

                            //start the display process and fire events
                            $rootScope.$broadcast('ngDropover.opening', {
                                id: scope.ngDropoverId,
                                element: dropoverContents[0],
                                groupId: scope.config.groupId
                            });
                            dropoverContents.css({
                                'display': 'inline-block'
                            });
                            elm.addClass('ngdo-open');
                            angular.element($window).bind('resize', positionContents);

                            scope.isOpen = true;
                        }
                    };

                    scope.close = function(ngDropoverId) {
                        if (ngDropoverId === scope.ngDropoverId && scope.isOpen) {
                            closer();
                        }
                    };

                    scope.toggle = function(ngDropoverId) {
                        if (!scope.isOpen) {
                            scope.open(ngDropoverId);
                        } else {
                            scope.close(ngDropoverId);
                        }
                    };

                    scope.closeAll = function() {
                        if (scope.isOpen) {
                            closer();
                        }
                    };

                    function getTransitions() {
                        var transitions = {
                            'transition': 'transitionend',
                            'OTransition': 'oTransitionEnd',
                            'MozTransition': 'transitionend',
                            'webkitTransition': 'webkitTransitionEnd'
                        };
                        var propertyCheck = {
                            'transition': 'transitionDuration',
                            'OTransition': 'oTransitionDuration',
                            'MozTransition': 'MozTransitionDuration',
                            'webkitTransition': 'WebkitTransitionDuration'
                        };
                        var transition;
                        for (transition in transitions) {
                            if (dropoverContents[0].style[transition] !== undefined && parseFloat($position.getStyle(dropoverContents[0], propertyCheck[transition]), 10) > 0) {
                                transition.duration = Math.floor(parseFloat($position.getStyle(dropoverContents[0], propertyCheck[transition]), 10) * 1000);
                                return transitions[transition];
                            }
                        }
                    }

                    function closer() {
                        if (transition.event) {
                            $timeout(function() {
                                if (!scope.isOpen) {
                                    dropoverContents[0].addEventListener(transition.event, transition.handler);
                                }
                            }, transition.duration / 2);
                        } else {
                            dropoverContents.css({
                                'display': 'none'
                            });
                        }
                        elm.removeClass('ngdo-open');
                        scope.isOpen = false;

                        $rootScope.$broadcast('ngDropover.closing', {
                            id: scope.ngDropoverId,
                            element: dropoverContents[0],
                            groupId: scope.config.groupId
                        });

                        angular.element($window).unbind('resize', positionContents);
                    };

                    scope.$on('$destroy', function() {
                        unsetTriggers();
                        angular.element($window).unbind('resize', positionContents);
                        dropoverContents.off('touchstart click', handlers.markEvent);
                    });

                },
                controller: [
                    '$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {

                        $scope.isOpen = false;
                        $scope.ngDropoverId = $scope.target || $scope.$id;

                        //set up event listeners
                        $scope.openListener = $rootScope.$on('ngDropover.open', function(event, ngDropoverId) {
                            $scope.open(ngDropoverId);
                        });

                        $scope.closeListener = $rootScope.$on('ngDropover.close', function(event, ngDropoverId) {
                            $scope.close(ngDropoverId);
                        });

                        $scope.toggleListener = $rootScope.$on('ngDropover.toggle', function(event, ngDropoverId) {
                            $scope.isOpen ? $scope.close(ngDropoverId) : $scope.open(ngDropoverId);
                        });

                        $scope.closeAllListener = $rootScope.$on('ngDropover.closeAll', function(event, mouseEvent) {
                            if (!mouseEvent || mouseEvent.ngDropoverId !== $scope.ngDropoverId && !(!$scope.config.closeOnClickOff && mouseEvent.fromDocument)) {
                                // Unless closeOnClickOff is false and the event was from the document listener
                                $scope.closeAll();
                            }
                        });

                        $scope.$on('$destroy', function() {
                            $scope.openListener();
                            $scope.openListener = null;
                            $scope.closeListener();
                            $scope.closeListener = null;
                            $scope.closeAllListener();
                            $scope.closeAllListener = null;
                            $scope.toggleListener();
                            scope.toggleListener = null;
                        });
                    }
                ]
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

                getStyle: getStyle,

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
                    if (offsetParentEl !== $document[0]) {
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

                    if (!isStaticPositioned(hostEl[0])) {
                        hostElPos.top = -hostEl[0].clientTop;
                        hostElPos.left = -hostEl[0].clientLeft;
                    }

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
                            if (pos1 === "right") {
                                return hostElPos.left + (hostElPos.width - targetElWidth);
                            }
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
