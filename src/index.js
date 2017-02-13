export function SimpleCollapse(target, name, descriptor) {
    const decoratedMethod = descriptor.value;
    let pendingPromise = null;

    descriptor.value = function (...args) {
        const functionArguments = args;

        if (!pendingPromise) {
            pendingPromise = decoratedMethod.apply(this, functionArguments)
                .then(result => {
                    return new Promise(resolve => {
                        pendingPromise = null;
                        resolve(result);
                    });
                });

            return pendingPromise;
        }

        return pendingPromise;
    };
}

export function CollapseByParams(hashFunc = defaultHashFunction) {
    return function (target, name, descriptor) {
        const decoratedMethod = descriptor.value;
        const pendingPromises = new WeakMap();

        descriptor.value = function (...args) {
            const functionArguments = args;
            const hash = hashFunc.apply(this, args);

            if (!pendingPromises[hash]) {
                pendingPromises[hash] = decoratedMethod.apply(this, functionArguments)
                    .then(result => {
                        return new Promise(resolve => {
                            pendingPromises[hash] = null;
                            resolve(result);
                        });
                    });

                return pendingPromises[hash];
            }

            return pendingPromises[hash];
        };
    };
}

export function Collapse(timeout = 1000, hashFunc = defaultHashFunction) {
    return function (target, name, descriptor) {
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
                        return new Promise(resolve => {
                            pendingPromises[hash] = null;
                            clearTimeout(pendingTimeout);
                            resolve(result);
                        });
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
