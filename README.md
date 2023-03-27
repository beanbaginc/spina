# Spina, a modern Backbone

At [Beanbag](https://www.beanbaginc.com), we make heavy of
[Backbone.js](https://backbonejs.org). We like it for the ability to cleanly
separate how we store state and process logic from how we display it.

Unfortunately, there are problems with Backbone when writing modern-day
JavaScript. So we set out to solve some of these. The result is Spina.


## How does Spina improve Backbone?

Spina wraps Backbone, rather than replacing it, and makes it more suitable
for modern JavaScript development.

It introduces the following:

1. Restored ability to define `defaults`, `url`, etc. as attributes in
   ES6-based Backbone subclasses (using `class ... extends ...`)

2. A fixed order of initialization for subclasses when using ES6 classes.

3. Improvements to views:

   1. Easier model event registration (similar to DOM event registration)

   2. Better control over render behavior.

4. Improved typing for TypeScript.

5. Mixins for classes.

6. Full compatibility with code already using Backbone.

If you want to learn more about the initialization problem of typing issues,
read the Deep Dives below.


## Installing Spina

To install, run:

```
npm install --save @beanbag/spina
```


### Enabling TypeScript Support

If you're using TypeScript, you'll then want to enable experimental decorators
and add our Backbone types. You can do this by placing the following in
`tsconfig.json`:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "moduleResolution": "node",
        "paths": {
            "Backbone": ["node_modules/@beanbag/spina/lib/@types/backbone"]
        }
    }
}
```


## Usage

Spina provides new base classes for several Backbone classes:

* `Spina.BaseCollection` replaces `Backbone.Collection`
* `Spina.BaseModel` replaces `Backbone.Model`
* `Spina.BaseRouter` replaces `Backbone.Router`
* `Spina.BaseView` replaces `Backbone.View`

Plus generic classes that can be instantiated:

* `Spina.Collection`
* `Spina.Router`

The `Base*` classes are abstract base classes, and must be subclassed before
use.

To subclass any of these classes, you need to use our `@spina` decorator.
This fixes up the object initialization order, letting you set attributes
without defining them as methods on your class. You'll see examples below.


### Spina.BaseCollection

This replaces `Backbone.Collection`, and is used as a base for new
subclasses:

```typescript
import { BaseCollection, spina } from '@beanbag/spina';

@spina
class MyCollection extends BaseCollection {
    static model = MyModel;

    ...
}

// Or:
const MyCollection = spina(class MyCollection extends BaseCollection {
    ...
});
```

If using TypeScript, it can optionally take the model type:

```typescript
import { BaseCollection, spina } from '@beanbag/spina';

@spina
class MyCollection extends BaseCollection<MyModel> {
    static model = MyModel;

    ...
}
```


### Spina.BaseModel

Models can be defined using attributes for `defaults`, `url`, etc.

For example:

```typescript
import { BaseModel, spina } from '@beanbag/spina';

@spina
class MyModel extends BaseModel {
    static defaults = {
        attr1: 'foo',
        attr2: 42,
    };

    static url = '/api/mymodels';

    initialize() {
        ...
    }
}

// Or:
const MyModel = spina(class MyModel extends BaseModel {
    ...
});
```

If using TypeScript, it can optionally take an `interface` describing the
attributes, as well as an `interface` for additional options to pass to the
constructor. For example:

Example:

```typescript
interface MyModelAttrs {
    attr1: string;
    attr2: number;
}

interface MyModelOptions {
    option1: string;
    option2: boolean;
}

@spina
class MyModel extends BaseModel<MyModelAttrs, MyModelOptions> {
    ...
}
```

(If you're using this same support in `Backbone.Model` today, we've
swapped the 2nd and 3rd values for the Generics. This makes it easier to
define custom options.)

If you need to return dynamic attributes, you can define a static method.
This will be transformed into a method on the prototype, allowing Spina to
call it with ``this`` set to the instance. For example, using TypeScript:

```typescript
import { BaseModel, spina } from '@beanbag/spina';

@spina
class MyModel extends BaseModel {
    static defaults(this: MyModel) {
        return {
            attr1: 'foo',
            attr2: 42,
            attr3: this.someValue,
        };
    };

    someValue: string = 'test';
}
```

Backbone and Spina allow many attributes to be defined as methods.


### Spina.BaseRouter

This replaces `Backbone.Router`, and is used as a base for new subclasses:

```typescript
import { BaseRouter, spina } from '@beanbag/spina';

@spina
class MyRouter extends BaseRouter {
    ...
};
```


### Spina.BaseView

#### Event Registration

Views handle event registration the same way they do in Backbone.

Spina views don't require `events` to be a function. Instead, they're as simple
as:


```typescript
import { BaseView, spina } from '@beanbag/spina';

@spina
class MyView extends BaseView {
    static events = {
        'click': '_onClick',
    };

    _onClick(evt) {
        ...
    }
}
```

**Note:** Due to limitations with ES6 classes, you can't use private methods
in the form of `#myHandler`, since it's not possible for the event handlers
to look up the right function. If you're using TypeScript, you may want to
prefix your handler method with `private` or `protected`.


##### Automatic Merging of Events

If subclassing a view with `events`, the parent's event handlers are
automatically registered. This means there's no need to use `_.defaults(...)`
or `_.extend(...)` to pass in the parent's `events`.

To disable that, do:

```typescript
@spina({
    skipParentAutomergeAttrs: ['events'],
})
class MyView extends BaseView {
    static events = {
        ...
    };
}
```


#### Model Event Registration

Views now support automatic registration of model events on the first
render (if you haven't overridden `render()`):

```typescript
import { BaseView, spina } from '@beanbag/spina';

@spina
class MyView extends BaseView {
    static modelEvents = {
        'change:attr1': '_onAttr1Changed',
    };

    _onAttr1Changed(model, evt) {
        ...
    }
}

// Or:
const MyView = spina(class MyView extends BaseView {
    ...
});
```

If using TypeScript, it can optionally take a model type and HTML element type:

```typescript
import { BaseView, spina } from '@beanbag/spina';

@spina
class MyView extends BaseView<MyModel, HTMLDivElement> {
    ...
}
```


##### Automatic Merging of Events

If subclassing a view with `modelEvents`, the parent's event handlers are
automatically registered. This means there's no need to use `_.defaults(...)`
or `_.extend(...)` to pass in the parent's `modelEvents`.

```typescript
@spina({
    skipParentAutomergeAttrs: ['modelEvents'],
})
class MyView extends BaseView {
    static modelEvents = {
        ...
    };
}
```


#### Render Helpers

Views gained a new method, `renderInto()`, which helps to render a view
and then append it (or prepend it) to an element. For example:

```typescript
// Append to a parent.
myView.renderInto(parentEl);

// Prepend to a parent.
myView.renderInto(parentEl, {prepend: true});

// Empty the parent first.
myView.renderInto(parentEl, {empty: true});
```


Renders are also better managed. This is partly to enable model event
registration, and partly to solidify some patterns we often use.

Instead of overriding `render()`, you can now override `onInitialRender()` to
render only the first time `render()` is called, and/or override `onRender()`
to render each time `render()` is called.

Bonus: No need to return `this`.

```typescript
@spina
class MyView extends BaseView {
    onInitialRender() {
        // Do this only the first time render() is called.
    }

    onRender() {
        // Do this every time render() is called.
    }
}
```

Both are optional.


#### Show/Hide

Views can now be shown using `view.show()` or hidden using `view.hide()`:

```typescript
// Hide the view.
view.hide();

// Now show it again.
view.show();
```


### Spina.Collection

This is a generic implementation of `Spina.BaseCollection`. It can be
instantiated and used without subclassing.

For example:

```typescript
import { Collection } from '@beanbag/spina';

const myCollection = new Collection({
    model: MyModel,
});
```

If using TypeScript, you can constrain this to a model type:

```typescript
import { Collection } from '@beanbag/spina';

const myCollection = new Collection<MyModel>({
    model: MyModel,
});
```


### Spina.Router

This is a generic implementation of `Spina.BaseRouter`. It can be instantiated
and used without subclassing.

```typescript
import { Router } from '@beanbag/spina';

const myRouter = new Router(...);
```


## Defining Spina Subclasses

All subclasses in a Spina hierarchy must use the `@spina` decorator. This
sets up the class to be initialized correctly, and also provides a handful
of other benefits.

The following options can be passed to the `@spina` decorator:

* `automergeAttrs`
* `mixins`
* `name`
* `prototypeAttrs`
* `skipParentAutomergeAttrs`


### automergeAttrs

Spina classes can automatically merge in static attributes for key/value
objects into any subclasses. This is useful for things like `events` on views
or `defaults` on models, but may also be useful for your own classes.

This option is automatically inherited by all descendant classes.

For example:

```typescript
@spina({
    automergeAttrs: ['itemSerializers'],
});
class BaseSerializer extends BaseModel {
    static itemSerializers = {
        'string': StringSerializer,
        'int': IntSerializer,
    };
}


@spina
class MySerializer extends BaseSerializer {
    // This will automatically contain BaseSerializer.itemSerializer entries.
    static itemSerializers = {
        'date': DateSerializer,
    };
}
```


### mixins

This option makes it easy to mix in plain objects, prototypes, or ES6 classes
into your class.

For example:

```typescript
@spina({
    mixins: [
        // A class mixin.
        class {
            static mixedInAttr1 = 'attr1';
            mixedInFunc1() {
                return true;
            }
        },

        // A prototype mixin.
        Backbone.Model.extend({
            mixedInAttr2: 'attr2',
            mixedInFunc2: function() {
                return 'test';
            },
        }),

        // A simple object mixin.
        {
            mixedInAttr3: 'attr3',
            mixedInFunc3() {
                return 123;
            }
        },
    ]
})
class MyClass extends BaseModel {
    ...
}
```

This would be roughly equivalent to:

```typescript
@spina
class MyClass extends BaseModel {
    static mixedInAttr1 = 'attr1';

    mixedInFunc1() {
        return true;
    }

    mixedInFunc2() {
        return 'test';
    }

    mixedInFunc3() {
        return 123;
    }
}
MyClass.prototype.mixedInAttr2 = 'attr2';
MyClass.prototype.mixedInAttr3 = 'attr3';
```


### name

If you're dynamically creating classes, or have some special requirements, you
can use `name` to set the resulting name of your class. For example:

```typescript
const MyClass = spina({
    name: 'MyName',
}, class extends BaseModel {
    ...
});
```


### prototypeAttrs

ES6 classes don't have a way of defining attributes on the prototype. You can
only define instance variables or static variables.

Spina addresses this by letting you define static variables and promoting them
to the prototype. This allows them to be accessed using `this`.

Static methods can also be listed, and will work with `this`.

This option is automatically inherited by all descendant classes.

For example:

```typescript
@spina({
    prototypeAttrs: ['registrationID', 'category'],
})
class RegisteredModel extends BaseModel {
    static registrationID = null;
    static category = null;
    static options = {};

    initialize() {
        someRegistry.registerInstance({
            id: this.registrationID,
            category: this.category,
            options: _.result(this, 'options'),
        });
    }
}

@spina
class MyEntry extends RegisteredModel {
    static registrationID = 'my-id';
    static category = 'my-category';
    static options() {
        return generateCommonOptions();
    }
}
```


### skipParentAutomergeAttrs

`automergeAttrs` is a useful option, but sometimes you want to avoid merging
in some attributes.

`skipParentAutomergeAttrs` can be set to a list of attribute names (previously
defined in `automergeAttrs`) to skip. Or it can be set to `true` to skip all
attributes.

For example:

```typescript
@spina({
    automergeAttrs: ['itemSerializers'],
});
class BaseSerializer extends BaseModel {
    static itemSerializers = {
        'string': StringSerializer,
        'int': IntSerializer,
    };
}


@spina({
    skipParentAutomergeAttrs: ['itemSerializers'],
})
class MySerializer extends BaseSerializer {
    // This will only contain a 'date' key.
    static itemSerializers = {
        'date': DateSerializer,
    };
}
```


## Deep Diving into the Backbone Problems

### The ES6 Class Initialization Problem

There are trade-offs when using ES6 classes with Backbone classes. The
top-level Backbone classes (like `Backbone.Model`) want to help by controlling
initialization of your subclass for you, calling methods like `initialize()`
and getting data from attributes like `Model.defaults`.

But they can't do this when using ES6 classes.

When constructing an object using ES6 classes, your subclass's instance doesn't
really exist until the parent constructor finishes. This means that when
construction gets to the Backbone object, there's no way for it to look up any
attributes on your subclass.

To work around this, you have to implement every attribute as a method, which
is fine in ES6 class land. But that comes with its own trade-offs. Not to
mention, those functions still can't access attributes.

So, by no real fault of Backbone's, it's a mess to use ES6 classes with
Backbone objects. And we weren't satisfied by the workarounds. So we solved
it... with new workarounds.


### TypeScript + Backbone

Some wonderful volunteers have worked hard on adding TypeScript support for
Backbone. This is available in the
[@types/backbone](https://www.npmjs.com/package/@types/backbone) package.

Those types try to enforce the method-only approach to attributes when using
ES6 classes. We've solved that in Spina, meaning those workarounds were no
longer needed.

Spina bundles a fork of the Backbone types that restore attribute access,
and additional support such as custom view option types.

This support must be explicitly enabled, and is recommended if you're using
Spina with TypeScript.
