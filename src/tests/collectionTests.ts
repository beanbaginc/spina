import 'jasmine';

import { BaseModel, Collection, spina } from '../index';


@spina
class MyModel extends BaseModel {
}


describe('Collection', () => {
    it('Caller-defined attributes', () => {
        const collection = new Collection<MyModel>([], {
            model: MyModel,
        });

        expect(collection.model).toBe(MyModel);
    });
});
