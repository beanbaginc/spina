// Type definitions for Backbone 1.4
// Project: http://backbonejs.org/
//          https://github.com/jashkenas/backbone
// Definitions by: Boris Yankov <https://github.com/borisyankov>
//                 Natan Vivo <https://github.com/nvivo>
//                 kenjiru <https://github.com/kenjiru>
//                 jjoekoullas <https://github.com/jjoekoullas>
//                 Julian Gonggrijp <https://github.com/jgonggrijp>
//                 Kyle Scully <https://github.com/zieka>
//                 Robert Kesterson <https://github.com/rkesters>
//                 Bulat Khasanov <https://github.com/khasanovbi>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

/// <reference types="jquery" />

export = Backbone;
export as namespace Backbone;

import * as _ from 'underscore';

declare namespace Backbone {
    type _Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
    type _Result<T> = T | (() => T);
    type _StringKey<T> = keyof T & string;

    interface AddOptions extends Silenceable {
        at?: number | undefined;
        merge?: boolean | undefined;
        sort?: boolean | undefined;
    }

    interface CollectionSetOptions extends Parseable, Silenceable {
        add?: boolean | undefined;
        remove?: boolean | undefined;
        merge?: boolean | undefined;
        at?: number | undefined;
        sort?: boolean | undefined;
    }

    /*-------------------------------------------------------------------
     * Spina customizations
     *-------------------------------------------------------------------*/
    type CollectionComparator =
        | string
        | {
            bivarianceHack(element: TModel): number | string
          }['bivarianceHack']
        | {
            bivarianceHack(compare: TModel, to?: TModel): number
          }['bivarianceHack'];

    interface CollectionOptions<
        TModel extends Model = Model
    > extends CollectionSetOptions {
        comparator?: CollectionComparator;
        model?: new (...args: any[]) => TModel;
    }

    type CombinedCollectionConstructorOptions<
        TExtraCollectionOptions,
        TModel extends (Backbone.Model | undefined) = Backbone.Model,
    > = CollectionOptions<TModel> & TExtraCollectionOptions;

    type CombinedRouterConstructorOptions<
        TExtraRouterOptions,
        TOptions extends RouterOptions = RouterOptions,
    > = TOptions & TExtraRouterOptions;


    /*-------------------------------------------------------------------
     * Upstream code
     *-------------------------------------------------------------------*/
    interface HistoryOptions extends Silenceable {
        pushState?: boolean | undefined;
        root?: string | undefined;
        hashChange?: boolean | undefined;
    }

    interface NavigateOptions {
        trigger?: boolean | undefined;
        replace?: boolean | undefined;
    }

    interface RouterOptions {
        /* Spina customization: Made routes optional. */
        routes?: _Result<RoutesHash>;
    }

    interface Silenceable {
        silent?: boolean | undefined;
    }

    interface Validable {
        validate?: boolean | undefined;
    }

    interface Waitable {
        wait?: boolean | undefined;
    }

    interface Parseable {
        parse?: boolean | undefined;
    }

    interface PersistenceOptions extends Partial<_Omit<JQueryAjaxSettings, 'success' | 'error'>> {
        // TODO: Generalize modelOrCollection
        success?: ((modelOrCollection: any, response: any, options: any) => void) | undefined;
        error?: ((modelOrCollection: any, response: any, options: any) => void) | undefined;
        emulateJSON?: boolean | undefined;
        emulateHTTP?: boolean | undefined;
    }

    interface ModelConstructorOptions<TModel extends Model = Model> extends ModelSetOptions, Parseable {
        collection?: Collection<TModel> | undefined;
    }

    type CombinedModelConstructorOptions<E, M extends Model<any, any, E> = Model> = ModelConstructorOptions<M> & E;

    interface ModelSetOptions extends Silenceable, Validable {}

    interface ModelFetchOptions extends PersistenceOptions, ModelSetOptions, Parseable {}

    interface ModelSaveOptions extends Silenceable, Waitable, Validable, Parseable, PersistenceOptions {
        patch?: boolean | undefined;
    }

    interface ModelDestroyOptions extends Waitable, PersistenceOptions {}

    interface CollectionFetchOptions extends PersistenceOptions, Parseable, CollectionSetOptions {
        reset?: boolean | undefined;
    }

    type ObjectHash = Record<string, any>;

    interface RoutesHash {
        [routePattern: string]: string | { (...urlParts: string[]): void };
    }

    /**
     * DOM events (used in the events property of a View)
     */
    interface EventsHash {
        [selector: string]: string | { (eventObject: JQuery.TriggeredEvent): void };
    }

    /**
     * JavaScript events (used in the methods of the Events interface)
     */
    interface EventHandler {
        (...args: any[]): void;
    }
    interface EventMap {
        [event: string]: EventHandler;
    }

    const Events: Events;
    interface Events extends EventsMixin {}

    /**
     * Helper shorthands for classes that implement the Events interface.
     * Define your class like this:
     *
     * import {
     *     Events,
     *     Events_On,
     *     Events_Off,
     *     Events_Trigger,
     *     Events_Listen,
     *     Events_Stop,
     * } from 'backbone';
     *
     * class YourClass implements Events {
     *     on: Events_On<YourClass>;
     *     off: Events_Off<YourClass>;
     *     trigger: Events_Trigger<YourClass>;
     *     bind: Events_On<YourClass>;
     *     unbind: Events_Off<YourClass>;
     *
     *     once: Events_On<YourClass>;
     *     listenTo: Events_Listen<YourClass>;
     *     listenToOnce: Events_Listen<YourClass>;
     *     stopListening: Events_Stop<YourClass>;
     *
     *     // ... (other methods)
     * }
     *
     * Object.assign(YourClass.prototype, Events);  // can also use _.extend
     *
     * If you are just writing a class type declaration that doesn't already
     * extend some other base class, you can use the EventsMixin instead;
     * see below.
     */
    interface Events_On<BaseT> {
        <T extends BaseT>(this: T, eventName: string, callback: EventHandler, context?: any): T;
        <T extends BaseT>(this: T, eventMap: EventMap, context?: any): T;
    }
    interface Events_Off<BaseT> {
        <T extends BaseT>(this: T, eventName?: string | null, callback?: EventHandler | null, context?: any): T;
    }
    interface Events_Trigger<BaseT> {
        <T extends BaseT>(this: T, eventName: string, ...args: any[]): T;
    }
    interface Events_Listen<BaseT> {
        <T extends BaseT>(this: T, object: any, events: string, callback: EventHandler): T;
        <T extends BaseT>(this: T, object: any, eventMap: EventMap): T;
    }
    interface Events_Stop<BaseT> {
        <T extends BaseT>(this: T, object?: any, events?: string, callback?: EventHandler): T;
    }

    /**
     * Helper to avoid code repetition in type declarations.
     * Backbone.Events cannot be extended, hence a separate abstract
     * class with a different name. Both classes and interfaces can
     * extend from this helper class to reuse the signatures.
     *
     * For class type declarations that already extend another base
     * class, and for actual class definitions, please see the
     * Events_* interfaces above.
     */
    abstract class EventsMixin implements Events {
        on(eventName: string, callback: EventHandler, context?: any): this;
        on(eventMap: EventMap, context?: any): this;
        off(eventName?: string | null, callback?: EventHandler | null, context?: any): this;
        trigger(eventName: string, ...args: any[]): this;
        bind(eventName: string, callback: EventHandler, context?: any): this;
        bind(eventMap: EventMap, context?: any): this;
        unbind(eventName?: string, callback?: EventHandler, context?: any): this;

        once(events: string, callback: EventHandler, context?: any): this;
        once(eventMap: EventMap, context?: any): this;
        listenTo(object: any, events: string, callback: EventHandler): this;
        listenTo(object: any, eventMap: EventMap): this;
        listenToOnce(object: any, events: string, callback: EventHandler): this;
        listenToOnce(object: any, eventMap: EventMap): this;
        stopListening(object?: any, events?: string, callback?: EventHandler): this;
    }

    class ModelBase extends EventsMixin {
        parse(response: any, options?: any): any;
        toJSON(options?: any): any;
        sync(...arg: any[]): JQueryXHR;
    }

    /**
     * E - Extensions to the model constructor options. You can accept additional constructor options
     * by listing them in the E parameter.
     */
    class Model<T extends ObjectHash = any, S = ModelSetOptions, E = any> extends ModelBase implements Events {
        /*-------------------------------------------------------------------
         * Spina customizations
         *-------------------------------------------------------------------*/
        defaults: _Result<Partial<T>>;
        url: _Result<string>;


        /*-------------------------------------------------------------------
         * Upstream code
         *-------------------------------------------------------------------*/
        /**
         * Do not use, prefer TypeScript's extend functionality.
         */
        static extend(properties: any, classProperties?: any): any;

        attributes: Partial<T>;
        changed: Partial<T>;
        cidPrefix: string;
        cid: string;
        collection: Collection<this>;

        private _changing: boolean;
        private _previousAttributes: Partial<T>;
        private _pending: boolean;

        id: string | number;
        idAttribute: string;
        validationError: any;

        urlRoot: _Result<string>;

        /**
         * For use with models as ES classes. If you define a preinitialize
         * method, it will be invoked when the Model is first created, before
         * any instantiation logic is run for the Model.
         * @see https://backbonejs.org/#Model-preinitialize
         */
        preinitialize(attributes?: T, options?: CombinedModelConstructorOptions<E, this>): void;

        constructor(attributes?: T, options?: CombinedModelConstructorOptions<E>);
        initialize(attributes?: T, options?: CombinedModelConstructorOptions<E, this>): void;

        fetch(options?: ModelFetchOptions): JQueryXHR;

        /**
         * For strongly-typed access to attributes, use the `get` method only privately in public getter properties.
         * @example
         * get name(): string {
         *    return super.get("name");
         * }
         */
        get<A extends _StringKey<T>>(attributeName: A): T[A] | undefined;

        /**
         * For strongly-typed assignment of attributes, use the `set` method only privately in public setter properties.
         * @example
         * set name(value: string) {
         *    super.set("name", value);
         * }
         */
        set<A extends _StringKey<T>>(attributeName: A, value?: T[A], options?: S): this;
        set(attributeName: Partial<T>, options?: S): this;
        set<A extends _StringKey<T>>(attributeName: A | Partial<T>, value?: T[A] | S, options?: S): this;

        /**
         * Return an object containing all the attributes that have changed, or
         * false if there are no changed attributes. Useful for determining what
         * parts of a view need to be updated and/or what attributes need to be
         * persisted to the server. Unset attributes will be set to undefined.
         * You can also pass an attributes object to diff against the model,
         * determining if there *would be* a change.
         */
        changedAttributes(attributes?: Partial<T>): Partial<T> | false;
        clear(options?: Silenceable): this;
        clone(): Model;
        destroy(options?: ModelDestroyOptions): JQueryXHR | false;
        escape(attribute: _StringKey<T>): string;
        has(attribute: _StringKey<T>): boolean;
        hasChanged(attribute?: _StringKey<T>): boolean;
        isNew(): boolean;
        isValid(options?: any): boolean;
        previous<A extends _StringKey<T>>(attribute: A): T[A] | null | undefined;
        previousAttributes(): Partial<T>;
        save(attributes?: Partial<T> | null, options?: ModelSaveOptions): JQueryXHR;
        unset(attribute: _StringKey<T>, options?: Silenceable): this;
        validate(attributes: Partial<T>, options?: any): any;
        private _validate(attributes: Partial<T>, options: any): boolean;

        // mixins from underscore

        keys(): string[];
        values(): any[];
        pairs(): any[];
        invert(): any;
        pick<A extends _StringKey<T>>(keys: A[]): Partial<Pick<T, A>>;
        pick<A extends _StringKey<T>>(...keys: A[]): Partial<Pick<T, A>>;
        pick(fn: (value: any, key: any, object: any) => any): Partial<T>;
        omit<A extends _StringKey<T>>(keys: A[]): Partial<_Omit<T, A>>;
        omit<A extends _StringKey<T>>(...keys: A[]): Partial<_Omit<T, A>>;
        omit(fn: (value: any, key: any, object: any) => any): Partial<T>;
        chain(): any;
        isEmpty(): boolean;
        matches(attrs: any): boolean;
    }

    /*-------------------------------------------------------------------
     * Spina customization: TExtraCollectionOptions and TCollectionOptions.
     *-------------------------------------------------------------------*/
    class Collection<
        TModel extends Model = Model,
        TExtraCollectionOptions = unknown,
        TCollectionOptions = CollectionOptions<TModel>
    > extends ModelBase implements Events {
        /*-------------------------------------------------------------------
         * Spina customization
         *-------------------------------------------------------------------*/
        preinitialize(
            models?: TModel[] | Array<Record<string, any>>,
            options?: CombinedCollectionConstructorOptions<
                TExtraCollectionOptions,
                TModel
            >,
        ): void;

        constructor(
            models?: TModel[] | Array<Record<string, any>>,
            options?: CombinedCollectionConstructorOptions<
                TExtraCollectionOptions,
                TModel
            >,
        );

        initialize(
            models?: TModel[] | Array<Record<string, any>>,
            options?: CombinedCollectionConstructorOptions<
                TExtraCollectionOptions,
                TModel
            >,
        ): void;

        /**
         * Specify a model attribute name (string) or function that will be
         * used to sort the collection.
         */
        comparator: CollectionComparator;

        /*-------------------------------------------------------------------
         * Upstream code
         *-------------------------------------------------------------------*/
        /**
         * Do not use, prefer TypeScript's extend functionality.
         */
        static extend(properties: any, classProperties?: any): any;

        model: new (...args: any[]) => TModel;
        models: TModel[];
        length: number;

        /**
         * For use with collections as ES classes. If you define a preinitialize
         * method, it will be invoked when the Collection is first created and
         * before any instantiation logic is run for the Collection.
         * @see https://backbonejs.org/#Collection-preinitialize
         */

        fetch(options?: CollectionFetchOptions): JQueryXHR;

        add(model: {} | TModel, options?: AddOptions): TModel;
        add(models: Array<{} | TModel>, options?: AddOptions): TModel[];
        at(index: number): TModel;
        /**
         * Get a model from a collection, specified by an id, a cid, or by passing in a model.
         */
        get(id: number | string | Model): TModel;
        has(key: number | string | Model): boolean;
        clone(): this;
        create(attributes: any, options?: ModelSaveOptions): TModel;
        pluck(attribute: string): any[];
        push(model: TModel, options?: AddOptions): TModel;
        pop(options?: Silenceable): TModel;
        remove(model: {} | TModel, options?: Silenceable): TModel;
        remove(models: Array<{} | TModel>, options?: Silenceable): TModel[];
        reset(models?: Array<{} | TModel>, options?: Silenceable): TModel[];

        /**
         *
         * The set method performs a "smart" update of the collection with the passed list of models.
         * If a model in the list isn't yet in the collection it will be added; if the model is already in the
         * collection its attributes will be merged; and if the collection contains any models that aren't present
         * in the list, they'll be removed. All of the appropriate "add", "remove", and "change" events are fired as
         * this happens. Returns the touched models in the collection. If you'd like to customize the behavior, you can
         * disable it with options: {add: false}, {remove: false}, or {merge: false}.
         * @param models
         * @param options
         */
        set(models?: Array<{} | TModel>, options?: CollectionSetOptions): TModel[];
        shift(options?: Silenceable): TModel;
        sort(options?: Silenceable): this;
        unshift(model: TModel, options?: AddOptions): TModel;
        where(properties: any): TModel[];
        findWhere(properties: any): TModel;
        modelId(attrs: any): any;

        values(): Iterator<TModel>;
        keys(): Iterator<any>;
        entries(): Iterator<[any, TModel]>;
        [Symbol.iterator](): Iterator<TModel>;

        private _prepareModel(attributes?: any, options?: any): any;
        private _removeReference(model: TModel): void;
        private _onModelEvent(event: string, model: TModel, collection: Collection<TModel>, options: any): void;
        private _isModel(obj: any): obj is Model;

        /**
         * Return a shallow copy of this collection's models, using the same options as native Array#slice.
         */
        slice(min?: number, max?: number): TModel[];

        // mixins from underscore

        all(iterator?: _.ListIterator<TModel, boolean>, context?: any): boolean;
        any(iterator?: _.ListIterator<TModel, boolean>, context?: any): boolean;
        chain(): any;
        collect<TResult>(iterator: _.ListIterator<TModel, TResult>, context?: any): TResult[];
        contains(value: TModel): boolean;
        countBy(iterator?: _.ListIterator<TModel, any>): _.Dictionary<number>;
        countBy(iterator: string): _.Dictionary<number>;
        detect(iterator: _.ListIterator<TModel, boolean>, context?: any): TModel;
        difference(others: TModel[]): TModel[];
        drop(n?: number): TModel[];
        each(iterator: _.ListIterator<TModel, void>, context?: any): TModel[];
        every(iterator: _.ListIterator<TModel, boolean>, context?: any): boolean;
        filter(iterator: _.ListIterator<TModel, boolean>, context?: any): TModel[];
        find(iterator: _.ListIterator<TModel, boolean>, context?: any): TModel;
        findIndex(predicate: _.ListIterator<TModel, boolean>, context?: any): number;
        findLastIndex(predicate: _.ListIterator<TModel, boolean>, context?: any): number;
        first(): TModel;
        first(n: number): TModel[];
        foldl<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: any): TResult;
        foldr<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: any): TResult;
        forEach(iterator: _.ListIterator<TModel, void>, context?: any): TModel[];
        groupBy(iterator: _.ListIterator<TModel, any> | string, context?: any): _.Dictionary<TModel[]>;
        head(): TModel;
        head(n: number): TModel[];
        include(value: TModel): boolean;
        includes(value: TModel): boolean;
        indexBy(iterator: _.ListIterator<TModel, any>, context?: any): _.Dictionary<TModel>;
        indexBy(iterator: string, context?: any): _.Dictionary<TModel>;
        indexOf(value: TModel, isSorted?: boolean): number;
        initial(): TModel;
        initial(n: number): TModel[];
        inject<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: any): TResult;
        invoke(methodName: string, ...args: any[]): any;
        isEmpty(): boolean;
        last(): TModel;
        last(n: number): TModel[];
        lastIndexOf(value: TModel, from?: number): number;
        map<TResult>(iterator: _.ListIterator<TModel, TResult>, context?: any): TResult[];
        max(iterator?: _.ListIterator<TModel, any>, context?: any): TModel;
        min(iterator?: _.ListIterator<TModel, any>, context?: any): TModel;
        partition(iterator: _.ListIterator<TModel, boolean>): TModel[][];
        reduce<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: any): TResult;
        reduceRight<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: any): TResult;
        reject(iterator: _.ListIterator<TModel, boolean>, context?: any): TModel[];
        rest(n?: number): TModel[];
        sample(): TModel;
        sample(n: number): TModel[];
        select(iterator: _.ListIterator<TModel, boolean>, context?: any): TModel[];
        shuffle(): TModel[];
        size(): number;
        some(iterator?: _.ListIterator<TModel, boolean>, context?: any): boolean;
        sortBy(iterator?: _.ListIterator<TModel, any>, context?: any): TModel[];
        sortBy(iterator: string, context?: any): TModel[];
        tail(n?: number): TModel[];
        take(): TModel;
        take(n: number): TModel[];
        toArray(): TModel[];

        /**
         * Sets the url property (or function) on a collection to reference its location on the server.
         */
        url: _Result<string>;

        without(...values: TModel[]): TModel[];
    }

    type RouterCallback = (...args: string[]) => void;

    /*-------------------------------------------------------------------
     * Spina customization: TOptions generic
     *-------------------------------------------------------------------*/
    class Router<
        TExtraRouterOptions = unknown,
        TOptions extends RouterOptions = RouterOptions
    > extends EventsMixin implements Events {
        /*-------------------------------------------------------------------
         * Spina customizations
         *-------------------------------------------------------------------*/
        /**
         * For use with Router as ES classes. If you define a preinitialize method,
         * it will be invoked when the Router is first created, before any
         * instantiation logic is run for the Router.
         * @see https://backbonejs.org/#Router-preinitialize
         */
        preinitialize(
            options?: CombinedRouterConstructorOptions<TExtraRouterOptions,
                                                       TOptions>,
        ): void;

        constructor(
            options?: CombinedRouterConstructorOptions<TExtraRouterOptions,
                                                       TOptions>,
        );

        initialize(
            options?: CombinedRouterConstructorOptions<TExtraRouterOptions,
                                                       TOptions>,
        ): void;


        /*-------------------------------------------------------------------
         * Upstream code
         *-------------------------------------------------------------------*/
        /**
         * Do not use, prefer TypeScript's extend functionality.
         */
        static extend(properties: any, classProperties?: any): any;

        /**
         * Routes hash or a method returning the routes hash that maps URLs with parameters to methods on your Router.
         * For assigning routes as object hash, do it like this: this.routes = <any>{ "route": callback, ... };
         * That works only if you set it in the constructor or the initialize method.
         */
        routes: _Result<RoutesHash>;

        route(route: string | RegExp, name: string, callback?: RouterCallback): this;
        route(route: string | RegExp, callback: RouterCallback): this;
        navigate(fragment: string, options?: NavigateOptions | boolean): this;

        execute(callback: RouterCallback, args: string[], name: string): void;

        protected _bindRoutes(): void;
        protected _routeToRegExp(route: string): RegExp;
        protected _extractParameters(route: RegExp, fragment: string): string[];
    }

    const history: History;

    class History extends EventsMixin implements Events {
        handlers: any[];
        interval: number;

        start(options?: HistoryOptions): boolean;

        getHash(window?: Window): string;
        getFragment(fragment?: string): string;
        decodeFragment(fragment: string): string;
        getSearch(): string;
        stop(): void;
        route(route: string | RegExp, callback: (fragment: string) => void): number;
        checkUrl(e?: any): void;
        getPath(): string;
        matchRoot(): boolean;
        atRoot(): boolean;
        loadUrl(fragmentOverride?: string): boolean;
        navigate(fragment: string, options?: any): boolean;
        static started: boolean;
        options: any;

        private _updateHash(location: Location, fragment: string, replace: boolean): void;
    }

    interface ViewOptions<TModel extends (Model | undefined) = Model, TElement extends Element = HTMLElement> {
        model?: TModel | undefined;
        // TODO: quickfix, this can't be fixed easy. The collection does not need to have the same model as the parent view.
        collection?: Collection<any> | undefined; // was: Collection<TModel>;
        el?: TElement | JQuery | string | undefined;
        id?: string | undefined;
        attributes?: Record<string, any> | undefined;
        className?: string | undefined;
        tagName?: string | undefined;
        events?: _Result<EventsHash> | undefined;
    }

    /*-------------------------------------------------------------------
     * Spina customization
     *-------------------------------------------------------------------*/
    type CombinedViewConstructorOptions<
        TExtraViewOptions,
        TModel extends (Backbone.Model | undefined) = Backbone.Model,
        TElement extends Element = HTMLElement,
    > = Backbone.ViewOptions<TModel, TElement> & TExtraViewOptions;


    type ViewEventListener = (event: JQuery.Event) => void;

    class View<
        TModel extends (Model | undefined) = Model,
        TElement extends Element = HTMLElement,
        TExtraViewOptions = unknown,
        TViewOptions = ViewOptions,
    > extends EventsMixin implements Events {
        /*-------------------------------------------------------------------
         * Spina customizations
         *-------------------------------------------------------------------*/
        events: _Result<EventsHash>;
        className?: _Result<string | undefined>;
        tagName: _Result<string>;
        id?: _Result<string | undefined>;

        preinitialize(
            options?: CombinedViewConstructorOptions<
                TExtraViewOptions, TModel, TElement
            >
        ): void;

        constructor(
            options?: CombinedViewConstructorOptions<
                TExtraViewOptions, TModel, TElement
            >
        );

        initialize(
            options?: CombinedViewConstructorOptions<
                TExtraViewOptions, TModel, TElement
            >
        ): void;

        /*-------------------------------------------------------------------
         * Upstream code
         *-------------------------------------------------------------------*/
        /**
         * Do not use, prefer TypeScript's extend functionality.
         */
        static extend(properties: any, classProperties?: any): any;

        // A conditional type used here to prevent `TS2532: Object is possibly 'undefined'`
        model: TModel extends Model ? TModel : undefined;
        collection: Collection<any>;
        setElement(element: TElement | JQuery): this;
        cid: string;

        el: TElement;
        $el: JQuery;
        attributes: Record<string, any>;
        $(selector: string): JQuery;
        render(): this;
        remove(): this;
        delegateEvents(events?: _Result<EventsHash>): this;
        delegate(eventName: string, selector: string, listener: ViewEventListener): this;
        undelegateEvents(): this;
        undelegate(eventName: string, selector?: string, listener?: ViewEventListener): this;

        protected _removeElement(): void;
        protected _setElement(el: TElement | JQuery): void;
        protected _createElement(tagName: string): void;
        protected _ensureElement(): void;
        protected _setAttributes(attributes: Record<string, any>): void;
    }

    // SYNC
    function sync(method: string, model: Model | Collection, options?: JQueryAjaxSettings): any;
    function ajax(options?: JQueryAjaxSettings): JQueryXHR;
    let emulateHTTP: boolean;
    let emulateJSON: boolean;

    // Utility
    function noConflict(): typeof Backbone;
    let $: JQueryStatic;
}
