# Spina releases

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
