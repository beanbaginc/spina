/**
 * Spina collection classes.
 *
 * This provides classes and typing for creating new collection classes and
 * instances.
 */

import * as Backbone from 'backbone';
import * as _ from 'underscore';

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
    TCollectionOptions extends Backbone.CollectionOptions<TModel> =
        Backbone.CollectionOptions<TModel>
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
    static url: Backbone._Result<string | null>;

    /**
     * Return the URL for the model.
     *
     * Consumers should use this instead of accessing :js:attr:`url`
     * directly. It takes care of accessing either a static or dynamic
     * value for :js:attr:`url`.
     *
     * Version Added:
     *     3.0
     *
     * Returns:
     *     string:
     *     The URL to the model, or ``null`` if there isn't a URL.
     */
    getURL(): string | null {
        return _.result(this, 'url');
    }
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
