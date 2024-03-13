import 'jasmine';
import _ from 'underscore';

import { BaseCollection, BaseModel, spina } from '../index';


interface MyCollection2Options {
    myURL: string;
}


@spina
class MyModel extends BaseModel {
}


/* The first test collection contains basic static attributes. */
@spina
class MyCollection1 extends BaseCollection<MyModel> {
    static model = MyModel;
    static url = '/api/collections/';
}


/* The second test model uses static methods utilizing instance data. */
@spina
class MyCollection2 extends BaseCollection<MyModel, MyCollection2Options> {
    static model = MyModel;

    static url(
        this: MyCollection2,
    ): string {
        return this.options.myURL;
    }

    options: MyCollection2Options;

    preinitialize(
        models: MyModel[],
        options: MyCollection2Options,
    ) {
        this.options = options;
    }
}


describe('BaseCollection', () => {
    describe('Static-defined attributes', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyCollection1.prototype;

                expect(proto.model).toBe(MyModel);
                expect(proto.url).toBe('/api/collections/');
            });

            it('On instance', () => {
                const collection = new MyCollection1();

                expect(collection.model).toBe(MyModel);
                expect(collection.url).toBe('/api/collections/');
            });
        });
    });

    describe('Static-defined attribute functions', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyCollection2.prototype;

                expect(proto.model).toBeInstanceOf(Function);
                expect(proto.url).toBeInstanceOf(Function);
            });

            it('On instance', () => {
                const collection = new MyCollection2([], {
                    myURL: '/api/v2/collections/',
                });

                expect(collection.model).toBe(MyModel);
                expect(collection.url).toBeInstanceOf(Function);
                expect(_.result(collection, 'url'))
                    .toBe('/api/v2/collections/');
            });
        });
    });

    describe('Methods', () => {
        describe('getURL', () => {
            it('With static value', () => {
                const collection = new MyCollection1();

                expect(collection.getURL()).toBe('/api/collections/');
            });

            it('With dynamic value', () => {
                const collection = new MyCollection2([], {
                    myURL: '/a/b/c/',
                });

                expect(collection.getURL()).toBe('/a/b/c/');
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
            class MyGenericCollection<
                TOptions extends MyOptions = MyOptions,
            > extends BaseCollection<MyModel, MyOptions> {
                options: TOptions;

                initialize(
                    models?: MyModel[],
                    options?: TOptions,
                ) {
                    this.options = options;
                }
            }

            const collection = new MyGenericCollection([], {
                opt1: 'my-value',
            });

            /* Here, we're testing that TypeScript doesn't complain. */
            expect(collection.options.opt1).toBe('my-value');
            expect(collection.options.opt2).toBeUndefined();
        });
    });
});
