angular.module('example').run(function($rootScope){

	$rootScope.greeting = 'Hello';
	var links = document.querySelectorAll('.menu-link > a');

	Array.prototype.forEach.call(links, function(elem){
		angular.element(elem).on('click', function(event){
			event.closeParentDropover = true;
		});
	});
}).directive('testDirective', function($interval){
	return {
		templateUrl: '../src/template2.tpl.html',
		link: function(scope, elem, attrs) {
			scope.markEvent = function(event) {
				event.closeParentDropover = true;
			};

			scope.delayClose = function() {
				scope.countdown = 3;
				var count = $interval(function(){
					scope.countdown--;
					if (scope.countdown == 0) {
						scope.$emit('ngDropover.close', { ngDropoverId: 'directiveEx' });
						$interval.cancel(count);
					}
				}, 1000);
			};
		}
	};
});