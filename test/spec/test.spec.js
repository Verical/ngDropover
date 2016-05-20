describe("Unit testing dropover", function() {
	var $compile,
		$rootScope;

	beforeEach(module('ngDropover'));

	beforeEach(inject(function(_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
	}));

	it('Dropover starts closed and opens', function() {
		var element = $('<div ng-dropover="myDropover"><div ng-dropover-contents>Contents</div></div>');
		angular.element(document).find('body').append(element)
		$compile(element)($rootScope);
		$rootScope.$apply();
		expect($(element).find('[ng-dropover-contents]').css('display')).toBe('none');
		$rootScope.$emit('ngDropover.open', 'myDropover');
		expect($(element).find('[ng-dropover-contents]').css('display')).not.toBe('none');
		element.remove();
	});

	it('Dropover sends the correct events', function() {
		var fired = {
			opening: 0,
			closing: 0
		};
		$rootScope.$on('ngDropover.opening', function() {
			fired.opening++;
		});
		$rootScope.$on('ngDropover.closing', function() {
			fired.closing++;
		});
		$compile('<div ng-dropover="myDropover"><div ng-dropover-contents>Contents</div></div>')($rootScope);
		$rootScope.$emit('ngDropover.open', 'myDropover');
		$rootScope.$emit('ngDropover.close', 'myDropover');
		$rootScope.$emit('ngDropover.toggle', 'myDropover');
		$rootScope.$emit('ngDropover.closeAll', '');
		$rootScope.$emit('ngDropover.open', 'myDropover');
		$rootScope.$emit('ngDropover.closeAll', 'myDropover');
		expect(fired.opening).toBe(3);
		expect(fired.closing).toBe(2);
	});

	it('Handles empty contents', function() {
		var element = $compile('<div ng-dropover></div>')($rootScope);
		expect(element.html()).toContain("Oops, you forgot to specify what goes in the dropdown");
		element.remove();
	});
});