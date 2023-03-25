import * as Backbone from 'backbone';

import {
    spinaBaseClassExtends,
    spinaSubclass,
} from './objects';


/**
 * Type for routes on a router.
 *
 * Version Added:
 *     2.0
 */
export type RoutesHash = Backbone.RoutesHash;


/**
 * Base class for a router.
 */
export abstract class BaseRouter<
    TExtraRouterOptions = unknown,
    TRouterOptions extends Backbone.RouterOptions = Backbone.RouterOptions
> extends spinaBaseClassExtends(
    Backbone.Router,
    {
        automergeAttrs: ['routes'],
        prototypeAttrs: ['routes'],
    }
)<TExtraRouterOptions, TRouterOptions> {
    /**
     * The defined routes for the router.
     *
     * If provided, this must be static. It can be a hash of route keys to
     * handler functions, or a function that returns a hash. The function
     * can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static.
     */
    static routes: Backbone._Result<RoutesHash>;
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
