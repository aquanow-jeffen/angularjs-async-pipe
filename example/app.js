const { interval } = rxjs;
const { map, startWith } = rxjs.operators;

angular.module('app', [
  'asyncFilterModule'
])
.controller('MainCtrl', function MainCtrl() {
  this.toggle = false;
  this.toggleMe = () => {
    this.toggle = !this.toggle;
  }
  this.promise = new Promise((res, rej) => {
      res('Resoved immediately.');
  });

  this.promiseWithTimeout = new Promise((res, rej) => {
    setTimeout(() => {
      res('Resolved in 2000ms.');
    }, 2000);
  });

  this.obs$ = interval(1000)
    .pipe(
      startWith(0),
      map(res => `${res*2}`)
    );
});