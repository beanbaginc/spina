# Spina Releases

## Spina 3.0 (18-February-2024)

Another major release, focusing on improvements and fixes to how classes are
constructed and managed, and how instance attributes are accessed.

* General:

   * Fixed inheriting `automergeAttrs` and `prototypeAttrs`.

     When support for `automergeAttrs` and `prototypeAttrs` were added, the
     intent was for these to be inherited in any subclasses, even if
     overridden. However, some logic issues prevented this from working
     correctly.

     Spina 3.0 addresses this issue, ensuring that these settings are always
     inherited by descendant classes.

   * Improved typing for class utility types.

     The (mostly internal) `SpinaClass` is now a generic `SpinaClass<T>`, which
     merges the Spina-specific attributes with the generic class type.

   * Updated `SpinaClass.extend()` to take optional arguments and Spina
     options.

     This method is used to subclass a Spina class as a more traditional
     Backbone prototype "subclass".

     Previously, this method required arguments to be passed, but now those
     arguments are optional.

     It does now take an optional extra argument for Spina options. This takes
     the same settings that the `@spina` decorator takes.

   * Fixed typing of `SpinaClass.__super__`.

     This is now typed to `any` instead of `object,` which avoids some outright
     errors.

   * Spina now provides a `Result<T>` type.

     This is used for attributes that may contain a value or a function
     returning the value.

* `Spina.BaseCollection`:

   * Added methods for accessing common attributes that may be set to a value
     or a function returning a value.

     This includes:

       * `getURL()` (accesses `url`).

     We recommend calling these instead of accessing the attributes directly.

* `Spina.BaseModel`:

   * Added methods for accessing common attributes that may be set to a value
     or a function returning a value.

     This includes:

       * `getDefaultAttrs()` (accesses `defaults`).
       * `getURL()` (accesses `url`).
       * `getURLRoot()` (accesses `urlRoot`).

     We recommend calling these instead of accessing the attributes directly.

* `Spina.BaseView`:

   * `onInitialRender()` and `onRender()` are now `protected` instead of
     `public`.

     This will require updates to any subclasses.

   * `render()` now emits a `rendering` event before rendering takes place,
     and a `rendered` event after rendering takes place.

     Each event provides an object argument with an `initialRendered: boolean`
     attribute.

   * Fixed the `rendered` flag being set too early in `render()`.

     Previously, this was set after `onInitialRender()` was called. Now, it's
     set after `onRender()` is called, but before the `rendered` event is
     triggered.

   * Added methods for accessing common attributes that may be set to a value
     or a function returning a value.

     This includes:

       * `getAttributes()` (accesses `attributes`).
       * `getClassName()` (accesses `className`).
       * `getID()` (accesses `id`).
       * `getTagName()` (accesses `tagName`).

     We recommend calling these instead of accessing the attributes directly.


## Spina 2.0 (26-March-2023)

This is a major release, which breaks compatibility with Spina 1. The breakages
are necessary to allow for better inheritance and to enable new options.

* All classes:

   * Added support for calling `.extend()` on any Spina class to generate
     a subclass using a prototype definition.

     `.extend()` is used by Backbone classes to create subclasses. You can now
     safely use this with any Spina base class, making it easier to start
     converting more code from Backbone to Spina without doing it all at once.

   * Many attributes and methods are now expected to be `static` instead of
     being constructed as instance attributes.

     Details on affected attributes are covered below.

* `Spina.BaseCollection`:

   * `model` and `url` attributes must now be provided as `static`.

   * `url` can now be defined as a `static` method, for returning a dynamic
     URL.

   * For TypeScript, the generic parameters for `BaseCollection<...>` now
     take an optional `TExtraCollectionOptions`, which can be used to provide
     an interface for custom options passed when constructing an instance.

   * Fixed the typing for `BaseCollection.model` to properly handle subclasses
     of a model, and to default to `Backbone.Model` instead of
     `Spina.BaseModel` for wider compatibility.

* `Spina.BaseModel`:

   * `defaults`, `idAttribute`, and `urlRoot` attributes must now be provided
     as `static`.

   * `defaults` and `urlRoot` can now be defined as `static` methods, for
     returning dynamic results.

   * Subclasses of a model will automatically merge in the contents of the
     parent's `defaults`, removing the need to use `_.defaults()` or
     `_.extends()`.

   * Added a `ModelAttributes` type for TypeScript, used for `defaults`.

* `Spina.BaseRouter`:

    * The `routes` attribute must now be provided as `static`.

    * `routes` can now be defined as a `static` method, for returning dynamic
      routes.

    * For TypeScript, the generic parameters for `BaseRouter` now takes an
      optional `TExtraRouterOptions`, which can be used to provide an
      interface for custom options passed when constructing an instance.

* `Spina.BaseView`:

   * `attributes`, `className`, `events`, `id`, `modelEvents`, and `tagName`
     attributes must now be provided as `static`.

   * `attributes`, `className`, `events`, `id`, `modelEvents`, and `tagName`
     attributes can now be defined as `static` methods, for returning
     dynamic results.

   * Subclasses of a view will automatically merge in the contents of the
     parent's `attributes`, `events`, and `modelEvents`, removing the need to
     use `_.defaults()` or `_.extends()`.

   * Added an `ElementAttributes` type for TypeScript, used for `attributes`.

   * Added an `EventHash` type for TypeScript, used for `events` and
     `modelEvents`.

* `spinaBaseClassExtends()` and `@spina`:

    * Instances of Spina classes are now constructed as instances of the
      `@spina`-generated wrapper class, rather than the decorated class.

      This allows `instanceof` to work, and solves a variety of problems when
      spying for unit tests or otherwise working with an instance's prototype.

    * Added new options:

       * `automergeAttrs` specifies key/value hash `static` attributes that
         should be automatically merged when subclassing. This propagates to
         subclasses.

       * `skipParentAutomergeAttrs` specifies key/value hash `static`
         attributes that should *not* be automatically merged when subclassing.

       * `prototypeAttrs` specifies `static` attributes/methods that should be
         set on the prototype. This propagates to subclasses.

    * The `mixins` option now supports mixing in `static` attributes, and
      plain (non-class/prototype) objects.

    * The `name` option is now supported in `@spina`. This is useful when
      decorating anonymous classes.

    * Made several improvements for properly typing Spina subclasses in
      TypeScript.


## Spina 1.0.5 (9-March-2023)

* Fixed `BaseView.renderInto()` to properly call the `render()` method.


## Spina 1.0.4 (30-January-2023)

* Fixed a casing issue with the `backbone` module, causing problems bundling
  Spina along with Backbone.


## Spina 1.0.3 (26-January-2023)

* Fixed a problem with building custom Spina builds.

* Fixed ``Spina.BaseView`` to let you pass in custom view option types as
  a generic.

* Fixed a typo in ``Spina.BaseView``. The ``onInitialRender()`` method was
  accidentally named ``onInitialtRender()``.


## Spina 1.0.2 (23-January-2023)

* The generated bundle no longer hard-codes ``Backbone``, ``_``, or ``$``
  references.

  These are now provided in the UMD.


## Spina 1.0.1 (20-January-2023)

* Fixed an error bundling the forked Backbone types.


## Spina 1.0 (20-January-2023)

* Initial release
