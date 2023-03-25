import 'jasmine';
import _ from 'underscore';

import {
    BaseModel,
    ModelAttributes,
    spina,
} from '../index';


interface MyModel3Options {
    myExtraDefaults: ModelAttributes;
    myURL: string;
}


/* The first test model contains basic static attributes. */
@spina
class MyModel extends BaseModel {
    static defaults: ModelAttributes = {
        'attr1': 123,
        'attr2': 'abc',
    };

    static idAttribute = 'myID';

    static url = '/api/collection/';
}


/* The second test model extends the first with merged attributes. */
@spina
class MyModel2 extends MyModel {
    static defaults: ModelAttributes = {
        'attr3': true,
        'attr4': null,
    };
}


/* The third test model uses static methods utilizing instance data. */
@spina
class MyModel3 extends BaseModel<ModelAttributes, MyModel3Options> {
    static defaults(
        this: MyModel3,
    ): ModelAttributes {
        return Object.assign({
            'dictKey': {
                'a': 1,
            },
            'listKey': [1],
        }, this.options.myExtraDefaults);
    }

    static url(
        this: MyModel3,
    ): string {
        return this.options.myURL;
    }

    options: MyModel3Options;

    preinitialize(
        attrs: ModelAttributes,
        options: MyModel3Options,
    ) {
        this.options = options;
    }
}


describe('BaseModel', () => {
    describe('Static-defined attributes', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyModel.prototype;

                expect(proto.defaults).toEqual({
                    'attr1': 123,
                    'attr2': 'abc',
                });
                expect(proto.idAttribute).toBe('myID');
            });

            it('On instance', () => {
                const model = new MyModel();

                expect(model.defaults).toEqual({
                    'attr1': 123,
                    'attr2': 'abc',
                });
                expect(model.idAttribute).toBe('myID');
            });
        });

        describe('Merging', () => {
            it('On class', () => {
                expect(MyModel2.defaults).toEqual({
                    'attr1': 123,
                    'attr2': 'abc',
                    'attr3': true,
                    'attr4': null,
                });
            });

            it('On prototype', () => {
                const proto = MyModel2.prototype;

                expect(proto.defaults).toEqual({
                    'attr1': 123,
                    'attr2': 'abc',
                    'attr3': true,
                    'attr4': null,
                });
            });

            it('On instance', () => {
                const model = new MyModel2();

                expect(model.defaults).toEqual({
                    'attr1': 123,
                    'attr2': 'abc',
                    'attr3': true,
                    'attr4': null,
                });
            });
        });
    });

    describe('Static-defined attribute functions', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyModel3.prototype;

                expect(proto.defaults).toBeInstanceOf(Function);
                expect(proto.url).toBeInstanceOf(Function);
            });

            it('On instance', () => {
                const model1 = new MyModel3({}, {
                    myExtraDefaults: {
                        'myExtra': [1, 2, 3],
                    },
                    myURL: '/api/v2/collection/',
                });

                expect(model1.defaults).toBeInstanceOf(Function);
                expect(_.result(model1, 'defaults')).toEqual({
                    'dictKey': {
                        'a': 1,
                    },
                    'listKey': [1],
                    'myExtra': [1, 2, 3],
                });
                expect(model1.attributes).toEqual({
                    'dictKey': {
                        'a': 1,
                    },
                    'listKey': [1],
                    'myExtra': [1, 2, 3],
                });

                /*
                 * Let's modify those to make sure they don't carry over to
                 * other instances.
                 */
                model1.attributes['listKey'].push(2);
                model1.attributes['dictKey']['b'] = 'c';
                model1.attributes['myExtra'].push('a');

                /* Now create a new instance. */
                const model2 = new MyModel3({}, {
                    myExtraDefaults: {
                        'myExtra': [1, 2, 3],
                        'myExtra2': true,
                    },
                    myURL: '/api/v3/collection/',
                });

                expect(model2.defaults).toBeInstanceOf(Function);
                expect(_.result(model2, 'defaults')).toEqual({
                    'dictKey': {
                        'a': 1,
                    },
                    'listKey': [1],
                    'myExtra': [1, 2, 3],
                    'myExtra2': true,
                });
                expect(model2.attributes).toEqual({
                    'dictKey': {
                        'a': 1,
                    },
                    'listKey': [1],
                    'myExtra': [1, 2, 3],
                    'myExtra2': true,
                });
            });
        });
    });
});
