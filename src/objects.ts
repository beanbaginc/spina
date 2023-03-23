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
    initObject(...args: any[]): void;
    prototype: object;

    readonly __spinaObjectID: number;
}


/**
 * Options available when subclassing another Spina class.
 *
 * Version Added:
 *     2.0
 */
export interface SubclassOptions {
    /**
     * A list of mixins to apply to the subclass.
     */
    mixins?: any[];

    /**
     * An explicit name for the subclass.
     */
    name?: string;
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
 */
export type Class = new (...args: any[]) => {};


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
 */
function _prepareSubclass(
    cls: PartialSpinaClass,
    options: SubclassOptions,
) {
    if (options.mixins) {
        /** Apply any mixins to the subclass. */
        applyMixins(cls, options.mixins);
    }
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
 *    class MyBaseClass extends spinaBaseClass(Object) {
 *        ...
 *    }
 *
 *    // or
 *
 *    class MyBaseClass extends spinaBaseClass(SomeLibrary.BaseClass) {
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
                        `spinaSubclass() or @spinaSubclass.`
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

    _prepareSubclass(BaseClass, options);

    const cls = {[name]: class extends BaseClass {
        /*
         * We set both of these because sometimes we need to check an
         * instance, and sometimes we need to check a prototype. We don't
         * always have access to both, and we can't have a TypeScript
         * interface governing static attributes.
         */
        static readonly __spinaObjectID = classID;
        readonly __spinaObjectID = classID;

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
            if (new.target === cls) {
                /*
                 * We're constructing the desired object. Return an instance
                 * of the actual class, rather than this intermediary class.
                 */
                const obj = new BaseClass(_constructing,
                                          ...args) as SpinaClass;

                if (obj.initObject) {
                    obj.initObject(...args);
                }

                return obj;
            } else if (args[0] !== _constructing &&
                       new.target.__spinaObjectID === classID) {
                throw TypeError(
                    `Failed to instantiate ${name} subclass ` +
                    `(${new.target.name}). It was not set up with ` +
                    `spinaSubclass() or @spinaSubclass.`
                );
            }

            super(_constructing);
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
 * Args:
 *     target (function):
 *         The target class to mix the mixins into.
 *
 *     mixins (Array of function):
 *         The array of mixins to mix into the target.
 */
export function applyMixins(
    target: PartialSpinaClass,
    mixins: Class[],
) {
    const targetProto = target.prototype;

    mixins.forEach(mixin => {
        const mixinProto = mixin.prototype;

        Object.getOwnPropertyNames(mixin.prototype).forEach(name => {
            Object.defineProperty(
                targetProto,
                name,
                Object.getOwnPropertyDescriptor(mixinProto, name) || {});
        });
    });
}


/** Simple alias for defining subclasses. */
export const spina = spinaSubclass;
