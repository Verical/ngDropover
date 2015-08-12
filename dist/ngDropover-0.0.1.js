/**
 * ngDropover v0.0.1 - 2015-08-12
 * A custom angular directive to handle dropdowns and popovers with custom content
 *
 * Copyright (c) 2015 Ricky Sandoval <ricky.sandoval92@gmail.com> and Tony Smith <tony@naptown.com>
 * Licensed MIT
 */
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
            $document.on('click', function(event) {
                event.fromDocument = true;
                $rootScope.$emit("ngDropover.closeAll", event);
            });
        })
        .constant(
            'ngDropoverConfig', {
                'horizontalOffset': 0,
                'verticalOffset': 0,
                'closeOthersOnOpen': true,
                'trigger': '',
                'triggerEvent': 'click',
                'position': 'bottom-left',
                'closeOnClickOff': true,
                'classOnly': false,
                'group': ''
            }
        )
        .factory('triggerHelper', function() {

            var triggerMap = {
                'mouseenter': 'mouseleave',
                'click': 'click',
                'focus': 'blur'
            };

            return {
                getTriggers: function(trigger) {
                    var show = trigger;
                    var hide = triggerMap[show] || show;
                    if (trigger === 'hover') {
                        return {
                            show: 'mouseenter',
                            hide: 'mouseleave'
                        };
                    }
                    return {
                        show: show,
                        hide: hide
                    };
                }
            };
        })
        .directive('ngDropover', function(ngDropoverConfig, $rootScope, $position, $document, $window, triggerHelper) {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    target: '@ngDropover',
                    ngDropoverOptions: '@ngDropoverOptions'
                },
                link: function(scope, elm, attrs) {

                    var dropoverContents, triggerElements, handlers, showContents, hideContents;

                    init();
                    function init() {
                        scope.config = angular.extend({}, ngDropoverConfig, scope.$eval(scope.ngDropoverOptions));
                        setHtml();
                        handlers = {
                            toggle: function(e) {
                                // This is to check if the event came from inside the directive contents
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
                            setTriggers();
                            setMethods();
                        }, true);
                        setTriggers();
                        setMethods();
                        dropoverContents.on('click', handlers.markEvent);
                    }

                    function setMethods(){
                        if (scope.config.classOnly === true){
                            showContents = hideContents = function(){};
                            positionContents();
                        } else {
                            showContents = function(){
                                dropoverContents.css('visibility', 'visible');
                            }
                            hideContents = function(){
                                dropoverContents.css('visibility', 'hidden');
                            }
                            dropoverContents.css('visibility', 'hidden');
                        }
                    }

                    function setHtml() {
                        dropoverContents = getDropoverContents();
                        elm.addClass(scope.config.wrapperClass);
                        dropoverContents.css({
                            'position': 'absolute'
                        }).addClass('ng-dropover-contents');
                    }

                    //Get the trigger from the config if the user set it. Otherwise the trigger will default to the scope's element
                    function setTriggers() {
                        triggerElements = [elm];
                        var triggerObj = triggerHelper.getTriggers(scope.config.triggerEvent);
                        if (scope.config.trigger !== "") {
                            triggerElements = document.querySelectorAll(scope.config.trigger);
                        }
                        for (var i = 0; i < triggerElements.length; i++){
                            var el = angular.element(triggerElements[i]);

                            el.addClass('ng-dropover-trigger');

                            //If the the trigger's event to open matches the event to close, then send to the toggle method
                            //else send to individual open and close methods
                            if (triggerObj.show === triggerObj.hide) {
                                el.on(triggerObj.show, handlers.toggle);
                            } else {
                                el.on(triggerObj.show, handlers.open);

                                el.on(triggerObj.hide, handlers.close);
                            }

                        }
                    }

                    function unsetTriggers() {
                        var triggerObj = triggerHelper.getTriggers(scope.config.triggerEvent);
                        for (var i = 0; i < triggerElements.length; i++){
                            var el = angular.element(triggerElements[i]);
                            if (triggerObj.show === triggerObj.hide) {
                                el.off(triggerObj.show, handlers.toggle);
                            } else {
                                el.off(triggerObj.show, handlers.open);

                                el.off(triggerObj.hide, handlers.close);
                            }
                        }
                    }

                    //ToDo: add class for each position; remove old class dropoverContents.addClass(scope.config.position);
                    function positionContents() {
                        var positions = $position.positionElements(elm, dropoverContents, scope.config.position, false);
                        var offX = parseInt(scope.config.horizontalOffset, 10) || 0;
                        var offY = parseInt(scope.config.verticalOffset, 10) || 0;
                        dropoverContents.css('left', positions.left + offX + 'px');
                        dropoverContents.css('top', positions.top + offY + 'px');
                    }

                    //ToDo: bottom/top-right should stay with the elm boundries I think
                    //ToDo: add class for each position; remove old class dropoverContents.addClass(scope.config.position);
                    // function positionContents() {
                    //     var offX = parseInt(scope.config.offsetX, 10) || 0;
                    //     var offY = parseInt(scope.config.offsetY, 10) || 0;

                    //     if (getStyle(dropoverContents[0], 'display') == 'none'){
                    //         var vis = getStyle(dropoverContents[0], 'visibility');
                    //         dropoverContents.css('visibiliy', 'hidden');
                    //         dropoverContents.css('display', '');
                    //         var positions = $position.positionElements(elm, dropoverContents, scope.config.position, false);
                    //         dropoverContents.css('left', positions.left + offX + 'px');
                    //         dropoverContents.css('top', positions.top + offY + 'px');
                    //         dropoverContents.css('display', 'none');
                    //         dropoverContents.css('visibiliy', vis);
                    //     } else {
                    //         var positions = $position.positionElements(elm, dropoverContents, scope.config.position, false);
                    //         dropoverContents.css('left', positions.left + offX + 'px');
                    //         dropoverContents.css('top', positions.top + offY + 'px');
                    //     }
                    // }

                    function getDropoverContents() {
                        var ret;
                        if (elm[0].querySelector('[ng-dropover-contents]')) {
                            ret = angular.element(elm[0].querySelector('[ng-dropover-contents]')).addClass(scope.config.group);
                            return ret;
                        } else {

                            ret = angular.element("<div class='ng-dropover-empty'>Oops, you forgot to specify what goes in the dropdown</div>").addClass(scope.config.group);
                            elm.append(ret);
                            return ret;
                        }
                    }

                    scope.open = function(ngDropoverId) {
                        if (ngDropoverId === scope.ngDropoverId && !scope.isOpen) {
                            positionContents();

                            //start the display process and fire events
                            $rootScope.$broadcast('ngDropover.opening', {
                                id: scope.ngDropoverId,
                                element: dropoverContents[0],
                                group: scope.config.group
                            });
                            showContents();
                            elm.addClass('ng-dropover-open');
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

                    function closer() {
        
                        $rootScope.$broadcast('ngDropover.closing', {
                            id: scope.ngDropoverId,
                            element: dropoverContents[0],
                            group: scope.config.group
                        });
                        hideContents();
                        elm.removeClass('ng-dropover-open');
                        scope.isOpen = false;

                        angular.element($window).unbind('resize', positionContents);
                    };

                    scope.$on('$destroy', function() {
                        unsetTriggers();
                        angular.element($window).unbind('resize', positionContents);
                        dropoverContents.off('click', handlers.markEvent);
                    });

                    function getStyle(el, cssprop) {
                        if (el.currentStyle) { //IE
                            return el.currentStyle[cssprop];
                        } else if ($window.getComputedStyle) {
                            return $window.getComputedStyle(el)[cssprop];
                        }
                        // finally try and get inline style
                        return el.style[cssprop];
                    }

                },
                controller: [
                    '$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {

                        $scope.isOpen = false;
                        $scope.ngDropoverId = $scope.target || $scope.$id;

                        //set up event listeners
                        $scope.openListener = $rootScope.$on('ngDropover.open', function(event, m) {
                            $scope.open(m.ngDropoverId);
                        });

                        $scope.closeListener = $rootScope.$on('ngDropover.close', function(event, m) {
                            $scope.close(m.ngDropoverId);
                        });

                        $scope.closeAllListener = $rootScope.$on('ngDropover.closeAll', function(event, m) {
                            if (m.ngDropoverId === $scope.ngDropoverId) {

                            } else {
                                // Unless closeOnClickOff is false and the event was from the document listener
                                if (!(!$scope.config.closeOnClickOff && m.fromDocument)) {
                                    $scope.closeAll();
                                }
                            }
                        });

                        $scope.toggleListener = $rootScope.$on('ngDropover.toggle', function(event, m) {
                            $scope.isOpen ? $scope.close(m.ngDropoverId) : $scope.open(m.ngDropoverId);
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
                                return hostElPos.left + (hostElPos.width-targetElWidth);
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
