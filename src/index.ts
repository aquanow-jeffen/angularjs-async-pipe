import * as angular from 'angular';
import { IScope } from 'angular';
import { Observable, SubscriptionLike } from 'rxjs';

type Subscription = SubscriptionLike | Promise<any>;
type AsyncObject<T> = Observable<T> | Promise<T>;
interface SubscriptionStrategy {
    latestValue: any;
    createSubscription(async: AsyncObject<any>, updateLatestValue: any): Subscription;
    dispose(): void;
    onDestroy(): void;
}

function isObservable(obj: any): obj is Observable<any> {
    return obj && typeof obj.subscribe === 'function';
}

function isPromise(obj: any): obj is Promise<any> {
    return obj && typeof obj.then === 'function';
}

class ObservableStrategy implements SubscriptionStrategy {
    private _subscription: SubscriptionLike;
    latestValue: any = null;

    createSubscription(async: Observable<any>, updateLatestValue: any): SubscriptionLike {
        const nextFn = (res: any) => {
            this.latestValue = res;
            return updateLatestValue(res);
        };
        this._subscription = async.subscribe({next: nextFn, error: (e: any) => { throw e; }});
        return this._subscription;
    }

    dispose(): void {
        this._subscription.unsubscribe();
        this.latestValue = null;
    }
    onDestroy(): void { this._subscription.unsubscribe(); }
}

class PromiseStrategy implements SubscriptionStrategy {
    private _subscription: Promise<any>;
    latestValue: any = null;

    createSubscription(async: Promise<any>, updateLatestValue: (v: any) => any): Promise<any> {
        const thenFn = (res: any) => {
            this.latestValue = res;
            return updateLatestValue(res);
        };
        this._subscription = async.then(thenFn, e => { throw e; });
        return this._subscription;
    }

    dispose(): void {
        this.latestValue = null;
    }
    onDestroy(): void {}
}

class AsyncFilterClass {
    private _subscriptionMap: WeakMap<AsyncObject<any>, SubscriptionStrategy>;

    constructor() {
        this.transform = this.transform.bind(this);
        this._subscriptionMap = new WeakMap();
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
        scope.$on('$destroy', () => {
            strategy.dispose();
            this._subscriptionMap.delete(obj);
        });
    }

    private _updateLatestValue(async: any, value: Object, scope: IScope): void {
        if (this._subscriptionMap.has(async)) {
            scope.$applyAsync();
        }
    }

    transform<T>(obj: null, scope: IScope): null;
    transform<T>(obj: undefined, scope: IScope): undefined;
    transform<T>(obj: Observable<T>|null|undefined, scope: IScope): T|null;
    transform<T>(obj: Promise<T>|null|undefined, scope: IScope): T|null;
    transform(obj: AsyncObject<any>|null|undefined, scope: IScope): any {
        if (!scope) {
            throw new SyntaxError('AsyncFilter: Scope object is expected. Please make sure you have correct syntax `{{ your_binding_value | async:this }}`');
        }
        if (!this._subscriptionMap.has(obj)) {
            if (obj) {
                this._subscribe(obj, scope);
            }
        }

        return this._subscriptionMap.get(obj).latestValue;
    }
}

const module = angular
    .module('asyncFilterModule', [])
    .filter('async', () => new AsyncFilterClass().transform);
    
export default module.name;