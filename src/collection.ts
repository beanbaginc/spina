/**
 * Spina collection classes.
 *
 * This provides classes and typing for creating new collection classes and
 * instances.
 */

import * as Backbone from 'backbone';

import {
    Class,
    Subclass,
    spinaBaseClassExtends,
    spinaSubclass,
} from './objects';
import { BaseModel } from './model';


/**
 * Base class for collections.
 *
 * This extends :js:class:`Backbone.Collection`, with types, and making it
 * available as a Spina object that can be subclassed using ES6 classes.
 */
export abstract class BaseCollection<TModel extends Backbone.Model = BaseModel>
extends spinaBaseClassExtends(
    Backbone.Collection,
    {
        prototypeAttrs: ['model'],
    }
)<TModel> {
    /**
     * The type of model stored in the collection.
     *
     * If provided, this must be defined as static.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static model: Subclass<Backbone.Model>;


    /**********************
     * Instance variables *
     **********************/

    /*
     * These variables above are copied to the prototype and made available
     * to the instance. Declare them to help with type checking.
     */
    declare model: Class<TModel>;
}


/**
 * Generic class for standalone collections.
 *
 * Unlike :js:class:`BaseCollection`, this does not need to be subclassed,
 * and can be used to create a standalone instance.
 */
@spinaSubclass
export class Collection<TModel extends Backbone.Model = BaseModel>
extends BaseCollection<TModel> {
    /* Prototype for Collection. */
    static model = BaseModel;
}
