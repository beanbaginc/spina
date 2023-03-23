/**
 * Spina model classes.
 *
 * This provides classes and typing for creating new model classes.
 */

import * as Backbone from 'backbone';

import { spinaBaseClassExtends } from './objects';


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
export abstract class BaseModel<T extends Backbone.ObjectHash = any,
                                E = unknown,
                                S = Backbone.ModelSetOptions>
extends spinaBaseClassExtends(
    Backbone.Model,
    {
        automergeAttrs: [
            'defaults',
        ],
        prototypeAttrs: [
            'defaults',
            'idAttribute',
        ],
    }
)<T, S, E> {
    /**
     * The defined default attributes for the model.
     *
     * If provided, this must be defined as static.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static defaults: Backbone.ObjectHash = {};

    /**
     * The name of the ID attribute to set.
     *
     * If provided, this must be defined as static.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static idAttribute: string = 'id';


    /**********************
     * Instance variables *
     **********************/

    /*
     * These variables above are copied to the prototype and made available
     * to the instance. Declare them to help with type checking.
     */
    declare defaults: Backbone._Result<Partial<T>>;
    declare idAttribute: string;
}
