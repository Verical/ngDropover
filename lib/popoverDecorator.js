(function(window, document, undefined) {
    'use strict';

    // Cache position class names for easy removal
    var positionClasses = 'top left bottom right';

    angular.module('ui.bootstrap.position').config(['$provide', function($provide) {
        $provide.decorator('$position', ['$delegate', function($delegate) {
            // Save the original function
            var positionElementsFn = $delegate.positionElements;

            // Override the $position.positionElements function
            $delegate.positionElements = function($hostEl, $popoverEl, positionStr, appendToBody) {
                // select box position setting - will be removed!
                arguments[2] = document.getElementById('position').value;

                // If host element is partially offscreen we won't have enough room to "bump" the popover
                if (arguments[2] === 'left' || arguments[2] === 'right') {
                    var hostTrueOffset = _.realViewPosition($hostEl[0]);
                    if (hostTrueOffset.top < 0) {
                        arguments[2] = 'bottom';
                    } else if (hostTrueOffset.top + $hostEl[0].offsetHeight >= document.documentElement.clientHeight) {
                        arguments[2] = 'top';
                    }
                }

                // Always update the popover with the final classname
                $popoverEl.removeClass(positionClasses).addClass(arguments[2]);

                // Let bootstrap calc the starting position
                var position = positionElementsFn.apply($delegate, arguments);
                var parentTrueOffset = _.realViewPosition($popoverEl[0].offsetParent);

                // Calc the real offset for bootstrap's intended position
                var predictedTrueOffset = {
                    left: position.left + parentTrueOffset.left,
                    top: position.top + parentTrueOffset.top
                }

                // Cache the right/bottom coords of the popover
                var popoverEl = $popoverEl[0];
                var popoverBottom = predictedTrueOffset.top + popoverEl.offsetHeight;
                var popoverRight = predictedTrueOffset.left + popoverEl.offsetWidth;

                // Cache the host
                var hostEl = $hostEl[0];
                var hostBottom = hostEl.offsetTop + hostEl.offsetHeight;
                var hostLeft = hostEl.offsetLeft;
                var hostRight = hostEl.offsetLeft + hostEl.offsetWidth;

                // Cache viewport edge booleans
                var isOffTop = predictedTrueOffset.top <= 0;
                var isOffLeft = predictedTrueOffset.left <= 0;
                var isOffRight = popoverRight >= document.documentElement.clientWidth;
                var isOffBottom = popoverBottom >= document.documentElement.clientHeight;

                // Cache the arrow overrides and apply later, it's position will change a bit
                var arrow = popoverEl.querySelector('.arrow');
                var arrowLeft;
                var arrowTop;
                var arrowMarginTop;

                if (arguments[2] === 'left' || arguments[2] === 'right') {
                    if (isOffTop) {
                        position.top += Math.abs(predictedTrueOffset.top);
                    } else if (isOffBottom) {
                        position.top += document.documentElement.clientHeight - popoverBottom;
                    }
                    arrowMarginTop = 0;
                    arrowTop = (hostEl.offsetTop - position.top) + ((hostEl.offsetHeight - arrow.offsetHeight) / 2);
                } else {
                    if (isOffTop) {
                        position.top = hostBottom;
                        $popoverEl.removeClass(positionClasses).addClass('bottom');
                    } else if (isOffBottom) {
                        $popoverEl.removeClass(positionClasses).addClass('top');
                        position.top = hostEl.offsetTop - popoverEl.offsetHeight;
                    }
                }

                if (isOffLeft) {
                    if (arguments[2] === 'left') {
                        $popoverEl.removeClass(positionClasses).addClass('right');
                        position.left = hostRight;
                    } else {
                        position.left = hostLeft;
                        arrowLeft = hostEl.offsetWidth / 2;
                    }
                }

                if (isOffRight) {
                    if (arguments[2] === 'right') {
                        $popoverEl.removeClass(positionClasses).addClass('left');
                        position.left = hostLeft - popoverEl.offsetWidth;
                    } else {
                        position.left = hostRight - popoverEl.offsetWidth;
                        arrowLeft = popoverEl.offsetWidth - (hostEl.offsetWidth / 2);
                    }
                }

                // CSS-ify the arrow position overrides, if any
                if (typeof arrowLeft === 'number') {
                    arrowLeft += 'px';
                }
                if (typeof arrowTop === 'number') {
                    arrowTop += 'px';
                }

                // Set final arrow css
                var css = {
                    left: arrowLeft || arrow.offsetLeft,
                    top: arrowTop || arrow.offsetTop
                };
                if (typeof arrowMarginTop === 'number') {
                    css['margin-top'] = arrowMarginTop;
                }
                angular.element(arrow).css(css);

                return position;
            };

            return $delegate;
        }]);
    }]);
}(window, window.document));
