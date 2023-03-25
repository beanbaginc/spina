/**
 * Spina model classes.
 *
 * This provides classes and typing for creating new model classes.
 */

import * as Backbone from 'backbone';

import { spinaBaseClassExtends } from './objects';


/**
 * A base type for attributes or defaults for a model.
 *
 * Version Added:
 *     2.0
 */
export type ModelAttributes = Backbone.ObjectHash;


/**
 * Base class for models.
 *
 * This extends :js:class:`Backbone.Model`, with types, and making it
 * available as a Spina object that can be subclassed using ES6 classes.
 *
 * Note that unlike the typing for :js:class:`Backbone.Model`, we prioritize
 * the option extensions in the generics, and we set it to ``unknown`` by
 * default (``@types/backbone`` has a default of ``any``, which removes all
 * type safety for options).
 */
export abstract class BaseModel<
    TDefaults extends ModelAttributes = ModelAttributes,
    TExtraModelOptions = unknown,
    TModelOptions = Backbone.ModelSetOptions
>
extends spinaBaseClassExtends(
    Backbone.Model,
    {
        automergeAttrs: [
            'defaults',
        ],
        prototypeAttrs: [
            'defaults',
            'idAttribute',
            'urlRoot',
        ],
    }
)<TDefaults, TModelOptions, TExtraModelOptions> {
    /**
     * The defined default attributes for the model.
     *
     * If provided, this must be static. It can be a hash of attribute names
     * to values, or a function that returns a hash. The function can access
     * ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static defaults: Backbone._Result<Partial<ModelAttributes>> = {};

    /**
     * The name of the ID attribute to set.
     *
     * If provided, this must be static.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static idAttribute: string = 'id';

    /**
     * The root for any relative URLs.
     *
     * If provided, this must be static. It can be a string with the URL root,
     * or a function that returns a string. The function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static urlRoot: Backbone._Result<string>;
}
