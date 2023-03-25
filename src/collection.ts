/**
 * Spina collection classes.
 *
 * This provides classes and typing for creating new collection classes and
 * instances.
 */

import * as Backbone from 'backbone';

import { Class, spina, spinaBaseClassExtends } from './objects';
import { BaseModel } from './model';


/**
 * Base class for collections.
 *
 * This extends :js:class:`Backbone.Collection`, with types, and making it
 * available as a Spina object that can be subclassed using ES6 classes.
 */
export abstract class BaseCollection<
    TModel extends Backbone.Model = Backbone.Model,
    TExtraCollectionOptions = unknown,
    TCollectionOptions = Backbone.CollectionOptions<TModel>
> extends spinaBaseClassExtends(
    Backbone.Collection,
    {
        prototypeAttrs: [
            'model',
            'url',
        ],
    }
)<TModel, TExtraCollectionOptions, TCollectionOptions> {
    /**
     * The type of model stored in the collection.
     *
     * If provided, this must be defined as static.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static model: Class<Backbone.Model>;

    /**
     * The URL for server-side communication.
     *
     * If provided, this must be static. It can be a string with a URL, or a
     * function that returns a string. The function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static url: Backbone._Result<string>;
}


/**
 * Generic class for standalone collections.
 *
 * Unlike :js:class:`BaseCollection`, this does not need to be subclassed,
 * and can be used to create a standalone instance.
 */
@spina
export class Collection<TModel extends Backbone.Model = Backbone.Model>
extends BaseCollection<TModel> {
    /*
     * Default value for the model. This will be overridden if provided
     * in options.
     */
    static model = Backbone.Model;
}
