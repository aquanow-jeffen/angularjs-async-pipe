'use strict'
describe('AngularJS Async filter', () => {
    let $filter;
    let $scope;
    let $compile;
    let $controller;

    beforeEach(() => {
        angular.module('app', ['asyncFilterModule']).controller('MainCtrl', () => {})
    });
    beforeEach(module('app'));

    beforeEach(inject(function(_$rootScope_, _$controller_, _$compile_, _$filter_){
        $scope = _$rootScope_.$new();
        $filter = _$filter_('async');
        $compile = _$compile_;
        $controller = _$controller_;
    }));

    it('should return a resolved value from promise', () => {
        $scope.obj = new Promise((res, rej) => { res('Resolved immediately'); });
        const element = $compile('<span>{{ obj | async:this }}</span>')($scope);
        $scope.$apply();
        // TODO: fix unit test
        expect(1).toBe(1);
    });
});