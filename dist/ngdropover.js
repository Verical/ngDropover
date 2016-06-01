/* global angular */
(function(window, document) {
    'use strict';

    /*
     * AngularJS ngDropover
     * Version: 1.1.2
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
        .run(['$document', '$rootScope', function($document, $rootScope) {

            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function(elt /*, from*/ ) {
                    var len = this.length >>> 0;

                    var from = Number(arguments[1]) || 0;
                    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                    if (from < 0) {
                        from += len;
                    }

                    for (; from < len; from++) {
                        if (from in this && this[from] === elt) {
                            return from;
                        }
                    }
                    return -1;
                };
            }

            $rootScope.scrolling = false;
            $document.on('touchmove', function(event) {
                $rootScope.scrolling = true;
            });
            $document.on('touchend click', function(event) {
                event = (event.originalEvent && event.originalEvent.target) ? event.originalEvent : event;
                var ids = getIds(event.target);
                if (event.ngDropoverId) {
                    ids.push(event.ngDropoverId);
                }
                if (event.which !== 3 && !$rootScope.scrolling) {
                    $rootScope.$emit("ngDropover.documentClick", {
                        fromDocument: true,
                        ngDropoverId: ids
                    });
                }
                $rootScope.scrolling = false;
            });

            function getIds(element) {
                var ids = [];
                while (element && element !== document) {
                    if (element.attributes && element.attributes.getNamedItem('ng-dropover')) {
                        ids.push(element.attributes.getNamedItem('ng-dropover').nodeValue);
                    }
                    if (element.attributes && element.attributes.getNamedItem('ng-dropover-trigger')) {
                        ids.push(($rootScope.$eval(element.attributes.getNamedItem('ng-dropover-trigger').nodeValue).targetId || ''));
                    }
                    element = element.parentNode;
                }
                return ids;
            }
        }])
        .constant(
            'ngDropoverConfig', {
                'horizontalOffset': 0,
                'verticalOffset': 0,
                'triggerEvent': 'click',
                'position': 'bottom-left',
                'closeOnClickOff': true,
                'staticOptions': 'false',
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
                'mouseover': 'mouseleave',
                'click': 'click',
                'focus': 'blur',
                'none': 'none',
                'touchend click': 'touchend click'
            };

            return {
                getTriggers: function(triggerEvent) {
                    if (triggerEvent === 'hover') {
                        triggerEvent = 'mouseover';
                    }
                    if (triggerEvent === 'click') {
                        triggerEvent = 'touchend click';
                    }

                    if (triggerMap.hasOwnProperty(triggerEvent)) {
                        return {
                            'show': triggerEvent,
                            'hide': triggerMap[triggerEvent]
                        };
                    }
                    return null;
                }
            };
        })
        .directive('ngDropover', ['ngDropoverConfig', 'positions', '$rootScope', '$position', '$document', '$window', 'triggerEventsMap', '$timeout', function(ngDropoverConfig, positions, $rootScope, $position, $document, $window, triggerEventsMap, $timeout) {

            function logError(id, element, message) {
                console.log("? ngDropover Error | ID:" + id + " ?");
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

                    function init() {

                        scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                        scope.positions = positions;
                        handlers = {
                            toggle: function(event) {
                                if (fromContents(event)) {
                                    return;
                                }
                                if (event.type === "touchend") {
                                    event.preventDefault();
                                    if ($rootScope.scrolling) {
                                        $rootScope.scrolling = false;
                                        return;
                                    }
                                }
                                scope.toggle(scope.ngDropoverId);
                            },
                            open: function(event) {
                                if (!fromContents(event) && !scope.isOpen) {
                                    scope.open(scope.ngDropoverId);
                                }
                            },
                            close: function(event) {
                                if (!fromContents(event) && scope.isOpen) {
                                    scope.close(scope.ngDropoverId);
                                }
                            },
                            markEvent: function(event) {
                                event = event.originalEvent || event;
                                event['ngDropoverId'] = scope.ngDropoverId;
                            }
                        };
                        setHtml();

                        function fromContents(event) {
                            event = (event.originalEvent && event.originalEvent.target) ? event.originalEvent : event;
                            var element = event.target;
                            if (event.ngDropoverId) {
                                return true;
                            }

                            while (element && element !== document && element !== elm[0]) {
                                if (element.attributes && element.attributes.getNamedItem('ng-dropover-contents')) {
                                    return true;
                                }
                                element = element.parentNode;
                            }
                            return false;
                        }

                        setDropoverObj();

                        if (!scope.config.staticOptions) {
                            scope.$watch('ngDropoverOptions', function() {
                                unsetTriggers();
                                scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                                if (typeof(scope.config.position) !== 'string' || scope.positions.indexOf(scope.config.position) === -1) {
                                    logError(scope.ngDropoverId, angular.element(elm), "Position must be a string and one of these values: " + scope.positions);
                                    scope.config.position = "bottom-left";
                                }
                                setTriggers();
                                positionContents();
                                setPositionClass();
                            }, true);
                        } else {
                            unsetTriggers();
                            scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                            if (typeof(scope.config.position) !== 'string' || scope.positions.indexOf(scope.config.position) === -1) {
                                logError(scope.ngDropoverId, angular.element(elm), "Position must be a string and one of these values: " + scope.positions);
                                scope.config.position = "bottom-left";
                            }
                            setTriggers();
                            positionContents();
                            setPositionClass();
                        }

                        $document.ready(function() {
                            positionContents();
                        });
                    }

                    init();

                    function setHtml() {
                        elm.addClass(scope.config.groupId + " ngdo");
                        elm.attr("ng-dropover", scope.ngDropoverId);
                        dropoverContents = getDropoverContents();
                        dropoverContents.css({
                            'position': 'absolute',
                            'display': 'none'
                        }).addClass('ngdo-contents ' + scope.config.groupId);
                        transition.event = getTransitions();
                        transition.handler = function(event) {
                            if (event.propertyName === "visibility") {
                                return;
                            }
                            dropoverContents.css({
                                'display': 'none'
                            });
                            dropoverContents[0].removeEventListener(transition.event, transition.handler);
                        };
                        dropoverContents.on('touchend click', handlers.markEvent);
                    }

                    function setDropoverObj() {
                        scope.dropoverObj = {
                            options: scope.config,
                            id: scope.ngDropoverId,
                            children: elm[0].querySelectorAll('[ng-dropover]'),
                            element: elm,
                            dropoverContents: dropoverContents
                        };
                    }

                    //Get the trigger from the config if the user set it. Otherwise the trigger will default to the scope's element
                    function setTriggers() {
                        var triggerObj = triggerEventsMap.getTriggers(scope.config.triggerEvent);
                        if (!triggerObj) {
                            logError(scope.ngDropoverId, angular.element(elm), "triggerEvent must be a string: 'none', 'click', 'hover', 'focus'");
                        }

                        if (triggerObj && triggerObj.show !== "none") {
                            //If the the trigger's event to open matches the event to close, then send to the toggle method
                            //else send to individual open and close methods
                            if (triggerObj.show === triggerObj.hide) {
                                elm.on(triggerObj.show, handlers.toggle);
                            } else {
                            
                                if (isLink(elm[0])) {
                                    elm.on('touchend', handlers.toggle);
                                }
                                elm.on(triggerObj.show, handlers.open);
                                elm.on(triggerObj.hide, handlers.close);
                                if (scope.config.triggerEvent === 'hover') {
                                    dropoverContents.on('mouseleave', function(event) {
                                        if (!toTrigger(event)) {
                                            handlers.close({});
                                        }
                                    });
                                }
                            }
                        }
                    }

                    function isLink(element) {
                       if (element.attributes && (element.attributes.getNamedItem('ng-click') || element.attributes.getNamedItem('href'))){
                        return true;
                       } 
                       return false;
                    }

                    function unsetTriggers() {
                        var triggerObj = triggerEventsMap.getTriggers(scope.config.triggerEvent);
                        if (!triggerObj || triggerObj.show === 'none') {
                            return;
                        }
                        if (triggerObj.show === triggerObj.hide) {
                            elm.off(triggerObj.show, handlers.toggle);
                        } else {
                            if (isLink(elm[0])) {
                                elm.off('touchend', handlers.toggle);
                            }
                            elm.off(triggerObj.show, handlers.open);
                            elm.off(triggerObj.hide, handlers.close);
                            if (scope.config.triggerEvent === 'hover') {
                                dropoverContents.off('mouseleave', function(event) {
                                    if (!toTrigger(event)) {
                                        handlers.close({});
                                    }
                                });
                            }
                        }
                    }

                    function toTrigger(event) {
                        event = (event.originalEvent && event.originalEvent.target) ? event.originalEvent : event;
                        var element = event.target;

                        while (element && element !== document) {
                            if (element === elm[0]) {
                                return true;
                            }
                            element = element.parentNode;
                        }
                        return false;
                    }

                    function positionContents() {

                        var offX, offY, positions, oldVis, oldDisplay;

                        offX = parseInt(scope.config.horizontalOffset, 10) || 0;
                        offY = parseInt(scope.config.verticalOffset, 10) || 0;
                        oldDisplay = $position.getStyle(dropoverContents[0], 'display');
                        dropoverContents.css({
                            'visibility': 'hidden',
                            'display': ''
                        });

                        positions = $position.positionElements(elm, dropoverContents, scope.config.position, false);
                        dropoverContents.css({
                            'left': positions.left + offX + 'px',
                            'top': positions.top + offY + 'px',
                            'display': oldDisplay,
                            'visibility': ''
                        });
                    }

                    function setPositionClass() {
                        var classList = elm[0].className.split(' ');
                        for (var i = 0, l = classList.length; i < l; i++) {
                            var stripPrefix = classList[i].substring(5, classList[i].length);
                            if (scope.positions.indexOf(stripPrefix) > 0) {
                                elm.removeClass(classList[i]);
                            }
                        }
                        elm.addClass('ngdo-' + scope.config.position);
                    }

                    function getDropoverContents() {
                        var ret;
                        if (elm[0].querySelector('[ng-dropover-contents]')) {
                            ret = angular.element(elm[0].querySelector('[ng-dropover-contents]'));
                            return ret;
                        } else {

                            ret = angular.element("<div class='ngdo-empty'>Oops, you forgot to specify what goes in the dropdown</div>");
                            elm.append(ret);
                            return ret;
                        }
                    }

                    scope.open = function(ngDropoverId) {
                        if (transition.event) {
                            dropoverContents[0].removeEventListener(transition.event, transition.handler);
                        }
                        if (ngDropoverId === scope.ngDropoverId && !scope.isOpen) {

                            positionContents();

                            //start the display process and fire events
                            $rootScope.$broadcast('ngDropover.opening', scope.dropoverObj);
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

                    scope.closeAll = function(ngDropoverId) {
                        if (scope.isOpen && ngDropoverId !== scope.ngDropoverId) {
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
                        var t;
                        for (t in transitions) {
                            if (dropoverContents[0].style[t] !== undefined && parseFloat($position.getStyle(dropoverContents[0], propertyCheck[t]), 10) > 0) {
                                transition.duration = Math.floor(parseFloat($position.getStyle(dropoverContents[0], propertyCheck[t]), 10) * 1000);
                                return transitions[t];
                            }
                        }
                        return undefined;
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

                        $rootScope.$broadcast('ngDropover.closing', scope.dropoverObj);

                        angular.element($window).unbind('resize', positionContents);
                    }

                    scope.$on('$destroy', function() {
                        unsetTriggers();
                        angular.element($window).unbind('resize', positionContents);
                        dropoverContents.off('touchend click', handlers.markEvent);
                    });

                },
                controller: [
                    '$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {

                        $scope.isOpen = false;

                        $scope.ngDropoverId = $scope.target || ('' + $scope.$id);

                        //set up event listeners
                        $scope.openListener = $rootScope.$on('ngDropover.open', function(event, ngDropoverId) {
                            $scope.open(ngDropoverId);
                        });

                        $scope.closeListener = $rootScope.$on('ngDropover.close', function(event, ngDropoverId) {
                            $scope.close(ngDropoverId);
                        });

                        $scope.toggleListener = $rootScope.$on('ngDropover.toggle', function(event, ngDropoverId) {
                            if (!$scope.isOpen) {
                                $scope.open(ngDropoverId);
                            } else {
                                $scope.close(ngDropoverId);
                            }
                        });

                        $scope.closeAllListener = $rootScope.$on('ngDropover.closeAll', function(event, ngDropoverId) {
                            $scope.closeAll(ngDropoverId);
                        });

                        $scope.documentClickListener = $rootScope.$on('ngDropover.documentClick', function(event, info) {
                            if ((!info.ngDropoverId || (info.ngDropoverId).indexOf($scope.ngDropoverId) < 0) && !(!$scope.config.closeOnClickOff && info.fromDocument)) {
                                // Unless closeOnClickOff is false and the event was from the document listener
                                $scope.closeAll();
                            }
                        });

                        $scope.$on('$destroy', function() {
                            $scope.openListener();
                            $scope.openListener = null;
                            $scope.closeListener();
                            $scope.closeListener = null;
                            $scope.toggleListener();
                            $scope.toggleListener = null;
                            $scope.closeAllListener();
                            $scope.closeAllListener = null;
                            $scope.documentClickListener();
                            $scope.documentClickListener = null;
                        });
                    }
                ]
            };
        }]).factory('$position', ['$document', '$window', function($document, $window) {

            function getStyle(el, cssprop) {
                if (el.currentStyle) { //IE
                    return el.currentStyle[cssprop];
                } else if ($window.getComputedStyle) {
                    return $window.getComputedStyle(el, null).getPropertyValue(cssprop);
                } else {
                    return el.style[cssprop];
                }
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
        }])
        .directive('ngDropoverTrigger', ['$rootScope', '$document', 'triggerEventsMap', function($rootScope, $document, triggerEventsMap) {
            return {
                restrict: 'AE',
                scope: {
                    triggerOptions: '@ngDropoverTrigger'
                },
                link: function(scope, element, attrs) {
                    var options = scope.$eval(scope.triggerOptions);

                    var triggerObj = triggerEventsMap.getTriggers(options.triggerEvent || 'click');
                    element.addClass('ngdo-trigger');

                    var handlers = {
                        action: function(event) {
                            scope.$emit('ngDropover.' + options.action, options.targetId);
                        },
                        toggle: function(event) {
                            if (event.type === 'touchend') {
                                event.preventDefault();
                                if ($rootScope.scrolling) {
                                    $rootScope.scrolling = false;
                                    return;
                                }
                            }
                            scope.$emit('ngDropover.toggle', options.targetId);
                        },
                        show: function(event) {
                            scope.$emit('ngDropover.open', options.targetId);
                        },
                        hide: function(event) {
                            scope.$emit('ngDropover.close', options.targetId);
                        },
                        touch: function(event) {
                            event.preventDefault();
                            if ($rootScope.scrolling) {
                                $rootScope.scrolling = false;
                                return;
                            }
                            scope.$emit('ngDropover.' + (options.action || 'toggle'), options.targetId);
                        }
                    };

                    if (options.action === "open" || options.action === "close") {
                        element.on(triggerObj.show, handlers.action);
                    } else {
                        if (triggerObj.show === triggerObj.hide) {
                            element.on(triggerObj.show, handlers.toggle);
                        } else {
                            element.on(triggerObj.show, handlers.show);

                            element.on(triggerObj.hide, handlers.hide);
                        }
                    }
                    if (options.triggerEvent === 'hover') {
                        element.on('touchend', handlers.touch);
                    }

                    scope.$on('destroy', function() {
                        if (options.action === "open" || options.action === "close") {
                            element.off(triggerObj.show, handlers.action);
                        } else {
                            if (triggerObj.show === triggerObj.hide) {
                                element.off(triggerObj.show, handlers.toggle);
                            } else {
                                element.off(triggerObj.show, handlers.show);

                                element.off(triggerObj.hide, handlers.hide);
                            }
                        }
                        if (options.triggerEvent === 'hover') {
                            element.off('touchend', handlers.touch);
                        }
                    });
                }
            };
        }]);
})(window, document);
