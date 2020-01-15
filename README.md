# AngularJS Async Filter

[![npm version](https://img.shields.io/npm/v/angularjs-async-filter?color=brightgreen)](https://badge.fury.io/js/angularjs-async-filter)
[![CircleCI](https://circleci.com/gh/Jeffen/angularjs-async-pipe.svg?style=shield)](https://circleci.com/gh/Jeffen/angularjs-async-pipe)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

## How to use
This package is built as a UMD module. You can import it the way you like.

1. import module
```javascript
angular.module('MY_MODULE', [ 'AsyncFilterModule' ]);
```

2. Use in template. Input object can be either a Promise or Observable.
```html
<span>{{ myPromise$ | async:this }}</span>
<span>{{ myObservable$ | async:this }}</span>
```

### Use with CDN

```html
<script src="https://unpkg.com/angularjs-async-filter@0.1.0/lib/index.min.js"></script>
```

## ⚠️ Caveat

This filter will handle subscription and unsubscription upon $scope is created and destroyed. But please be mindful that reassign the input of the filter will make previous object not being garbadge collected until the controller is destroyed. 

If possible, using **ng-if** to toggle the filter would be more performant and memory-friendly.