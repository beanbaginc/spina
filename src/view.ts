import * as Backbone from 'backbone';
import * as _ from 'underscore';

import { spinaBaseClassExtends } from './objects';
import { EventsHash } from './events';


/**
 * A type for a hash mapping DOM attributes to values.
 *
 * Version Added:
 *     2.0
 */
export type ElementAttributes = Backbone.ObjectHash;


/**
 * Options for rendering views into an element.
 */
interface RenderIntoOptions {
    /**
     * Whether to empty out the element before inserting the view's element.
     */
    empty?: boolean

    /**
     * Whether to prepend the view's element, rather than appending it.
     */
    prepend?: boolean
}


/**
 * Base class for views.
 *
 * This extends :js:class:`Backbone.View`, with types, and making it
 * available as a Spina object that can be subclassed using ES6 classes.
 */
export abstract class BaseView<
    TModel extends (Backbone.Model | undefined) = Backbone.Model,
    TElement extends Element = HTMLElement,
    TExtraViewOptions = unknown,
    TViewOptions = Backbone.ViewOptions,
>
extends spinaBaseClassExtends(
    Backbone.View,
    {
        automergeAttrs: [
            'attributes',
            'events',
            'modelEvents',
        ],
        prototypeAttrs: [
            'attributes',
            'className',
            'events',
            'id',
            'modelEvents',
            'tagName',
        ],
    },
)<
    TModel,
    TElement,
    TExtraViewOptions,
    TViewOptions
> {
    /**
     * The defined map of attribute names to values for a created element.
     *
     * If provided, this must be static. It can be a hash of attributes, or a
     * function that returns a hash. The function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable. It can also now be a function.
     */
    static attributes: Backbone._Result<ElementAttributes>;

    /**
     * The defined class name (or names) for a view.
     *
     * If provided, this must be static. It can be a string consisting of
     * space-separated class names, or a function that returns a string. The
     * function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable. It can also now be a function.
     */
    static className: Backbone._Result<string>;

    /**
     * The defined map of events to function handler names.
     *
     * If provided, this must be static. It can be a hash of event descriptors
     * to handler functions, or a function that returns a hash. The function
     * can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable.
     */
    static events: Backbone._Result<Partial<EventsHash>>;

    /**
     * The ID of the created element for the view.
     *
     * If provided, this must be static. It can be a string consisting of
     * an ID for the element, or a function that returns a string. The
     * function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable. It can also now be a function.
     */
    static id: Backbone._Result<string>;

    /**
     * A mapping of model events to callback handlers/names.
     *
     * On render, each of these will be connected automatically, allowing
     * model state or events to update the view as needed.
     *
     * If provided, this must be static. It can be a hash of event names
     * to handler functions, or a function that returns a hash. The function
     * can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable. It can also now be a function.
     */
    static modelEvents: Backbone._Result<Partial<EventsHash>> = {};

    /**
     * The defined tag name to use for the view.
     *
     * If provided, this must be static. It can be a string consisting of
     * a tag name for the element, or a function that returns a string. The
     * function can access ``this``.
     *
     * Version Added:
     *     2.0:
     *     Starting in Spina 2, this must be defined as static, rather than
     *     an instance variable. It can also now be a function.
     */
    static tagName: Backbone._Result<string> = 'div';


    /**********************
     * Instance variables *
     **********************/

    /*
     * These variables above are copied to the prototype and made available
     * to the instance. Declare them to help with type checking.
     */
    declare modelEvents: Backbone._Result<Backbone.EventsHash>;
    declare events: Backbone._Result<EventsHash>;

    /**
     * Whether the view has been rendered at least once.
     */
    rendered = false;

    /**
     * Whether to auto-connect model events on render.
     */
    autoconnectModelEvents = true;

    _modelEventsConnected = false;

    /**
     * Connect model events to handlers.
     *
     * This will loop through :js:attr:`modelEvents`, connecting any events
     * on the view's model to the handlers provided.
     */
    connectModelEvents() {
        const modelEvents: EventsHash = _.result(this, 'modelEvents');
        const model = this.model;

        if (!this._modelEventsConnected && modelEvents && model) {
            for (const eventName in modelEvents) {
                if (modelEvents.hasOwnProperty(eventName)) {
                    const eventValue = modelEvents[eventName];
                    const eventFunction: Backbone.EventHandler =
                        (_.isFunction(eventValue)
                         ? eventValue as Backbone.EventHandler
                         : this[eventValue]);

                    if (eventFunction) {
                        this.listenTo(model, eventName, eventFunction);
                    }
                }
            }

            this._modelEventsConnected = true;
        }
    }

    /**
     * Disconnect model events from handlers.
     *
     * This will loop through :js:attr:`modelEvents`, disconnecting any events
     * formerly connected on the view's model.
     */
    disconnectModelEvents() {
        const modelEvents: EventsHash = _.result(this, 'modelEvents');
        const model = this.model;

        if (this._modelEventsConnected && modelEvents && model) {
            for (const eventName in modelEvents) {
                if (modelEvents.hasOwnProperty(eventName)) {
                    const eventValue = modelEvents[eventName];
                    const eventFunction: Backbone.EventHandler =
                        (_.isFunction(eventValue)
                         ? eventValue as Backbone.EventHandler
                         : this[eventValue]);

                    if (eventFunction) {
                        this.stopListening(model, eventName,
                                           eventFunction);
                    }
                }
            }

            this._modelEventsConnected = false;
        }
    }

    /**
     * Show the view.
     *
     * Returns:
     *     object:
     *     This object, for chaining.
     */
    show(): this {
        this.$el.show();

        return this;
    }

    /**
     * Hide the view.
     *
     * Returns:
     *     object:
     *     This object, for chaining.
     */
    hide(): this {
        this.$el.hide();

        return this;
    }

    /**
     * Render the view into another element.
     *
     * This is a convenience around calling :js:meth:`BaseView.render` and
     * then appending the view's element somewhere. This is a pattern we use
     * a lot in our code.
     *
     * This can optionally clear out the target element first, and can
     * optionally prepend rather than append.
     *
     * Args:
     *     targetEl (Element or jQuery):
     *         The element to render into.
     *
     *     options (object, optional):
     *         Options for inserting the view's element.
     *
     * Option Args:
     *     empty (boolean, optional):
     *         Whether to empty out the target element before inserting the
     *         view's element.
     *
     *     prepend (boolean, optional):
     *         Whether to prepend the view's element, instead of appending.
     *
     * Returns:
     *     object:
     *     This object, for chaining.
     */
    renderInto(
        targetEl: Element | JQuery,
        options: RenderIntoOptions = {},
    ): this {
        if (!_.isElement(targetEl)) {
            targetEl = targetEl[0];
        }

        if (options.empty) {
            targetEl.innerHTML = '';
        }

        if (options.prepend) {
            targetEl.insertBefore(this.el, targetEl.firstChild);
        } else {
            targetEl.appendChild(this.el);
        }

        this.render();

        return this;
    }

    /**
     * Render the view.
     *
     * This will take care to connect model events the first time that the
     * view is rendered, and avoid re-connecting on subsequent renders.
     *
     * To simplify view management, this will call :js:func:`initialRender`
     * on the first render, and :js:func:`eachRender` on each following
     * render. These are cheap, don't require returning ``this``, and will
     * aid in simplifying some views that are already either using this pattern
     * or trying to avoid side effects for multiple render calls.
     *
     * Returns:
     *     object:
     *     This object, for chaining.
     */
    render(): this {
        if (!this.rendered) {
            if (this.autoconnectModelEvents) {
                this.connectModelEvents();
            }

            this.onInitialRender();
            this.rendered = true;
        }

        this.onRender();

        return this;
    }

    /**
     * Handle an initial render of the view.
     *
     * Subclasses can put their logic here, instead of overriding in
     * :js:meth:`BaseView.render`.
     */
    onInitialRender() {
    }

    /**
     * Handle each render of a view.
     *
     * Subclasses can put their logic here, instead of overriding in
     * :js:meth:`BaseView.render`.
     */
    onRender() {
    }
}
