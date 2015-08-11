angular.module('example').run(function($rootScope){

	var links = document.querySelectorAll('.menu-link > a');

	Array.prototype.forEach.call(links, function(elem){
		angular.element(elem).on('click', function(event){
			$rootScope.$emit('ngDropover.closeAll', { ngDropoverId: null});
		});
	});
}).directive('testDirective', function($interval){
	return {
		templateUrl: '../src/template2.tpl.html',
		link: function(scope, elem, attrs) {
			scope.markEvent = function(event) {
				scope.$emit('ngDropover.close', { ngDropoverId: 'directiveEx' });
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