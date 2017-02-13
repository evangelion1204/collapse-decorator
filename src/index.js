export function SimpleCollapse(target, name, descriptor) {
    assertUsage(target, name, descriptor);

    const decoratedMethod = descriptor.value;
    let pendingPromise = null;

    descriptor.value = function (...args) {
        const functionArguments = args;

        if (!pendingPromise) {
            pendingPromise = decoratedMethod.apply(this, functionArguments)
                .then(result => {
                    pendingPromise = null;

                    return result;
                });

            return pendingPromise;
        }

        return pendingPromise;
    };
}

export function CollapseByParams(hashFunc = defaultHashFunction) {
    return function (target, name, descriptor) {
        assertUsage(target, name, descriptor);

        const decoratedMethod = descriptor.value;
        const pendingPromises = new WeakMap();

        descriptor.value = function (...args) {
            const functionArguments = args;
            const hash = hashFunc.apply(this, args);

            if (!pendingPromises[hash]) {
                pendingPromises[hash] = decoratedMethod.apply(this, functionArguments)
                    .then(result => {
                        pendingPromises[hash] = null;

                        return result;
                    });

                return pendingPromises[hash];
            }

            return pendingPromises[hash];
        };
    };
}

export function Collapse(timeout = 1000, hashFunc = defaultHashFunction) {
    return function (target, name, descriptor) {
        assertUsage(target, name, descriptor);

        const decoratedMethod = descriptor.value;
        const pendingPromises = new WeakMap();

        descriptor.value = function (...args) {
            const functionArguments = args;
            const hash = hashFunc.apply(this, args);

            if (!pendingPromises[hash]) {
                const pendingTimeout = setTimeout(() => {
                    pendingPromises[hash] = null;
                }, timeout);

                pendingPromises[hash] = decoratedMethod.apply(this, functionArguments)
                    .then(result => {
                        pendingPromises[hash] = null;
                        clearTimeout(pendingTimeout);

                        return result;
                    });


                return pendingPromises[hash];
            }

            return pendingPromises[hash];
        };
    };
}

export function defaultHashFunction(...args) {
    return args.join('|');
}

function assertUsage(target, name, descriptor) {
    if (typeof target === 'function') {
        throw new Error('Decorator can only be applied to functions');
    }

    if (typeof descriptor.value !== 'function') {
        throw new Error('Decorator can only be applied to functions');
    }
}
