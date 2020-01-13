import * as angular from 'angular';
import { IScope } from 'angular';
import { Observable, SubscriptionLike } from 'rxjs';

type Subscription = SubscriptionLike | Promise<any>;

type AsyncObject<T> = Observable<T> | Promise<T>;

interface SubscriptionStrategy {
    getValue(): any;
    createSubscription(async: AsyncObject<any>, updateLatestValue: any): Subscription;
    dispose(): void;
    onDestroy(): void;
}

class ObservableStrategy implements SubscriptionStrategy {
    private _subscription: SubscriptionLike;
    private _latestValue: any = null;

    createSubscription(async: Observable<any>, updateLatestValue: any): SubscriptionLike {
        const nextFn = (res: any) => {
            this._latestValue = res;
            return updateLatestValue(res);
        };
        this._subscription = async.subscribe({next: nextFn, error: (e: any) => { throw e; }});
        return this._subscription;
    }

    getValue(): any {
        return this._latestValue;
    }

    dispose(): void {
        this._subscription.unsubscribe();
        this._latestValue = null;
    }

    onDestroy(): void { this._subscription.unsubscribe(); }
}

class PromiseStrategy implements SubscriptionStrategy {
    private _subscription: Promise<any>;
    private _latestValue: any = null;

    createSubscription(async: Promise<any>, updateLatestValue: (v: any) => any): Promise<any> {
        const thenFn = (res: any) => {
            this._latestValue = res;
            return updateLatestValue(res);
        };
        this._subscription = async.then(thenFn, e => { throw e; });
        return this._subscription;
    }

    getValue(): any {
        return this._latestValue;
    }

    dispose(): void {}

    onDestroy(): void {}
}
  
function isObservable(obj: any): obj is Observable<any> {
    return typeof obj.subscribe === 'function';
}

function isPromise(obj: any): obj is Promise<any> {
    return typeof obj.then === 'function';
}

class AsyncFilterClass {
    private _subscriptionMap: WeakMap<AsyncObject<any>, SubscriptionStrategy>;
    // private _latestValueMap: WeakMap<AsyncObject<any>, any>;

    constructor() {
        this.transform = this.transform.bind(this);
        this._subscriptionMap = new WeakMap();
        // this._latestValueMap = new WeakMap();
    }

    private _selectStrategy(obj: AsyncObject<any>) {
        if (isPromise(obj)) {
            return new PromiseStrategy();
        }
        if (isObservable(obj)) {
            return new ObservableStrategy();
        }
        throw new TypeError(`AsyncFilter: expect an async type but received: ${typeof obj}`);
    }

    private _subscribe(obj:AsyncObject<any>, scope: IScope): void {
        const strategy: SubscriptionStrategy = this._selectStrategy(obj);
        strategy.createSubscription(
            obj, (value: Object) => this._updateLatestValue(obj, value, scope)
        );
        this._subscriptionMap.set(obj, strategy);
        if (scope && scope.$on) {
            scope.$on('$destroy', () => {
                strategy.dispose();
            });
            console.log(scope, (scope as any).$onInit);
        }
    }

    private _updateLatestValue(async: any, value: Object, scope: IScope): void {
        if (this._subscriptionMap.has(async)) {
            if (scope && scope.$applyAsync) {
                scope.$applyAsync();
            }
        }
    }

    transform<T>(obj: null, scope: IScope): null;
    transform<T>(obj: undefined, scope: IScope): undefined;
    transform<T>(obj: Observable<T>|null|undefined, scope: IScope): T|null;
    transform<T>(obj: Promise<T>|null|undefined, scope: IScope): T|null;
    transform(obj: AsyncObject<any>|null|undefined, scope: IScope): any {
        if (!this._subscriptionMap.has(obj)) {
            if (obj) {
                this._subscribe(obj, scope);
            }
        }
        // TODO: I need to resubscribe promise or observable when it re-render on screen

        return this._subscriptionMap.get(obj).getValue();
    }
}

angular
    .module('asyncFilterModule', [])
    .filter('async', () => new AsyncFilterClass().transform);