const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

import { SimpleCollapse, CollapseByParams, Collapse, defaultHashFunction } from '../src';

chai.use(sinonChai);

class Mock {
    @SimpleCollapse
    withCollapse() {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method());
                },
                500
            );
        });

        return promise;
    }

    withoutCollapse() {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method());
                },
                500
            );
        });

        return promise;
    }

    method() {
        return 'ok';
    }
}

class MockWithParams {
    @CollapseByParams()
    withCollapse(arg1, arg2) {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method(arg1, arg2));
                },
                500
            );
        });

        return promise;
    }

    withoutCollapse(arg1, arg2) {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method(arg1, arg2));
                },
                500
            );
        });

        return promise;
    }

    method(arg1, arg2) {
        return `${arg1}-${arg2}`;
    }
}

class MockWithTimeout {
    @Collapse(750)
    withCollapse(timeout = 500) {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method(timeout));
                },
                timeout
            );
        });

        return promise;
    }

    withoutCollapse(timeout = 500) {
        const promise = new Promise((resolve) => {
            setTimeout(
                () => {
                    resolve(this.method(timeout));
                },
                timeout
            );
        });

        return promise;
    }

    method(timeout) {
        return timeout;
    }
}


describe('Decorators', () => {
    describe('SimpleCollapse', () => {
        it('should return the correct result', (done) => {
            const instance = new Mock();

            instance.withCollapse().then((value) => {
                expect(value).to.be.equal('ok');
                done();
            });
        });

        it('should not be collapsed multiple calls within the timeout', (done) => {
            const instance = new Mock();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withoutCollapse().then((value) => {
                        expect(value).to.be.equal('ok');
                    })
                );
            }

            promises.push(
                instance.withoutCollapse().then((value) => {
                    expect(value).to.be.equal('ok');
                    expect(instance.method).to.have.callCount(11);
                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls within the timeout', (done) => {
            const instance = new Mock();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse().then((value) => {
                        expect(value).to.be.equal('ok');
                    })
                );
            }

            promises.push(
                instance.withCollapse().then((value) => {
                    expect(value).to.be.equal('ok');
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls multiple times within the timeout', (done) => {
            const instance = new Mock();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse().then((value) => {
                        expect(value).to.be.equal('ok');
                    })
                );
            }

            promises.push(
                instance.withCollapse().then((value) => {
                    expect(value).to.be.equal('ok');
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                promises.length = 0;

                for (let i = 0; i < 20; i++) {
                    promises.push(
                        instance.withCollapse().then((value) => {
                            expect(value).to.be.equal('ok');
                        })
                    );
                }

                promises.push(
                    instance.withCollapse().then((value) => {
                        expect(value).to.be.equal('ok');
                        expect(instance.method).to.have.calledTwice;
                    })
                );

                Promise.all(promises).then(() => {
                    done();
                }).catch(done);
            }).catch(done);
        });
    });

    describe('CollapseByParams', () => {
        it('should return the correct result', (done) => {
            const instance = new MockWithParams();

            instance.withCollapse('hello', 'world').then((value) => {
                expect(value).to.be.equal('hello-world');
                done();
            });
        });

        it('should not be collapsed multiple calls within the timeout', (done) => {
            const instance = new MockWithParams();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withoutCollapse('hello', 'world').then((value) => {
                        expect(value).to.be.equal('hello-world');
                    })
                );
            }

            promises.push(
                instance.withoutCollapse('hello', 'world').then((value) => {
                    expect(value).to.be.equal('hello-world');
                    expect(instance.method).to.have.callCount(11);
                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls within the timeout', (done) => {
            const instance = new MockWithParams();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse('hello', 'world').then((value) => {
                        expect(value).to.be.equal('hello-world');
                    })
                );
            }

            promises.push(
                instance.withCollapse('hello', 'world').then((value) => {
                    expect(value).to.be.equal('hello-world');
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls multiple times within the timeout', (done) => {
            const instance = new MockWithParams();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse('hello', 'world').then((value) => {
                        expect(value).to.be.equal('hello-world');
                    })
                );
            }

            promises.push(
                instance.withCollapse('hello', 'world').then((value) => {
                    expect(value).to.be.equal('hello-world');
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                promises.length = 0;

                for (let i = 0; i < 20; i++) {
                    promises.push(
                        instance.withCollapse('hello', 'world').then((value) => {
                            expect(value).to.be.equal('hello-world');
                        })
                    );
                }

                promises.push(
                    instance.withCollapse('hello', 'world').then((value) => {
                        expect(value).to.be.equal('hello-world');
                        expect(instance.method).to.have.calledTwice;
                    })
                );

                Promise.all(promises).then(() => {
                    done();
                }).catch(done);
            }).catch(done);
        });

        it('should collapse multiple different calls within the timeout', (done) => {
            const instance = new MockWithParams();
            instance.method = sinon.spy(instance.method);

            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse('hello', 'world').then((value) => {
                        expect(value).to.be.equal('hello-world');
                    })
                );
            }

            promises.push(
                instance.withCollapse('hello', 'world').then((value) => {
                    expect(value).to.be.equal('hello-world');
                    expect(instance.method).to.have.calledTwice;

                })
            );

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse('welcome', 'back').then((value) => {
                        expect(value).to.be.equal('welcome-back');
                    })
                );
            }

            promises.push(
                instance.withCollapse('welcome', 'back').then((value) => {
                    expect(value).to.be.equal('welcome-back');
                    expect(instance.method).to.have.calledTwice;

                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);

        });
    });

    describe('Collapse', () => {
        it('should return the correct result', (done) => {
            const instance = new MockWithTimeout();

            instance.withCollapse(500).then((value) => {
                expect(value).to.be.equal(500);
                done();
            });
        });

        it('should not be collapsed multiple calls within the timeout', (done) => {
            const instance = new MockWithTimeout();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withoutCollapse(500).then((value) => {
                        expect(value).to.be.equal(500);
                    })
                );
            }

            promises.push(
                instance.withoutCollapse(500).then((value) => {
                    expect(value).to.be.equal(500);
                    expect(instance.method).to.have.callCount(11);
                })
            )

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls within the timeout', (done) => {
            const instance = new MockWithTimeout();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse(500).then((value) => {
                        expect(value).to.be.equal(500);
                    })
                );
            }

            promises.push(
                instance.withCollapse(500).then((value) => {
                    expect(value).to.be.equal(500);
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                done();
            }).catch(done);
        });

        it('should collapse multiple calls multiple times within the timeout', (done) => {
            const instance = new MockWithTimeout();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse(500).then((value) => {
                        expect(value).to.be.equal(500);
                    })
                );
            }

            promises.push(
                instance.withCollapse(500).then((value) => {
                    expect(value).to.be.equal(500);
                    expect(instance.method).to.have.calledOnce;
                })
            );

            Promise.all(promises).then(() => {
                promises.length = 0;

                for (let i = 0; i < 20; i++) {
                    promises.push(
                        instance.withCollapse(600).then((value) => {
                            expect(value).to.be.equal(600);
                        })
                    );
                }

                promises.push(
                    instance.withCollapse(600).then((value) => {
                        expect(value).to.be.equal(600);
                        expect(instance.method).to.have.calledTwice;
                    })
                );

                Promise.all(promises).then(() => {
                    done();
                }).catch(done);
            }).catch(done);
        });

        it('should collapse multiple calls within the specified timeout and collapse after again', (done) => {
            const instance = new MockWithTimeout();
            const promises = [];

            instance.method = sinon.spy(instance.method);

            for (let i = 0; i < 10; i++) {
                promises.push(
                    instance.withCollapse(900).then((value) => {
                        expect(value).to.be.equal(900);
                    })
                );
            }

            promises.push(
                instance.withCollapse(900).then((value) => {
                    expect(value).to.be.equal(900);
                    expect(instance.method).to.have.calledOnce;
                })
            );

            setTimeout(() => {
                for (let i = 0; i < 10; i++) {
                    promises.push(
                        instance.withCollapse(900).then((value) => {
                            expect(value).to.be.equal(900);
                        })
                    );
                }

                promises.push(
                    instance.withCollapse(900).then((value) => {
                        expect(value).to.be.equal(900);
                        expect(instance.method).to.have.calledTwice;
                    })
                );

                Promise.all(promises).then(() => {
                    done();
                }).catch(done);
            }, 800);
        });
    });

    describe('defaultHashFunction', () => {
        it('should return a correct hash with at least one parameter', () => {
            expect(defaultHashFunction('param1')).to.be.equal('param1');
        });

        it('should return a correct hash with multiple parameters and use delimeter "|"', () => {
            expect(defaultHashFunction('param1', 'param2', 'param3')).to.be.equal('param1|param2|param3');
        })
    });
});
