import 'jasmine';

import { BaseRouter, RoutesHash, spina } from '../index';


interface MyRouter3Options {
    routerHandlerName: string;
}


@spina
class MyRouter extends BaseRouter {
    static routes: RoutesHash = {
        'test': '_onTest',
        'test/:query': '_onTestQuery',
    };
}


@spina
class MyRouter2 extends MyRouter {
    static routes: RoutesHash = {
        'foo': '_onFoo',
        'foo/:query': '_onFooQuery',
    };
}


@spina
class MyRouter3 extends BaseRouter<MyRouter3Options> {
    static routes(this: MyRouter3): RoutesHash {
        return {
            'some-route': this.routeName,
        };
    }

    routeName: string;

    preinitialize(options: MyRouter3Options) {
        this.routeName = options.routerHandlerName;
    }
}


describe('BaseRouter', () => {
    describe('Static-defined attributes', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyRouter.prototype;

                expect(proto.routes).toEqual({
                    'test': '_onTest',
                    'test/:query': '_onTestQuery',
                });
            });

            it('On instance', () => {
                const router = new MyRouter();

                expect(router.routes).toEqual({
                    'test': '_onTest',
                    'test/:query': '_onTestQuery',
                });
            });
        });

        describe('Merging', () => {
            it('On class', () => {
                expect(MyRouter2.routes).toEqual({
                    'foo': '_onFoo',
                    'foo/:query': '_onFooQuery',
                    'test': '_onTest',
                    'test/:query': '_onTestQuery',
                });
            });

            it('On prototype', () => {
                const proto = MyRouter2.prototype;

                expect(proto.routes).toEqual({
                    'foo': '_onFoo',
                    'foo/:query': '_onFooQuery',
                    'test': '_onTest',
                    'test/:query': '_onTestQuery',
                });
            });

            it('On instance', () => {
                const router = new MyRouter2();

                expect(router.routes).toEqual({
                    'foo': '_onFoo',
                    'foo/:query': '_onFooQuery',
                    'test': '_onTest',
                    'test/:query': '_onTestQuery',
                });
            });
        });
    });

    describe('Static-defined attribute functions', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyRouter3.prototype;

                expect(proto.routes).toBeInstanceOf(Function);
            });

            it('On instance', () => {
                const router = new MyRouter3({
                    routerHandlerName: 'myHandler',
                });

                expect(router.routes).toEqual({
                    'some-route': 'myHandler',
                });
            });
        });
    });

    describe('Typing', () => {
        it('Options generics are not narrowed', () => {
            interface MyOptions {
                opt1: string;
                opt2?: string;
            }

            @spina
            class MyGenericRouter<
                TOptions extends MyOptions = MyOptions,
            > extends BaseRouter<MyOptions> {
                options: TOptions;

                initialize(options?: TOptions) {
                    this.options = options;
                }
            }

            const router = new MyGenericRouter({
                opt1: 'my-value',
            });

            /* Here, we're testing that TypeScript doesn't complain. */
            expect(router.options.opt1).toBe('my-value');
            expect(router.options.opt2).toBeUndefined();
        });
    });
});
