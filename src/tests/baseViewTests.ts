import 'jasmine';
import _ from 'underscore';
import jQuery from 'jquery';

import {
    BaseModel,
    BaseView,
    Class,
    ElementAttributes,
    EventsHash,
    spina
} from '../index';


const $ = jQuery;


interface MyView3Options {
    myAttributes: ElementAttributes;
    myClassName: string;
    myEvents: EventsHash;
    myID: string;
    myModelEvents: EventsHash;
    myTagName: string;
}


@spina
class MyModel extends BaseModel {
}


@spina
class BaseTestView extends BaseView {
    _onClick() {
    }

    _onMyEvent(...args) {
    }
}


/* The first test view contains basic static attributes. */
@spina
class MyView extends BaseTestView {
    static attributes: ElementAttributes = {
        'data-foo': 'bar',
        'style': 'display: inline',
    }

    static className = 'my-class';

    static events: EventsHash = {
        'click button': '_onClick',
    };

    static id = 'my-id';

    static modelEvents: EventsHash = {
        'my-event': '_onMyEvent',
    };

    static tagName = 'article';

    /* Change these from protected to public, for testing. */
    public onInitialRender() {};
    public onRender() {};
}


/* The second test view extends the first with merged attributes. */
@spina
class MyView2 extends MyView {
    static attributes: ElementAttributes = {
        'data-bar': '123',
        'readonly': '',
    }

    static events: EventsHash = {
        'mousedown': '_onMouseDown',
    };

    static modelEvents: EventsHash = {
        'other-event': '_onOtherEvent',
    };

    _onMouseDown() {}
    _onOtherEvent() {}
}


/* The third test view uses static methods utilizing instance data. */
@spina
class MyView3 extends BaseView<MyModel, HTMLDivElement, MyView3Options> {
    static attributes(
        this: MyView3,
    ): ElementAttributes {
        return this.options.myAttributes;
    }

    static className(
        this: MyView3,
    ): string {
        return this.options.myClassName;
    }

    static events(
        this: MyView3,
    ): EventsHash {
        return this.options.myEvents;
    };

    static id(
        this: MyView3,
    ): string {
        return this.options.myID;
    }

    static modelEvents(
        this: MyView3,
    ): EventsHash {
        return this.options.myModelEvents;
    };

    static tagName(
        this: MyView3,
    ): string {
        return this.options.myTagName;
    }

    options: MyView3Options;

    preinitialize(options: MyView3Options) {
        this.options = options;
    }
}


describe('BaseView', () => {
    describe('Static attributes', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyView.prototype;

                expect(proto.attributes).toEqual({
                    'data-foo': 'bar',
                    'style': 'display: inline',
                });
                expect(proto.className).toBe('my-class');
                expect(proto.events).toEqual({
                    'click button': '_onClick',
                });
                expect(proto.id).toBe('my-id');
                expect(proto.modelEvents).toEqual({
                    'my-event': '_onMyEvent',
                });
                expect(proto.tagName).toBe('article');
            });

            it('On instance', () => {
                const view = new MyView();

                expect(view.attributes).toEqual({
                    'data-foo': 'bar',
                    'style': 'display: inline',
                });
                expect(view.className).toBe('my-class');
                expect(view.events).toEqual({
                    'click button': '_onClick',
                });
                expect(view.id).toBe('my-id');
                expect(view.modelEvents).toEqual({
                    'my-event': '_onMyEvent',
                });
                expect(view.tagName).toBe('article');
            });
        });

        describe('Merging', () => {
            it('On class', () => {
                expect(MyView2.attributes).toEqual({
                    'data-bar': '123',
                    'data-foo': 'bar',
                    'readonly': '',
                    'style': 'display: inline',
                });
                expect(MyView2.events).toEqual({
                    'click button': '_onClick',
                    'mousedown': '_onMouseDown',
                });
                expect(MyView2.modelEvents).toEqual({
                    'my-event': '_onMyEvent',
                    'other-event': '_onOtherEvent',
                });
            });

            it('On prototype', () => {
                const proto = MyView2.prototype;

                expect(proto.attributes).toEqual({
                    'data-bar': '123',
                    'data-foo': 'bar',
                    'readonly': '',
                    'style': 'display: inline',
                });
                expect(proto.events).toEqual({
                    'click button': '_onClick',
                    'mousedown': '_onMouseDown',
                });
                expect(proto.modelEvents).toEqual({
                    'my-event': '_onMyEvent',
                    'other-event': '_onOtherEvent',
                });
            });

            it('On instance', () => {
                const view = new MyView2();

                expect(view.attributes).toEqual({
                    'data-bar': '123',
                    'data-foo': 'bar',
                    'readonly': '',
                    'style': 'display: inline',
                });
                expect(view.events).toEqual({
                    'click button': '_onClick',
                    'mousedown': '_onMouseDown',
                });
                expect(view.modelEvents).toEqual({
                    'my-event': '_onMyEvent',
                    'other-event': '_onOtherEvent',
                });
            });
        });
    });

    describe('Static-defined attribute functions', () => {
        describe('Access', () => {
            it('On prototype', () => {
                const proto = MyView3.prototype;

                expect(proto.attributes).toBeInstanceOf(Function);
                expect(proto.className).toBeInstanceOf(Function);
                expect(proto.events).toBeInstanceOf(Function);
                expect(proto.id).toBeInstanceOf(Function);
                expect(proto.modelEvents).toBeInstanceOf(Function);
                expect(proto.tagName).toBeInstanceOf(Function);
            });

            it('On instance', () => {
                const el = document.createElement('div');
                const view = new MyView3({
                    myAttributes: {
                        'data-a': 'b',
                    },
                    myClassName: 'myClass',
                    myEvents: {
                        'mousedown #foo': '_onMouseDown',
                    },
                    myID: 'id123',
                    myModelEvents: {
                        'change:myattr': '_onMyAttrChanged',
                    },
                    myTagName: 'hr',
                });

                expect(view.attributes).toBeInstanceOf(Function);
                expect(view.className).toBeInstanceOf(Function);
                expect(view.events).toBeInstanceOf(Function);
                expect(view.id).toBeInstanceOf(Function);
                expect(view.modelEvents).toBeInstanceOf(Function);
                expect(view.tagName).toBeInstanceOf(Function);

                /*
                 * Unfortunately, the above doesn't narrow types. We have to
                 * work around that.
                 */

                expect(_.result(view, 'attributes')).toEqual({
                    'data-a': 'b',
                });
                expect(_.result(view, 'className')).toBe('myClass');
                expect(_.result(view, 'events')).toEqual({
                    'mousedown #foo': '_onMouseDown',
                });
                expect(_.result(view, 'id')).toBe('id123');
                expect(_.result(view, 'modelEvents')).toEqual({
                    'change:myattr': '_onMyAttrChanged',
                });
                expect(_.result(view, 'tagName')).toBe('hr');

                /* Make sure these render correctly. */
                view.renderInto(el);

                expect(el.innerHTML).toBe(
                    '<hr data-a="b" id="id123" class="myClass">'
                );
            });
        });
    });

    describe('Event dispatching', () => {
        describe('DOM events', () => {
            function runTest(TestView: typeof BaseTestView) {
                const el = document.createElement('div');
                const childEl = document.createElement('button');
                el.appendChild(childEl);

                const view = new TestView({
                    el: el,
                });

                /* Make sure events are bound to our spy. */
                view.undelegateEvents();
                spyOn(view, '_onClick');
                view.delegateEvents();

                childEl.dispatchEvent(new window.MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                }));

                expect(view._onClick).toHaveBeenCalled();
            }

            it('With events as hash', () => {
                @spina
                class TestView extends BaseTestView {
                    static events = {
                        'click button': '_onClick',
                    };
                }

                runTest(TestView);
            });

            it('With events as function', () => {
                @spina
                class TestView extends BaseTestView {
                    static events() {
                        return {
                            'click button': '_onClick',
                        };
                    };
                }

                runTest(TestView);
            });
        });

        describe('Model events', () => {
            function runTest(TestView: typeof BaseTestView) {
                const model = new MyModel();

                const view = new TestView({
                    model: model,
                });

                spyOn(view, '_onMyEvent');
                view.render();

                model.trigger('my-event', 'a', 1, true);

                expect(view._onMyEvent).toHaveBeenCalledWith('a', 1, true);
            }

            it('With modelEvents as hash', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents = {
                        'my-event': '_onMyEvent',
                    };
                }

                runTest(TestView);
            });

            it('With modelEvents as function', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents() {
                        return {
                            'my-event': '_onMyEvent',
                        };
                    };
                }

                runTest(TestView);
            });
        });
    });

    describe('Methods', () => {
        it('hide', () => {
            const view = new MyView();
            view.render();

            const self = view.hide();

            expect(view.el.style.display).toBe('none');
            expect(self).toBe(view);
        });

        it('show', () => {
            const view = new MyView();
            view.render();
            view.el.style.display = 'none';

            const self = view.show();

            expect(view.el.style.display).toBe('');
            expect(self).toBe(view);
        });

        it('render', () => {
            /* Make sure the handlers are called correctly. */
            const view = new MyView();
            expect(view.rendered).toBeFalse();

            const renderingSpy = jasmine.createSpy();
            const renderedSpy = jasmine.createSpy();

            view.on('rendering', renderingSpy);
            view.on('rendered', renderedSpy);

            spyOn(view, 'onInitialRender');
            spyOn(view, 'onRender');

            /* Perform the initial render. */
            const self1 = view.render();

            expect(renderingSpy).toHaveBeenCalledWith({
                initialRender: true,
            });
            expect(renderedSpy).toHaveBeenCalledWith({
                initialRender: true,
            });

            expect(view.rendered).toBeTrue();

            /* Perform a second render. */
            const self2 = view.render();

            expect(renderingSpy).toHaveBeenCalledWith({
                initialRender: false,
            });
            expect(renderedSpy).toHaveBeenCalledWith({
                initialRender: false,
            });

            expect(view.rendered).toBeTrue();
            expect(view.onInitialRender).toHaveBeenCalledTimes(1);
            expect(view.onRender).toHaveBeenCalledTimes(2);
            expect(self1).toBe(view);
            expect(self2).toBe(view);
        });

        describe('connectModelEvents', () => {
            function runTest(TestView: typeof BaseTestView) {
                /* We won't render(), so events won't yet be connected. */
                const model = new MyModel();

                const view = new TestView({
                    model: model,
                });

                spyOn(view, '_onMyEvent');

                /*
                 * Sanity-check that we aren't starting out with connected
                 * events
                 */
                model.trigger('my-event', 'a', 1, true);

                expect(view._onMyEvent).not.toHaveBeenCalled();
                expect(view._modelEventsConnected).toBeFalse();

                /* Connect the events and re-test. */
                view.connectModelEvents();

                model.trigger('my-event', 'a', 1, true);

                expect(view._onMyEvent).toHaveBeenCalledWith('a', 1, true);
                expect(view._modelEventsConnected).toBeTrue();
            }

            it('With modelEvents as hash', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents = {
                        'my-event': '_onMyEvent',
                    };
                }

                runTest(TestView);
            });

            it('With modelEvents as function', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents() {
                        return {
                            'my-event': '_onMyEvent',
                        };
                    };
                }

                runTest(TestView);
            });
        });

        describe('disconnectModelEvents', () => {
            function runTest(TestView: typeof BaseTestView) {
                const model = new MyModel();

                const view = new TestView({
                    model: model,
                });

                spyOn(view, '_onMyEvent');
                view.render();
                expect(view._modelEventsConnected).toBeTrue();

                view.disconnectModelEvents();

                model.trigger('my-event', 'a', 1, true);

                expect(view._onMyEvent).not.toHaveBeenCalled();
                expect(view._modelEventsConnected).toBeFalse();
            }

            it('With modelEvents as hash', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents = {
                        'my-event': '_onMyEvent',
                    };
                }

                runTest(TestView);
            });

            it('With modelEvents as function', () => {
                @spina
                class TestView extends BaseTestView {
                    static modelEvents() {
                        return {
                            'my-event': '_onMyEvent',
                        };
                    };
                }

                runTest(TestView);
            });
        });

        describe('renderInto', () => {
            it('With Element target', () => {
                const el = document.createElement('div');
                el.innerHTML = '<h1>Test</h1>';

                const view = new MyView();
                const self = view.renderInto(el);

                expect(el.innerHTML).toBe(
                    '<h1>Test</h1>' +
                    '<article data-foo="bar" style="display: inline"' +
                    ' id="my-id" class="my-class"></article>'
                );
                expect(self).toBe(view);
            });

            it('With jQuery target', () => {
                const $el = $('<div>');
                $el.append($('<h1>').text('Test'));

                const view = new MyView();
                const self = view.renderInto($el);

                expect($el.html()).toBe(
                    '<h1>Test</h1>' +
                    '<article data-foo="bar" style="display: inline"' +
                    ' id="my-id" class="my-class"></article>'
                );
                expect(self).toBe(view);
            });

            it('With empty=true', () => {
                const el = document.createElement('div');
                el.innerHTML = '<h1>Test</h1>';

                const view = new MyView();
                const self = view.renderInto(el, {
                    empty: true,
                });

                expect(el.innerHTML).toBe(
                    '<article data-foo="bar" style="display: inline"' +
                    ' id="my-id" class="my-class"></article>'
                );
                expect(self).toBe(view);
            });

            it('With prepend=true', () => {
                const el = document.createElement('div');
                el.innerHTML = '<h1>Test</h1>';

                const view = new MyView();
                const self = view.renderInto(el, {
                    prepend: true,
                });

                expect(el.innerHTML).toBe(
                    '<article data-foo="bar" style="display: inline"' +
                    ' id="my-id" class="my-class"></article>' +
                    '<h1>Test</h1>'
                );
                expect(self).toBe(view);
            });
        });
    });
});
