import * as _ from 'underscore';


/* Internal symbol used to flag a deferred construction path. */
const _constructing = Symbol();


/*
 * Internal state to keep track of the number of classes.
 *
 * These work as IDs, helping to efficiently perform checks during object
 * construction.
 */
let _spinaClassCount: number = 0;


/**
 * Interface for a Spina base class or subclass.
 *
 * This is used to help identify classes for use in :js:func:`spinaBaseClass`
 * and :js:func`spinaSubclass`.
 */
export interface SpinaClass {
    initObject: InitObjectFunc;
    prototype: object;
    __spinaOptions: SubclassOptions;

    readonly __spinaObjectID: number;
    readonly __super__: SpinaClass;
}


/**
 * Options available when subclassing another Spina class.
 *
 * Version Added:
 *     2.0
 */
export interface SubclassOptions {
    /**
     * A list of static object attributes to auto-merge.
     *
     * If both a subclass and a parent class define any of these attributes,
     * their contents will be merged together (prioritizing the subclass's
     * values) and stored on the subclass.
     *
     * This is used to make it easy to merge attributes like
     * `BaseView.events` or `BaseModel.defaults`.
     *
     * If both a parent class and a subclass provide attributes, then the
     * union of all attributes will be applied to the subclass.
     *
     * Attributes from the parent class can be skipped by setting
     * ``skipParentAutoMergeAttrs``.
     */
    automergeAttrs?: string[];

    /**
     * Auto-merged attributes on the parent to avoid merging.
     *
     * This is defined by a subclass when it wants to avoid merging in any
     * content from a parent class's attributes into its own. They will be
     * excluded from subclasses as well.
     *
     * Either a list of explicit attribute names can be provided, or ``true``
     * to skip all attributes from the parent.
     */
    skipParentAutomergeAttrs?: string[] | boolean;

    /**
     * A list of mixins to apply to the subclass.
     */
    mixins?: Mixin[];

    /**
     * An explicit name for the subclass.
     */
    name?: string;

    /**
     * A list of static attributes to copy to the prototype.
     *
     * This can make certain attributes available to instances using ``this``
     * or to code operating on a prototype.
     *
     * This is intended for providing backwards-compatibility with existing
     * code that expects to be able to find the attributes in either place.
     * New code should always strive to use the static attributes directly.
     */
    prototypeAttrs?: string[];
}


/**
 * Options available when defining an extended base class.
 *
 * This includes all attributes in :js:class:`SubclassOptions`, as well as
 * explicit base class options.
 *
 * Version Added:
 *     2.0
 */
export interface BaseClassExtendsOptions extends SubclassOptions {
    /**
     * A constructor function for initializing subclasses.
     */
    initObject?: InitObjectFunc,
}


/**
 * Results from a subclass preparation operation.
 *
 * Version Added:
 *     2.0
 */
interface SubclassPrepInfo {
    /**
     * The parent prototype for a subclass.
     */
    parentProto: object;
}


/**
 * An alias for a partial (in-progress) SpinaClass.
 *
 * Version Added:
 *     2.0
 */
type PartialSpinaClass = Partial<SpinaClass>;


/**
 * Type for a function used to initialize a Spina object.
 */
type InitObjectFunc = (...args: any[]) => void;


/**
 * Type for a constructor for a class.
 *
 * Version Changed:
 *     2.0:
 *     Made the class optionally generic.
 */
export type Class<T = {}> = new (...args: any[]) => T;


/**
 * Type for a valid mixin.
 *
 * Version Added:
 *     2.0
 */
export type Mixin = Class | object;


/**
 * Auto-merge an attribute between a parent class and subclass.
 *
 * If the attribute in both cases exists and is an object, the contents will
 * be merged together and set on the subclass.
 *
 * Version Added:
 *     2.0
 *
 * Args:
 *     cls (function):
 *         The subclass constructor.
 *
 *     clsProto (object):
 *         The subclass prototype.
 *
 *     parentProto (object):
 *         The parent class prototype.
 *
 *     attr (string):
 *         The attribute name to auto-merge.
 *
 * Returns:
 *     boolean:
 *     ``true`` if an attribute was auto-merged. ``false`` if it was not.
 */
function _automergeAttr(
    cls: PartialSpinaClass,
    clsProto: object,
    parentProto: SpinaClass,
    attr: string,
): boolean {
    const clsValue = cls[attr] ?? clsProto[attr];

    if (_.isObject(clsValue) && _.isObject(parentProto[attr])) {
        cls[attr] = _.defaults(clsValue, parentProto[attr]);

        return true;
    }

    return false;
}


/**
 * Copy a static attribute to a class's prototype.
 *
 * Version Added:
 *     2.0
 *
 * Args:
 *     cls (function):
 *         The subclass constructor.
 *
 *     clsProto (object):
 *         The subclass prototype.
 *
 *     attr (string):
 *         The static attribute name to copy.
 *
 * Returns:
 *     boolean:
 *     ``true`` if an attribute was copied. ``false`` if it was not.
 */
function _copyPrototypeAttr(
    cls: object,
    clsProto: object,
    attr: string,
): boolean {
    if (!clsProto.hasOwnProperty(attr) && cls.hasOwnProperty(attr)) {
        clsProto[attr] = cls[attr];

        return true;
    }

    return false;
}


/**
 * Prepare a subclass's options and state.
 *
 * This is used when defining base classes or subclasses. It takes in any
 * options provided when applying a decorator and updated the state on the
 * resulting class accordingly.
 *
 * Version Added:
 *     2.0
 *
 * Args:
 *     cls (function):
 *         The constructor for the subclass being prepared.
 *
 *     options (object):
 *         The options for the preparation. See :js:class:`SubclassOptions`.
 *
 * Returns:
 *     object:
 *     Information available to the caller. See :js:class:`SubclassPrepInfo`.
 */
function _prepareSubclass(
    cls: PartialSpinaClass,
    options: SubclassOptions,
): SubclassPrepInfo {
    const parentProto = Object.getPrototypeOf(cls);
    const parentOptions: SubclassOptions = parentProto.__spinaOptions || {};
    const clsProto = cls.prototype;
    const mergeOptions: SubclassOptions = {};

    /*
     * For any auto-extended static attributes set on both the parent class
     * and the decorated class, apply a `_.defaults(...)` to the attributes.
     */
    if (options.automergeAttrs || parentOptions.automergeAttrs) {
        /*
         * Go through all auto-extended object attributes of a parent class.
         * Unless skipped by the subclass, merge the parent and subclass's
         * values into the subclass.
         *
         * This is used to make it easy to merge attributes like
         * `BaseView.events` or `BaseModel.defaults`.
         */
        const seenParentAttrs: string[] = [];
        const seenClassAttrs: string[] = [];
        const seen = {};
        const skipped = {};
        let skipAll = false;

        if (options.skipParentAutomergeAttrs === true) {
            skipAll = true;
        } else if (_.isArray(options.skipParentAutomergeAttrs)) {
            for (const attr of options.skipParentAutomergeAttrs) {
                skipped[attr] = true;
            }
        }

        /*
         * We're duplicating some work here between both loops, but since this
         * is all about initialization of the app (we have to invoke this for
         * each subclass), we should avoid unwanted loops.
         *
         * So it's intentional that we're not just building up a list of
         * attributes up-front and doing this in one go.
         *
         * In practice, in most cases, we'll never be working with both
         * sets of options, so we will only need to loop once.
         */
        if (!skipAll && parentOptions.automergeAttrs) {
            for (const attr of parentOptions.automergeAttrs) {
                if (!skipped[attr] &&
                    _automergeAttr(cls, clsProto, parentProto, attr)) {
                    /* The attribute has been merged. */
                    seenParentAttrs.push(attr);
                    seen[attr] = true;
                }
            }
        }

        if (options.automergeAttrs) {
            for (const attr of options.automergeAttrs) {
                if (!seen[attr] &&
                    _automergeAttr(cls, clsProto, parentProto, attr)) {
                    /* The attribute has been merged. */
                    seenClassAttrs.push(attr);
                }
            }

            if (seenParentAttrs.length > 0 && seenClassAttrs.length > 0) {
                /*
                 * We combined the attributes on both. Store the new list for
                 * subclasses.
                 *
                 * Note that we're only here if both the parent and subclass
                 * both define options.
                 */
                mergeOptions.automergeAttrs =
                    seenParentAttrs.concat(seenClassAttrs);
            }
        }
    }

    if (options.prototypeAttrs || parentOptions.prototypeAttrs) {
        /*
         * Copy any static attributes requested to be added to the prototype
         * on either the parent class or subclass.
         *
         * If there are attributes on both, we need to ensure we only copy
         * them once. The final list of attributes will be set on the
         * subclass's stored list of options, for use by any subclasses of
         * the subclass.
         */
        const seenParentAttrs: string[] = [];
        const seenClassAttrs: string[] = [];
        const seen = {};

        if (parentOptions.prototypeAttrs) {
            for (const attr of parentOptions.prototypeAttrs) {
                if (_copyPrototypeAttr(cls, clsProto, attr)) {
                    /* The attribute has been copied. */
                    seen[attr] = true;
                    seenParentAttrs.push(attr);
                }
            }
        }

        if (options.prototypeAttrs) {
            for (const attr of options.prototypeAttrs) {
                if (!seen[attr] && _copyPrototypeAttr(cls, clsProto, attr)) {
                    /* The attribute has been copied. */
                    clsProto[attr] = cls[attr];
                    seenClassAttrs.push(attr);
                }
            }

            if (seenParentAttrs.length > 0 && seenClassAttrs.length > 0) {
                /*
                 * We combined the attributes on both. Store the new list for
                 * subclasses.
                 *
                 * Note that we're only here if both the parent and subclass
                 * both define options.
                 */
                mergeOptions.prototypeAttrs =
                    seenParentAttrs.concat(seenClassAttrs);
            }
        }
    }

    if (options.mixins) {
        /** Apply any mixins to the subclass. */
        applyMixins(cls, options.mixins);
    }

    if (options && parentOptions) {
        /*
         * Merge in any parent options, so they'll apply to subclasses.
         */
        cls.__spinaOptions = _.defaults(mergeOptions, options, parentOptions);
    } else if (parentOptions) {
        /*
         * Just reference the parent options, saving memory. This is likely
         * to be the common case.
         */
        cls.__spinaOptions = parentOptions;
    } else {
        /*
         * Just reference the options (even if empty), saving memory. We
         * won't have mergeOptions, since we had nothing above to merge
         * together.
         */
        cls.__spinaOptions = options;
    }

    return {
        parentProto: parentProto,
    };
}


/*
 * Define an intermediary base class that a Spina base class can extend from.
 *
 * This base class will sit in-between a defined class and a parent base class
 * (such as :js:class:`Backbone.Model`). It will contain special constructor
 * logic for managing Spina deferred object initialization, and contain any
 * mixins needed.
 *
 * This is used like:
 *
 * .. code-block:: javascript
 *
 *    class MyBaseClass extends spinaBaseClassExtends(Object) {
 *        ...
 *    }
 *
 *    // or
 *
 *    class MyBaseClass extends spinaBaseClassExtends(SomeLibrary.BaseClass) {
 *        ...
 *    }
 *
 * Resulting in a hierarchy like ``MyBaseClass -> <intermediary> -> Object``.
 *
 * The intermediary base class provides an ``initObject()`` method that
 * handles the object initialization, which will be invoked by a subclass
 * (in cooperation with :js:func:`spinaSubclass`) to perform any
 * initialization required.
 *
 * If making a base class off of a prototype-based class, ``initObject()``
 * will default to invoking the constructor.
 *
 * If making a base class off a ES6 class, then either an explicit
 * ``options.initObject`` is required or the class being defined must provide
 * an explicit :js:func`initObject` method. These are required since ES6
 * class constructors can't be invoked manually.
 *
 * The base class being defined can't be instantiated directly, and will
 * raise a :js:class:`TypeError` if attempted. It must be subclassed, and the
 * subclass must be decorated by :js:func:`spinaSubclass`.
 *
 * Version Changed:
 *     2.0:
 *     * Added a whole new set of options for controlling class and subclass
 *       construction. See :js:class:`BaseClassExtendsOptions`.
 *
 *     * Added a built-in ``extend()`` method for base classes, which can be
 *       used to allow prototype-based classes to inherit from Spina classes.
 *
 * Args:
 *     BaseClass (function):
 *         The constructor for the base class.
 *
 *     options (object, optional):
 *         Options used to control the setup of the base class.
 *
 *         See :js:class:`BaseClassExtendsOptions`.
 *
 * Returns:
 *     function:
 *     A constructor for a new Spina base class inheriting from the provided
 *     base class.
 */
export function spinaBaseClassExtends<TBase extends Class>(
    BaseClass: TBase,
    options: BaseClassExtendsOptions = {},
): TBase & SpinaClass {
    /* Use a heuristic to guess if this is a ES6 class or a prototype. */
    const props = Object.getOwnPropertyDescriptor(BaseClass, 'prototype');
    const isClass = !props.writable;

    const classID = ++_spinaClassCount;

    /* NOTE: We use ['name'] syntax to help satisfy TypeScript and ESLint. */
    const name = options.name ||
                 BaseClass['name'] ||
                 `_SpinaBaseClass${classID}`;
    const initObject: InitObjectFunc = (
        options.initObject ||
        BaseClass.prototype.initObject ||
        (isClass
         ? function() {}
         : BaseClass)
    );

    /* Construct the new intermediary base class. */
    const cls = {[name]: class extends BaseClass implements PartialSpinaClass {
        /*
         * We set both of these because sometimes we need to check an
         * instance, and sometimes we need to check a prototype. We don't
         * always have access to both, and we can't have a TypeScript
         * interface governing static attributes.
         */
        static readonly __spinaObjectID = classID;
        readonly __spinaObjectID = classID;

        /**
         * Create a prototype-based subclass of a base class.
         *
         * This can be used to allow existing prototype-based code to inherit
         * from a Spina class (either a base class or a subclass).
         *
         * It acts as a replacement for Backbone's ``.extend()`` methods, and
         * allows codebases to transition base classes to ES6 classes without
         * having to break compatibility with prototype-based subclsases.
         *
         * Version Added:
         *     2.0
         *
         * Args:
         *     protoProps (object):
         *         Properties to apply to the prototype.
         *
         *     staticProps (object):
         *         Static properties to apply to the constructor function
         *         itself.
         *
         * Returns:
         *     function:
         *     The constructor for the resulting prototype-based subclass.
         */
        static extend(
            protoProps,
            staticProps,
        ) {
            const parentClass = this as unknown as (Class & SpinaClass);

            const cls = class extends parentClass {
            };

            if (protoProps) {
                Object.assign(cls.prototype, protoProps);
            }

            if (staticProps) {
                Object.assign(cls, staticProps);
            }

            return spinaSubclass(cls);
        }

        /**
         * Construct the object.
         *
         * For the base class, if in constructing mode, this will return a
         * new prototype for the instantiated object, bypassing any further
         * constructors.
         *
         * If not in constructing mode (the base class was constructed
         * manually or through a non-Spina subclass), this will raise an
         * exception.
         *
         * Args:
         *     ...args (Array):
         *         Any arguments passed to the constructor.
         *
         *         This will be used to check if we're in Spina constructing
         *         mode.
         *
         * Returns:
         *     object:
         *     The prototype for the instantiated object.
         *
         * Raises:
         *     TypeError:
         *         This base class is being constructed manually, or the
         *         subclass being constructed is not set up as a Spina object
         *         subclass.
         */
        constructor(...args) {
            if (args[0] === _constructing) {
                /*
                 * Skip calling super() and instead create the target object
                 * being instantiated.
                 *
                 * We want to do this at this point, all the way down the
                 * constructor stack so that all constructors can properly
                 * set things up.
                 */
                if (new.target.prototype.__spinaObjectID === classID) {
                    throw TypeError(
                        `Failed to instantiate ${name} subclass ` +
                        `(${new.target.name}). It was not set up with ` +
                        `spinaSubclass() or @spina.`
                    );
                }

                return Object.create(new.target.prototype);
            } else {
                throw TypeError(
                    `${name} is abstract and cannot be instantiated directly.`
                );
            }

            /* Satisfy lint checks. This never actually gets executed. */
            super();
        }

        /**
         * Initialize the object.
         *
         * This will be called on the object once the constructor chain has
         * finished. All provided arguments will be passed.
         *
         * Args:
         *     ...args (Array):
         *         Any arguments passed to the constructor.
         */
        initObject(...args: any[]) {
            initObject.apply(this, args);
        }
    }}[name] as unknown as TBase & SpinaClass;

    _prepareSubclass(cls, options);

    return cls;
}


/*
 * Internal function to set up a subclass of a Spina class.
 *
 * This must be used for any classes derived from a base class that uses
 * :js:func:`spinaBaseClassExtends`. It will ensure that object
 * initialization only happens once the entire constructor chain has finished.
 *
 * The result is an intermediary class that has custom constructor logic,
 * but otherwise behaves like the wrapped argument.
 *
 * Version Added:
 *     2.0:
 *     Separated out the main logic from :js:func:`spinaSubclass`, and made
 *     the following improvements:
 *
 *     * Added options for controlling subclass construction.
 *       See :js:class:`SubclassOptions`.
 *
 *     * Added a built-in ``extend()`` method for subclasses, which can be
 *       used to allow prototype-based classes to inherit from Spina classes.
 *
 *     * Instances of the subclass are now the wrapper class, rather than
 *       the wrapped class.
 *
 * Args:
 *     BaseClass (function):
 *         The constructor for the base class.
 *
 *     options (object, optional):
 *         Options used to control the setup of the subclass.
 *
 *         See :js:class:`SubclassOptions`.
 *
 * Returns:
 *     function:
 *     A constructor for a new Spina subclass inheriting from a provided
 *     Spina class.
 */
function _makeSpinaSubclass<TBase extends Class & SpinaClass>(
    BaseClass: TBase,
    options: SubclassOptions = {},
): TBase & SpinaClass {
    console.assert(BaseClass.__spinaObjectID !== undefined);

    const classID = ++_spinaClassCount;
    let name = options.name;

    if (!name) {
        const clsName: string = BaseClass['name'] || `SpinaSubclass${classID}`;
        name = `_${clsName}_`;
    }

    const prepInfo = _prepareSubclass(BaseClass, options);
    const parentProto = prepInfo.parentProto;

    const cls = {[name]: class extends BaseClass {
        /*
         * We set both of these because sometimes we need to check an
         * instance, and sometimes we need to check a prototype. We don't
         * always have access to both, and we can't have a TypeScript
         * interface governing static attributes.
         */
        static readonly __spinaObjectID = classID;
        readonly __spinaObjectID = classID;

        /* This provides compatibility with Backbone's __super__. */
        __super__ = parentProto;

        /**
         * Construct the object.
         *
         * This is used for every Spina wrapper class up the constructor
         * chain. When run on the Spina wrapper for the class being
         * constructed, this will create a new instance of that object
         * (omitting the wrapper class) and then initialize it with the
         * ``initObject()`` method on the class.
         *
         * If this is run for a constructor further up the chain (between the
         * constructed class and the base class), it will do a sanity check
         * to make sure the object being constructed is in fact set up as a
         * Spina subclass, and then continue up the chain.
         *
         * Args:
         *     ...args (Array):
         *         Any arguments passed to the constructor.
         *
         *         This will be used to check if we're in Spina constructing
         *         mode. They'll also be passed to ``initObject()`` when
         *         returning a new instance.
         *
         * Returns:
         *     object:
         *     The instance of the class, if this is the constructor for the
         *     class being constructed.
         *
         * Raises:
         *     TypeError:
         *         A subclass of this was being constructed but wasn't set up
         *         as a Spina object.
         */
        constructor(...args) {
            if (args && args[0] === _constructing) {
                super(...args);
            } else {
                const target = new.target;

                if (target !== cls && target.__spinaObjectID === classID) {
                    throw TypeError(
                        `Failed to instantiate ${name} subclass ` +
                        `(${new.target.name}). It was not set up with ` +
                        `spinaSubclass() or @spina.`);
                }

                super(_constructing, ...args);

                /*
                 * NOTE: We need to reference initObject this way for typing,
                 *       since TypeScript doesn't know yet what this is.
                 */
                if (target === cls && this['initObject']) {
                    /*
                     * This is the object being created, and we're at the tail end
                     * of the constructor chain. We can now initialize the object
                     * state.
                     */
                    this['initObject'](...args);
                }
            }
        }
    }}[name] as unknown as TBase & SpinaClass;

    return cls;
}


/* Declared stubs for the different decorator invocations. */
export function spinaSubclass<TBase extends Class & SpinaClass>(
    BaseClass: TBase,
): TBase & SpinaClass;


export function spinaSubclass<TBase extends Class & SpinaClass>(
    options: SubclassOptions,
): (BaseClass: TBase & SpinaClass) => void;


/*
 * Decorator used to set up a subclass of a Spina class.
 *
 * This must be used for any classes derived from a base class that uses
 * :js:func:`spinaBaseClassExtends`. It will ensure that object
 * initialization only happens once the entire constructor chain has finished.
 *
 * The result is an intermediary class that has custom constructor logic,
 * but otherwise behaves like the wrapped argument.
 *
 * Version Changed:
 *     2.0
 *     * Added options for controlling subclass construction.
 *       See :js:class:`SubclassOptions`.
 *
 *     * Added a built-in ``extend()`` method for subclasses, which can be
 *       used to allow prototype-based classes to inherit from Spina classes.
 *
 *     * Instances of the subclass are now the wrapper class, rather than
 *       the wrapped class.
 *
 * Args:
 *     BaseClass (function):
 *         The constructor for the base class.
 *
 *     options (object, optional):
 *         Options used to control the setup of the subclass.
 *
 *         See :js:class:`SubclassOptions`.
 *
 * Returns:
 *     function:
 *     A constructor for a new Spina subclass inheriting from a provided
 *     Spina class.
 */
export function spinaSubclass<TBase extends Class & SpinaClass>(
    baseClassOrOptions: TBase | SubclassOptions,
) {
    if (typeof baseClassOrOptions === 'function') {
        /* This is a class. */
        return _makeSpinaSubclass(baseClassOrOptions);
    } else {
        /* These are options. */
        return function(BaseClass: TBase) {
            return _makeSpinaSubclass(BaseClass, baseClassOrOptions);
        }
    }
}


/**
 * Applies a mixin to a class/prototype.
 *
 * This will register everything in the provided mixins into the
 * target class/prototype.
 *
 * Version Changed:
 *     2.0:
 *     Added support for passing in plain objects to merge in.
 *
 * Args:
 *     target (function):
 *         The target class to mix the mixins into.
 *
 *     mixins (Array of function or Array of object):
 *         The array of mixins to mix into the target.
 */
export function applyMixins(
    target: PartialSpinaClass,
    mixins: Mixin[],
) {
    const targetProto = target.prototype;

    for (const mixin of mixins) {
        const mixinBody = mixin['prototype'] || mixin;

        for (const name of Object.getOwnPropertyNames(mixinBody)) {
            Object.defineProperty(
                targetProto,
                name,
                Object.getOwnPropertyDescriptor(mixinBody, name) || {});
        }
    }
}


/** Simple alias for defining subclasses. */
export const spina = spinaSubclass;
