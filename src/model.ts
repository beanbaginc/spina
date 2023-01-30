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
extends spinaBaseClassExtends(Backbone.Model)<T, S, E> {
    /* Prototype for BaseModel. */
}
