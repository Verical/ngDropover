describe("Unit testing dropover", function() {
	var $compile,
		$rootScope;

	beforeEach(module('ngDropover'));

	beforeEach(inject(function(_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
	}));

	it('Dropover starts closed and opens', function() {
		var element = $compile('<div ng-dropover="myDropover"><div ng-dropover-contents>Contents</div></div>')($rootScope);
		expect($(element).find('[ng-dropover-contents]').css('display')).toBe('none');
		$rootScope.$emit('ngDropover.open', 'myDropover');
		expect($(element).find('[ng-dropover-contents]').css('display')).not.toBe('none');
		element.remove();
	});

	it('Handles empty contents', function() {
		var element = $compile('<div ng-dropover></div>')($rootScope);
		expect(element.html()).toContain("Oops, you forgot to specify what goes in the dropdown");
		element.remove();
	});

	describe('events', function() {
		var dropId = 'dropn',
			scope,
			element,
			html;

		html =
			'<div ng-dropover="' + dropId + '">' +
				'<div ng-dropover-contents>Contents</div>' +
			'</div>';


		function assertOpen() {
			var display = jQuery(element).find('[ng-dropover-contents]').css('display');
			expect(display).not.toBe('none');
		}

		function assertClosed() {
			var display = jQuery(element).find('[ng-dropover-contents]').css('display');
			expect(display).toBe('none');
		}


		beforeEach(function() {
			scope = $rootScope.$new();
			element = $compile(html)(scope);
			scope.$apply();
		});

		afterEach(function() {
			scope.$destroy();
			element.remove();
			off = null;
		});

		it('Dropover sends the correct events', function() {
			var fired = {
				opening: 0,
				closing: 0
			};

			scope.$on('ngDropover.opening', function() {
				fired.opening++;
			});
			scope.$on('ngDropover.closing', function() {
				fired.closing++;
			});

			scope.$emit('ngDropover.open', dropId);
			assertOpen();

			scope.$emit('ngDropover.close', dropId);
			assertClosed();

			scope.$emit('ngDropover.toggle', dropId);
			assertOpen();

			scope.$emit('ngDropover.closeAll');
			assertClosed();

			scope.$emit('ngDropover.open', dropId);
			assertOpen();

			// Doesn't close dropover because the id matches
			scope.$emit('ngDropover.closeAll', dropId);
			assertOpen();

			expect(fired.opening).toBe(3);
			expect(fired.closing).toBe(2);
		});

		it('Can prevent open and close events', function() {
			var off;

			function enable() {
				if (off) {
					off(), off = null;
				}
			}

			function disable(e) {
				off = scope.$on('ngDropover.' + e,
					function stopEvent(event) {
						event.preventDefault();
					}
				);
			}

			disable('opening');

			scope.$emit('ngDropover.open', dropId);
			assertClosed();

			enable();

			scope.$emit('ngDropover.open', dropId);
			assertOpen();

			disable('closing');

			scope.$emit('ngDropover.close', dropId);
			assertOpen();

			enable();

			scope.$emit('ngDropover.close', dropId);
			assertClosed();

			disable('opening');

			scope.$emit('ngDropover.toggle', dropId);
			assertClosed();

			enable();

			scope.$emit('ngDropover.toggle', dropId);
			assertOpen();

			disable('closing');

			scope.$emit('ngDropover.closeAll');
			assertOpen();

			enable();

			// Prevent closing by providing id
			scope.$emit('ngDropover.closeAll', dropId);
			assertOpen();

			// actually close
			scope.$emit('ngDropover.closeAll');
			assertClosed();
		});

	});
});
