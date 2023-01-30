import * as Backbone from 'backbone';

import {
    spinaBaseClassExtends,
    spinaSubclass,
} from './objects';


/**
 * Base class for a router.
 */
export abstract class BaseRouter
extends spinaBaseClassExtends(Backbone.Router) {
    /* Prototype for BaseRouter. */
}


/**
 * Generic class for standalone routers.
 *
 * Unlike :js:class:`BaseRouter`, this does not need to be subclassed,
 * and can be used to create a standalone instance.
 */
@spinaSubclass
export class Router extends BaseRouter {
    /* Prototype for Router. */
}
