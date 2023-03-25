import 'jasmine';
import Backbone from 'backbone';

import { Class, spina, spinaBaseClassExtends } from '../index';


class RealBaseClass {
    static myAttrNum: number = 123;

    static myAttrHash: object = {
        'key1': 'value1',
        'key2': 'value2',
    };

    static myStaticFunc() {
        return 42;
    }

    constructor(...args: any[]) {
        throw Error('Should not be executed.');
    }

    myFunc(): string {
        return 'test';
    }
};


describe('spinaBaseClassExtends', () => {
    describe('Decorating class', () => {
        it('Basic usage', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
            ) {
            }

            expect(MyBase.__spinaObjectID).toBeDefined();
            expect(MyBase.__spinaOptions).toEqual({});
            expect(MyBase.name).toBe('MyBase');
            expect(MyBase.myAttrNum).toBe(123);
            expect(MyBase.myAttrHash).toEqual({
                'key1': 'value1',
                'key2': 'value2',
            });

            const proto = MyBase.prototype;
            expect(proto['__spinaObjectID']).toBeUndefined();
            expect(proto['myAttrNum']).toBeUndefined();
            expect(proto['myAttrHash']).toBeUndefined();

            const wrapperProto = Object.getPrototypeOf(MyBase);
            expect(wrapperProto.name).toBe('RealBaseClass');
            expect(Object.getPrototypeOf(wrapperProto)).toBe(RealBaseClass);
        });

        it('With anonymous base class', () => {
            abstract class MyBase extends spinaBaseClassExtends(class {}) {
            }

            expect(MyBase.__spinaObjectID).toBeDefined();
            expect(MyBase.__spinaOptions).toEqual({});
            expect(MyBase.name).toBe('MyBase');

            const proto = MyBase.prototype;
            expect(proto['__spinaObjectID']).toBeUndefined();

            const wrapperProto = Object.getPrototypeOf(MyBase);
            expect(wrapperProto.name).toBe(
                `_SpinaBaseClass${MyBase.__spinaObjectID}`);
        });

        it('With initObject on base', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
            ) {
                initArgs: any[];

                initObject(...args: any[]) {
                    this.initArgs = args;
                }
            }

            @spina
            class MyClass extends MyBase {}

            const instance = new MyClass(1, 2, 3);
            expect(instance.initArgs).toEqual([1, 2, 3]);
        });

        it('With options.automergeAttrs', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
                {
                    automergeAttrs: ['myAttrHash'],
                },
            ) {
                static myAttrHash: object = {
                    'a': 1,
                    'b': 2,
                };
            }

            expect(MyBase.__spinaOptions).toEqual({
                automergeAttrs: ['myAttrHash'],
            });

            @spina
            class MyClass1 extends MyBase {
                static myAttrHash: object = {
                    'c': 3,
                    'd': 4,
                };
            }

            expect(MyClass1.__spinaOptions).toEqual({
                automergeAttrs: ['myAttrHash'],
            });

            @spina
            class MyClass2 extends MyClass1 {
                static myAttrHash: object = {
                    'e': 5,
                    'f': 6,
                };
            }

            expect(MyClass1.myAttrHash).toEqual({
                'a': 1,
                'b': 2,
                'c': 3,
                'd': 4,
            });

            expect(MyClass2.myAttrHash).toEqual({
                'a': 1,
                'b': 2,
                'c': 3,
                'd': 4,
                'e': 5,
                'f': 6,
            });
        });

        it('With options.initObject', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
                {
                    initObject(...args: any[]) {
                        this.initArgs = args;
                    }
                }
            ) {
                initArgs: any[];
            }

            @spina
            class MyClass extends MyBase {}

            const instance = new MyClass(1, 2, 3);
            expect(instance.initArgs).toEqual([1, 2, 3]);
        });

        it('With options.mixins=', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
                {
                    mixins: [
                        /* A simple object mixin. */
                        {
                            mixedInAttr1: true,
                            mixedInFunc1() {
                                return 123;
                            }
                        },

                        /* A prototype mixin. */
                        Backbone.Model.extend({
                            mixedInAttr2: 123,
                            mixedInFunc2: function() {
                                return 'test';
                            },
                        }),

                        /* A class mixin. */
                        class {
                            static mixedInAttr3 = 'attr3';
                            mixedInFunc3() {
                                return true;
                            }
                        },
                    ]
                }
            ) {
            }

            const proto = MyBase.prototype;
            expect(proto['mixedInAttr1']).toBeTrue();
            expect(proto['mixedInAttr2']).toBe(123);
            expect(proto['mixedInFunc1']).toBeInstanceOf(Function);
            expect(proto['mixedInFunc2']).toBeInstanceOf(Function);
            expect(proto['mixedInFunc3']).toBeInstanceOf(Function);
            expect(MyBase['mixedInAttr3']).toBe('attr3');
        });

        it('With options.name=', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
                {
                    name: 'CustomBase',
                }
            ) {
            }

            expect(MyBase.__spinaObjectID).toBeDefined();
            expect(MyBase.__spinaOptions).toEqual({
                name: 'CustomBase',
            });
            expect(MyBase.name).toBe('MyBase');
            expect(MyBase.myAttrNum).toBe(123);
            expect(MyBase.myAttrHash).toEqual({
                'key1': 'value1',
                'key2': 'value2',
            });

            const wrapperProto = Object.getPrototypeOf(MyBase);
            expect(wrapperProto.name).toBe('CustomBase');
            expect(Object.getPrototypeOf(wrapperProto)).toBe(RealBaseClass);
        });

        it('With options.prototypeAttrs=', () => {
            abstract class MyBase extends spinaBaseClassExtends(
                RealBaseClass,
                {
                    prototypeAttrs: [
                        'myAttrNum',
                        'myAttrHash',
                        'myStaticFunc',
                    ],
                }
            ) {
            }

            const wrapperProto = Object.getPrototypeOf(MyBase);

            expect(wrapperProto.__spinaOptions).toEqual({
                prototypeAttrs: [
                    'myAttrNum',
                    'myAttrHash',
                    'myStaticFunc',
                ],
            });

            expect(wrapperProto.myAttrNum).toBe(123);
            expect(wrapperProto.myAttrHash).toEqual({
                'key1': 'value1',
                'key2': 'value2',
            });
            expect(wrapperProto.myStaticFunc).toBeInstanceOf(Function);
        });
    });

    it('extend', () => {
        abstract class MyBase extends spinaBaseClassExtends(RealBaseClass) {
        }

        const MyProto = MyBase.extend({
            myNewAttr1: 123,
            myNewAttr2: true,

            myNewFunc: function() {
            }
        }, {
            myStatic1: 'test',
            myStatic2: [1, 2, 3],
        });

        expect(MyProto.myStatic1).toBe('test');
        expect(MyProto.myStatic2).toEqual([1, 2, 3]);
        expect(MyProto.myAttrNum).toBe(123);
        expect(MyProto.myAttrHash).toEqual({
            'key1': 'value1',
            'key2': 'value2',
        });
        expect(MyProto.myStaticFunc).toBeInstanceOf(Function);

        const proto = MyProto.prototype;
        expect(proto.myNewAttr1).toBe(123);
        expect(proto.myNewAttr2).toBeTrue();
        expect(proto.myNewFunc).toBeInstanceOf(Function);
        expect(proto.myFunc).toBeInstanceOf(Function);

        const wrappedProto = Object.getPrototypeOf(MyProto);
        expect(Object.getPrototypeOf(wrappedProto)).toBe(MyBase);
    });
});
