const { interval } = rxjs;
const { map, filter, tap } = rxjs.operators;

angular.module('app', [
  'asyncFilterModule'
])
.component('heroDetail', {
  template: `
    <div>Name: {{$ctrl.hero | async:this }}</div>
    <div>Name: {{$ctrl.hero1 | async:this }}</div>
    <button ng-click="$ctrl.toggleMe()">Toggle Me</button>
    <div ng-if="$ctrl.toggle1">Name: {{$ctrl.hero2 | async:this }}</div>
  `,
  bindings: {
    hero: '=',
    hero1: '=',
    hero2: '='
  }
})
.controller('MainCtrl', function MainCtrl() {
  this.toggle1 = false;
  this.toggleMe = () => {
    this.toggle1 = !this.toggle1;
  }
  this.hero = new Promise((res, rej) => {
      res('This is a hero value');
  });

  this.hero1 = new Promise((res, rej) => {
    setTimeout(() => {
      res('This is a hero1 value');
    }, 2000);
  });

  this.hero2 = interval(1000)
    .pipe(
      tap(res => {
        console.log(res)
      }),
      map(res => res*2)
    );
});