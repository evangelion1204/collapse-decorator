# Collapse Decorator [![Build Status](https://travis-ci.org/evangelion1204/collapse-decorator.png?branch=master)](https://travis-ci.org/evangelion1204/collapse-decorator) [![Coverage Status](https://coveralls.io/repos/evangelion1204/collapse-decorator/badge.svg?branch=master)](https://coveralls.io/r/evangelion1204/collapse-decorator?branch=master)

A decorator to collapse promises into a single pending promise to be used with async api calls.

## Install

```shell
npm install collapse-decorator
```

## Usage

```js

import { Collapse } from 'collapse-decorator';


class Example {
    @Collapse(1000)
    callApi(param) {
        return new Promise((resolve, reject) => {
            // do something
        });
    }
}

```