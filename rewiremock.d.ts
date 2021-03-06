declare module 'rewiremock' {

    type Plugin = any;
    type PluginNames =  'childOnly' | 'nodejs' | 'protectNodeModules' | 'relative' | 'webpackAlias' | 'toBeUsed' | 'disabledByDefault' | 'mockThoughByDefault' | 'usedByDefault' | 'alwaysMatchOrigin' | 'directChild';
    type Plugins = {
        [Key in PluginNames]: any
        };

    interface OverloadedModule {
        name: String,
        fileName: String,
        parent: Object,
        original: Object,
        requireActual: Function
    }

    type IStubFactory = (name: string, value: any) => any;

    interface BaseMock {
        /**
         * Enabled call thought original module, making all the original methods accessible.
         * @example
         * mock.callThrough();
         */
        callThrough(): this,

        /**
         * Mimic the original file, replacing all the original methods by mocks.
         * @param {IStubFactory} [stubFactory] - stub factory function
         * @example
         * mock.mockThrough();
         * mock.mockThrough( () => sinon.stub() );
         * mock.mockThrough( (name, value) => typeof value === 'function' ? sinon.stub() : value );
         */
        mockThrough(stubFactory?: IStubFactory): this,

        /**
         * Setting es6 behaviour for a module
         */
        es6(): this,

        /**
         * Overriding export of one module by another
         * @example
         * mock.by('otherModuleName');
         */
        by(module: string): BaseMock,

        /**
         * Overriding export of one module by something generated by a function
         * @example
         * mock.by( originalModule => cache || cache = originalModule.requireActual('./nestedDep'));
         */
        by(module: (module: OverloadedModule) => Object): BaseMock,

        enable(): this,

        disable(): this,

        /**
         * will mock this only first (directly nested) children.
         */
        directChildOnly(): this;

        /**
         * will mocks this regardless of position
         */
        atAnyPlace(): this;

        /**
         * mocks only if parent were mocked
         */
        calledFromMock(): this;

        calledFromAnywhere(): this;

        /**
         * Force mock to be used, or throw an error otherwise
         */
        toBeUsed(): this,

        notToBeUsed(): this,

        /**
         * checks mocks agains implementation
         * @return {this}
         */
        toMatchOrigin(): this
    }

    interface NamedModuleMock<T> extends BaseMock {
        /**
         * Overriding export of a module
         */
        with(keys: {[P in keyof T]?: T[P]}): this;

        /**
         * Washes away the types
         */
        nonStrict(): AnyModuleMock;
    }

    interface HasDefault {
        default: any
    }

    interface DefaultModuleMock<T extends HasDefault> extends NamedModuleMock<T> {
        /**
         * Setting es6 behavior for a current module and overriding default export
         */
        withDefault<Ts extends {[K in keyof Ts]: Ts[K]} & T>(fn: Ts['default']): this;
    }

    interface AnyModuleMock {
        /**
         * Setting es6 behavior for a current module and overriding default export
         */
        withDefault(stubs: any): this;

        /**
         * Overriding export of a module
         */
        with(stubs: any): this;
    }

    type ModuleMock = AnyModuleMock;
    type ProxyFunction = (r: ModuleMock) => Object;
    type RequireFunction<T> = () => T;
    type ImportFunction<T> = () => Promise<T>;
    type AnyImportFunction<T> = RequireFunction<T> | ImportFunction<T>;

    /**
     * @name rewiremock
     * @class
     * Proxies imports/require in order to allow overriding dependencies during testing.
     */
    interface rewiremock {
        (module: string): ModuleMock;

        <T extends HasDefault>(module: ImportFunction<T>): DefaultModuleMock<T>
        <T>(module: ImportFunction<T>): NamedModuleMock<T>

        /**
         * returns existing mock
         * @return {"rewiremock".ModuleMock}
         */
        getMock(module: string): ModuleMock;
        getMock<T extends HasDefault>(module: ImportFunction<T>): DefaultModuleMock<T>
        getMock<T>(module: ImportFunction<T>): NamedModuleMock<T>

        enable(): rewiremock;

        disable(): rewiremock;

        /**
         * executes module in a sandbox
         * @param {Function} loader - loader of target module. You can use import or require. May return a Promise
         * @param {Function} [creator] - mock creator. You may add any mocks inside.
         */
        around<T>(loader: AnyImportFunction<T>, creator?: (r: rewiremock) => any): Promise<T>;

        inScope(callback: Function): rewiremock;

        /**
         * Loads a file and hooks deps in a `proxyquire` way
         * @param {String|Function} fileName
         * @param {Object|Function} overrides, with key==filename, and value==data
         */
        proxy<T>(fileName: String | RequireFunction<T>, overrides?: Object | ProxyFunction): T;

        /**
         * Loads a file and hooks deps in a `proxyquire` way
         * @param {Function} fileLoader. Require or Import desired module
         * @param {Object} overrides, with key==filename, and value==data
         */
        module<T>(fileLoader: ImportFunction<T>, overrides?: Object | ProxyFunction): Promise<T>;

        flush(): void;

        clear(): void;

        /**
         * Define stub factory for mockThrough command
         * @param {IStubFactory} stubFactory
         */
        stubFactory(stubFactory: IStubFactory): void;

        /**
         * converts module name
         * @param module
         */
        resolve(module: string): string,

        /**
         * Activates module isolation
         * @param {Boolean} [options.noAutoPassBy] auto-includes mocked modules passBy list.
         */
        isolation(options?: Object): rewiremock;

        /**
         * Deactivates isolation
         */
        withoutIsolation(): rewiremock;

        /**
         * set aggressive politics to cache operation, restoring to the the previous values on end.
         */
        forceCacheClear(): rewiremock;

        /**
         * Adding new isolationpassby record
         */
        passBy(pattern: any): rewiremock;

        /**
         * Adds a plugin
         */
        addPlugin(plugin: any): rewiremock;

        /**
         * low-level require
         */
        requireActual(fileName: string): any;

        /**
         * low-level import
         */
        importActual(fileName: string): any;

        /**
         * low-level API override
         */
        overrideEntryPoint(module:any): void;
    }


    var rewiremockdefault: rewiremock;
    export default rewiremockdefault;
    export function addPlugin(plugin:Plugin):void;
    export function removePlugins(plugin:Plugin):void;
    export function overrideEntryPoint(module:any):void;
    export var plugins: Plugins;
}