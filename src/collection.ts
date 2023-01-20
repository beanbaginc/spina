/**
 * Spina collection classes.
 *
 * This provides classes and typing for creating new collection classes and
 * instances.
 */

import * as Backbone from 'Backbone';

import {
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
extends spinaBaseClassExtends(Backbone.Collection)<TModel> {
    /* Prototype for BaseCollection. */
}


/**
 * Generic class for standalone collections.
 *
 * Unlike :js:class:`BaseCollection`, this does not need to be subclassed,
 * and can be used to create a standalone instance.
 */
@spinaSubclass
export class Collection<TModel extends Backbone.Model = BaseModel >
extends BaseCollection<TModel> {
    /* Prototype for Collection. */
}
