import * as Backbone from 'Backbone';
import * as _ from 'underscore';

import { spinaBaseClassExtends } from './objects';


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
extends spinaBaseClassExtends(Backbone.View)<
    TModel,
    TElement,
    TExtraViewOptions,
    TViewOptions
> {
    _modelEventsConnected = false;

    /**
     * Whether the view has been rendered at least once.
     */
    rendered = false;

    /**
     * Whether to auto-connect model events on render.
     */
    autoconnectModelEvents = true;

    /**
     * A mapping of model events to callback handlers/names.
     *
     * On render, each of these will be connected automatically, allowing
     * model state or events to update the view as needed.
     */
    modelEvents: Backbone.EventsHash = {};

    /**
     * Connect model events to handlers.
     *
     * This will loop through :js:attr:`modelEvents`, connecting any events
     * on the view's model to the handlers provided.
     */
    connectModelEvents() {
        const modelEvents = this.modelEvents;
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
        const modelEvents = this.modelEvents;
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
