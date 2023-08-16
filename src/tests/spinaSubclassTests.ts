import 'jasmine';
import Backbone from 'backbone';

import { Class, spina, spinaBaseClassExtends } from '../index';


class RealBaseClass {
    static myAttrNum: number = 123;

    static myAttrHash: object = {
        'key1': 'value1',
        'key2': 'value2',
    };

    static myAttrHash2: object = {
        'otherKey1': 1,
        'otherKey2': 2,
    };

    static myStaticFunc() {
        return 42;
    }

    constructor(...args: any[]) {
        throw Error('Should not be executed.');
    }

    initObject(...args: any[]) {
        this.initialize(...args);
    }

    initialize(...args: any[]) {}

    myFunc(): string {
        return 'test';
    }
}


class BaseClass extends spinaBaseClassExtends(RealBaseClass) {
}


describe('spinaSubclass', () => {
    describe('Decorating class', () => {
        it('Basic usage', () => {
            @spina
            class MyClass extends BaseClass {
                static myClassAttr = [1, 2, 3];
            }

            expect(MyClass.__spinaObjectID).toBeDefined();
            expect(MyClass.__spinaOptions).toEqual({});
            expect(MyClass.hasOwnProperty('name')).toBeTrue();
            expect(MyClass.name).toBe('_MyClass_');
            expect(MyClass.myAttrNum).toBe(123);
            expect(MyClass.myAttrHash).toEqual({
                'key1': 'value1',
                'key2': 'value2',
            });
            expect(MyClass.myClassAttr).toEqual([1, 2, 3]);

            const proto = MyClass.prototype;
            expect(proto['__spinaObjectID']).toBeUndefined();
            expect(proto['myAttrNum']).toBeUndefined();
            expect(proto['myAttrHash']).toBeUndefined();

            const wrappedProto = Object.getPrototypeOf(MyClass);
            expect(wrappedProto.hasOwnProperty('name')).toBeTrue();
            expect(wrappedProto.name).toBe('MyClass');
            expect(Object.getPrototypeOf(wrappedProto)).toBe(BaseClass);
        });

        it('With anonymous class', () => {
            const MyClass = spina(class extends BaseClass {
                static myClassAttr = [1, 2, 3];
            });

            expect(MyClass.__spinaObjectID).toBeDefined();
            expect(MyClass.__spinaOptions).toEqual({});
            expect(MyClass.hasOwnProperty('name')).toBeTrue();
            expect(MyClass.name).toBe(
                `_SpinaSubclass${MyClass.__spinaObjectID}_`);
            expect(MyClass.myAttrNum).toBe(123);
            expect(MyClass.myAttrHash).toEqual({
                'key1': 'value1',
                'key2': 'value2',
            });
            expect(MyClass.myClassAttr).toEqual([1, 2, 3]);

            const proto = MyClass.prototype;
            expect(proto['__spinaObjectID']).toBeUndefined();
            expect(proto['myAttrNum']).toBeUndefined();
            expect(proto['myAttrHash']).toBeUndefined();

            const wrappedProto = Object.getPrototypeOf(MyClass);
            expect(wrappedProto.hasOwnProperty('name')).toBeFalse();
            expect(Object.getPrototypeOf(wrappedProto)).toBe(BaseClass);
        });

        describe('With options.automergeAttrs=', () => {
            it('On base class', () => {
                @spina({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                    ],
                })
                class MyClass extends BaseClass {
                    static myAttrHash: object = {
                        'a': 1,
                        'b': 2,
                    };
                }

                @spina
                class MySubclass extends MyClass {
                    static myAttrHash: object = {
                        'c': 3,
                        'd': 4,
                    };

                    static myAttrHash2: object = {
                        'subclass1': true,
                        'subclass2': false,
                    };
                }

                expect(MyClass.__spinaOptions).toEqual({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                    ],
                });
                expect(MyClass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                });
                expect(MyClass.myAttrHash2).toEqual({
                    'otherKey1': 1,
                    'otherKey2': 2,
                });

                /* This should be the same instance. */
                expect(MySubclass.__spinaOptions).toBe(MyClass.__spinaOptions);

                expect(MySubclass.__spinaOptions).toEqual({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                    ],
                });
                expect(MySubclass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                    'c': 3,
                    'd': 4,
                });
                expect(MySubclass.myAttrHash2).toEqual({
                    'otherKey1': 1,
                    'otherKey2': 2,
                    'subclass1': true,
                    'subclass2': false,
                });
            });

            it('Mixed between classes', () => {
                @spina({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                    ],
                })
                class MyClass extends BaseClass {
                    static myAttrHash: object = {
                        'a': 1,
                        'b': 2,
                    };
                }

                /* Test a subclass. */
                @spina({
                    automergeAttrs: [
                        'myNewAttr',
                        'myNewAttr2',
                    ]
                })
                class MySubclass extends MyClass {
                    static myAttrHash: object = {
                        'c': 3,
                        'd': 4,
                    };

                    static myAttrHash2: object = {
                        'subclass1': true,
                        'subclass2': false,
                    };

                    static myNewAttr: object = {
                        'attr1': 1,
                        'attr2': 2,
                    };

                    static myNewAttr2: object = {
                        'foo': 'FOO',
                    };
                }

                /* Test a sub-subclass. */
                @spina({
                    automergeAttrs: [
                        'myNewAttr2',
                        'myNewAttr3',
                    ]
                })
                class MySubSubclass extends MySubclass {
                    static myAttrHash: object = {
                        'e': 5,
                        'f': 6,
                    };

                    static myNewAttr2: object = {
                        'bar': 'BAR',
                    };

                    static myNewAttr3: object = {
                        'new': 'attr',
                    };
                }

                /* Check MyClass. */
                expect(MyClass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                });
                expect(MyClass.myAttrHash2).toEqual({
                    'otherKey1': 1,
                    'otherKey2': 2,
                });

                expect(MyClass.__spinaOptions).toEqual({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                    ],
                });

                /* Check MySubclass. */
                expect(MySubclass.__spinaOptions).toEqual({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                        'myNewAttr',
                        'myNewAttr2',
                    ],
                });
                expect(MySubclass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                    'c': 3,
                    'd': 4,
                });
                expect(MySubclass.myAttrHash2).toEqual({
                    'otherKey1': 1,
                    'otherKey2': 2,
                    'subclass1': true,
                    'subclass2': false,
                });
                expect(MySubclass.myNewAttr).toEqual({
                    'attr1': 1,
                    'attr2': 2,
                });
                expect(MySubclass.myNewAttr2).toEqual({
                    'foo': 'FOO',
                });

                /* Check MySubSubclass. */
                expect(MySubSubclass.__spinaOptions).toEqual({
                    automergeAttrs: [
                        'myAttrHash',
                        'myAttrHash2',
                        'xxxUnknown',
                        'myNewAttr',
                        'myNewAttr2',
                        'myNewAttr3',
                    ],
                });
                expect(MySubSubclass.myAttrHash).toEqual({
                    'a': 1,
                    'b': 2,
                    'c': 3,
                    'd': 4,
                    'e': 5,
                    'f': 6,
                    'key1': 'value1',
                    'key2': 'value2',
                });
                expect(MySubSubclass.myAttrHash2).toBe(MySubclass.myAttrHash2);
                expect(MySubSubclass.myNewAttr2).toEqual({
                    'foo': 'FOO',
                    'bar': 'BAR',
                });
                expect(MySubSubclass.myNewAttr3).toEqual({
                    'new': 'attr',
                });
            });
        });

        describe('With options.skipAutomergeAttrs=', () => {
            it('As list of attributes', () => {
                @spina({
                    automergeAttrs: ['myAttrHash', 'myAttrHash2'],
                })
                class MyClass extends BaseClass {
                    static myAttrHash: object = {
                        'a': 1,
                        'b': 2,
                    };
                }

                @spina({
                    skipParentAutomergeAttrs: ['myAttrHash'],
                })
                class MySubclass extends MyClass {
                    static myAttrHash: object = {
                        'c': 3,
                        'd': 4,
                    };
                }

                expect(MyClass.__spinaOptions).toEqual({
                    automergeAttrs: ['myAttrHash', 'myAttrHash2'],
                });
                expect(MyClass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                });

                expect(MySubclass.__spinaOptions).toEqual({
                    automergeAttrs: ['myAttrHash2'],
                    skipParentAutomergeAttrs: ['myAttrHash'],
                });
                expect(MySubclass.myAttrHash).toEqual({
                    'c': 3,
                    'd': 4,
                });
            });

            it('As true', () => {
                @spina({
                    automergeAttrs: ['myAttrHash', 'myAttrHash2'],
                })
                class MyClass extends BaseClass {
                    static myAttrHash: object = {
                        'a': 1,
                        'b': 2,
                    };
                }

                @spina({
                    skipParentAutomergeAttrs: true,
                })
                class MySubclass extends MyClass {
                    static myAttrHash: object = {
                        'c': 3,
                        'd': 4,
                    };
                }

                expect(MyClass.__spinaOptions).toEqual({
                    automergeAttrs: ['myAttrHash', 'myAttrHash2'],
                });
                expect(MyClass.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                    'a': 1,
                    'b': 2,
                });

                expect(MySubclass.__spinaOptions).toEqual({
                    skipParentAutomergeAttrs: true,
                });
                expect(MySubclass.myAttrHash).toEqual({
                    'c': 3,
                    'd': 4,
                });
            });
        });

        it('With options.mixins=', () => {
            @spina({
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
                ],
            })
            class MyClass extends BaseClass {
            }

            const proto = MyClass.prototype;
            expect(proto['mixedInAttr1']).toBeTrue();
            expect(proto['mixedInAttr2']).toBe(123);
            expect(proto['mixedInFunc1']).toBeInstanceOf(Function);
            expect(proto['mixedInFunc2']).toBeInstanceOf(Function);
            expect(proto['mixedInFunc3']).toBeInstanceOf(Function);
            expect(MyClass['mixedInAttr3']).toBe('attr3');
        });

        it('With options.name=', () => {
            @spina({
                name: 'MyCustomClass',
            })
            class MyClass extends BaseClass {
            }

            expect(MyClass.hasOwnProperty('name')).toBeTrue();
            expect(MyClass.name).toBe('MyCustomClass');

            const wrappedProto = Object.getPrototypeOf(MyClass);
            expect(wrappedProto.hasOwnProperty('name')).toBeTrue();
            expect(wrappedProto.name).toBe('MyClass');
            expect(Object.getPrototypeOf(wrappedProto)).toBe(BaseClass);
        });

        describe('With options.prototypeAttrs=', () => {
            it('On base class', () => {
                @spina({
                    prototypeAttrs: ['myAttrHash', 'myOtherAttr', 'myMethod'],
                })
                class MyClass extends BaseClass {
                    static myOtherAttr = 12345;
                    static myMethod(this: MyClass) {}
                }

                const wrapperProto = Object.getPrototypeOf(MyClass);

                expect(wrapperProto.__spinaOptions).toEqual({
                    prototypeAttrs: [
                        'myAttrHash',
                        'myOtherAttr',
                        'myMethod',
                    ],
                });

                expect(wrapperProto.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                });
                expect(wrapperProto.myMethod).toBeInstanceOf(Function);
                expect(wrapperProto.myOtherAttr).toBe(12345);
            });

            it('Mixed between classes', () => {
                @spina({
                    prototypeAttrs: ['myAttrHash', 'myOtherAttr', 'myMethod'],
                })
                class MyClass extends BaseClass {
                    static myOtherAttr = 12345;
                    static myMethod(this: MyClass) {}
                }

                @spina({
                    prototypeAttrs: ['myNewAttr', 'myNewAttr2'],
                })
                class MyClass2 extends MyClass {
                    static myNewAttr = 'test';
                    static myNewAttr2 = 'test1';
                }

                let wrapperProto = Object.getPrototypeOf(MyClass2);

                expect(wrapperProto.__spinaOptions).toEqual({
                    prototypeAttrs: [
                        'myAttrHash',
                        'myOtherAttr',
                        'myMethod',
                        'myNewAttr',
                        'myNewAttr2',
                    ],
                });

                @spina({
                    prototypeAttrs: ['myNewAttr2', 'myNewAttr3'],
                })
                class MyClass3 extends MyClass2 {
                    static myNewAttr2 = 'test2';
                    static myNewAttr3 = true;
                }

                wrapperProto = Object.getPrototypeOf(MyClass3);

                expect(wrapperProto.__spinaOptions).toEqual({
                    prototypeAttrs: [
                        'myAttrHash',
                        'myOtherAttr',
                        'myMethod',
                        'myNewAttr',
                        'myNewAttr2',
                        'myNewAttr3',
                    ],
                });

                expect(wrapperProto.myAttrHash).toEqual({
                    'key1': 'value1',
                    'key2': 'value2',
                });
                expect(wrapperProto.myMethod).toBeInstanceOf(Function);
                expect(wrapperProto.myOtherAttr).toBe(12345);
                expect(wrapperProto.myNewAttr).toBe('test');
                expect(wrapperProto.myNewAttr2).toBe('test2');
                expect(wrapperProto.myNewAttr3).toBe(true);
            });
        });
    });

    it('Object initialization', () => {
        @spina
        class MyClass extends BaseClass {
            instanceAttr: any;

            initialize(value) {
                this.instanceAttr = value;
            }
        }

        const instance = new MyClass([1, 2, 3]);

        expect(instance.instanceAttr).toEqual([1, 2, 3]);
        expect(instance.__super__).toBe(BaseClass);
    });

    it('extend', () => {
        @spina
        class MyClass extends BaseClass {
        }

        const MyProto = MyClass.extend({
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
        expect(Object.getPrototypeOf(wrappedProto)).toBe(MyClass);
    });
});
