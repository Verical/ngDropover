AngularJS-ngDropover
=================

**AngularJS ngDropover** is a feature-rich, event-driven solution for dropdowns, popovers, tooltips, or any other time you need a trigger or triggers to hide-show elements. The only dependency is AngularJS and your imaaginaaaationnnn!

### Current Version 1.0.0

## Demo and Docs
[Check out the directive's website for all the documentation and example goodness ](http://verical.github.io/#/ngDropover) - Prepare your eyeballs

## Installation

##### Install with NPM
```html
npm install --save ngdropover
```

##### Add it to your module
```
angular.module('myApp', ['ngDropover'])
```


## Basic Usage
```html
<div class="ngdo" ng-dropover ng-dropover-options="{'position':'bottom-center','triggerEvent':'hover'}">
    <button class="regular-button">Hover Over Me!</button>
    <div ng-dropover-contents>
        Dropover contents can be plain HTML, an ng-include, or another directive...even another ngDropover!
    </div>
</div>
```


### Other Options

```html
Coming Soon
```

		
## Authors
**Ricky Sandoval**
**Tony Smith**

## Credits


## Copyright
Copyright © 2015.

## License 
AngularJS-ngDropover is under MIT license - http://www.opensource.org/licenses/mit-license.php

##Changes Log
