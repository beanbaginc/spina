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
> extends spinaBaseClassExtends(
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
    static id: Backbone._Result<string | null>;

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
     * Return the DOm element attributes for this view's element.
     *
     * Consumers should use this instead of accessing :js:attr:`attributes`
     * directly. It takes care of accessing either a static or dynamic
     * value for :js:attr:`attributes`.
     *
     * Version Added:
     *     3.0
     *
     * Returns:
     *     object:
     *     The mapping of attribute names to values.
     */
    getAttributes(): ElementAttributes {
        return _.result(this, 'attributes') || {};
    }

    /**
     * Return the class name (or names) used for the view's element.
     *
     * Consumers should use this instead of accessing :js:attr:`className`
     * directly. It takes care of accessing either a static or dynamic
     * value for :js:attr:`className`.
     *
     * Version Added:
     *     3.0
     *
     * Returns:
     *     string:
     *     The class name for the view's element.
     */
    getClassName(): string {
        return _.result(this, 'className') || '';
    }

    /**
     * Return the ID used for the view's element.
     *
     * Consumers should use this instead of accessing :js:attr:`id` directly.
     * takes care of accessing either a static or dynamic value for
     * :js:attr:`id`.
     *
     * Version Added:
     *     3.0
     *
     * Returns:
     *     string:
     *     The element ID, or ``null``.
     */
    getID(): string | null {
        return _.result(this, 'id');
    }

    /**
     * Return the tag name used for the view's element.
     *
     * Consumers should use this instead of accessing :js:attr:`tagName`
     * directly. It takes care of accessing either a static or dynamic
     * value for :js:attr:`tagName`.
     *
     * Version Added:
     *     3.0
     *
     * Returns:
     *     string:
     *     The tag name for the view's element.
     */
    getTagName(): string {
        return _.result(this, 'tagName');
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
     * Before rendering, this will trigger a ``rendering`` event. After
     * render, this will trigger a ``rendered`` event. Both take an object
     * parameter with an ``initialRender`` boolean.
     *
     * Version Changed:
     *     3.0:
     *     * Added the ``rendering`` and ``rendered`` events.
     *     * The :js:attr:`rendered` state is now set after :js:func:`onRender`
     *       is called, not after :js:func:`onInitialRender`.
     *
     * Returns:
     *     object:
     *     This object, for chaining.
     */
    render(): this {
        const initialRender = !this.rendered;
        const signalState = {
            initialRender: initialRender,
        };

        this.trigger('rendering', signalState);

        if (initialRender) {
            if (this.autoconnectModelEvents) {
                this.connectModelEvents();
            }

            this.onInitialRender();
        }

        this.onRender();
        this.rendered = true;

        this.trigger('rendered', signalState);

        return this;
    }

    /**
     * Remove the view from the DOM.
     *
     * This will take care of removing the view's element and any related
     * elements or state.
     *
     * Before removing, this will trigger a ``removing`` event. After removing,
     * this will trigger a ``removed`` event.
     *
     * Version Changed:
     *     3.1:
     *     * This now triggers ``removing`` and ``removed`` events.
     *     * :js:func:`onRemove` is now called before the view's element is
     *       removed.
     *
     * Returns:
     *     BaseView:
     *     This object, for chaining.
     */
    remove(): this {
        this.trigger('removing');

        this.onRemove();
        super.remove();

        this.trigger('removed');

        return this;
    }

    /**
     * Handle an initial render of the view.
     *
     * Subclasses can put their logic here, instead of overriding in
     * :js:meth:`BaseView.render`.
     *
     * Version Changed:
     *     3.0:
     *     This function is now protected, not public.
     */
    protected onInitialRender() {
    }

    /**
     * Handle each render of a view.
     *
     * Subclasses can put their logic here, instead of overriding in
     * :js:meth:`BaseView.render`.
     *
     * Version Changed:
     *     3.0:
     *     This function is now protected, not public.
     */
    protected onRender() {
    }

    /**
     * Handle removing state or elements in this view.
     *
     * Subclasses can put their logic here, instead of overriding in
     * :js:meth:`BaseView.remove`.
     *
     * Version Added:
     *     3.1
     */
    protected onRemove() {
    }
}
