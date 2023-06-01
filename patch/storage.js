"use strict";
// patched by ulysses
exports.__esModule = true;
exports.Storage = void 0;

var _sdkCore = require("@acala-network/sdk-core");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _error = require("./error");

class Storage {
  constructor(configs) {
    this.configs = void 0;
    this.subject = void 0;
    this.subscriber = void 0;
    this.configs = configs;
    this.subject = new _rxjs.BehaviorSubject(undefined);
    this.doSubscriber();
  }

  static create(configs) {
    return new Storage(configs);
  }

  doSubscriber() {
    this.subscriber = this.process().subscribe({
      next: data => {
        this.subject.next(data);
      }
    });
  }

  process() {
    const {
      api
    } = this.configs;

    if (api.type === 'promise') {
      return this.processWithApiPromise();
    } else {
      return this.processWithApiRx();
    }
  }

  getQueryFN(api, path, at) {
    const arr = path.split('.');
    const start = at ? api.at(at) : api;
    return arr.reduce((acc, pathItem) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return acc[pathItem];
    }, start);
  }

  processWithApiRx() {
    const {
      path,
      params,
      at,
      triggleEvents
    } = this.configs;
    const api = this.configs.api;

    const inner = atHash => {
      const func = this.getQueryFN(api, path, atHash);

      if (func) {
        return func(...params);
      }

      throw new _error.NoQueryPath(path);
    };

    if (at) {
      return api.rpc.chain.getBlockHash(at).pipe((0, _operators.switchMap)(hash => inner(hash.toString())));
    }

    if (triggleEvents) {
      return (0, _sdkCore.eventsFilterRx)(api, triggleEvents, true).pipe((0, _operators.switchMap)(() => inner()));
    }

    return inner();
  }

  processWithApiPromise() {
    const {
      path,
      params,
      at,
      triggleEvents
    } = this.configs;
    const api = this.configs.api;
    return new _rxjs.Observable(subscriber => {
      (async () => {
        const atHash = at ? await api.rpc.chain.getBlockHash(at) : '';
        const func = this.getQueryFN(api, path, atHash.toString());
        params.push(result => subscriber.next(result));

        if (triggleEvents) {
          (0, _sdkCore.eventsFilterCallback)(api, triggleEvents, true, () => {
            if (func) func(...params);
            else console.log('no func', triggleEvents)
          });
        } else {
          func(...params);
        }
      })();
    });
  }

  unsub() {
    this.subscriber.unsubscribe();
  }

  get observable() {
    return this.subject.asObservable().pipe((0, _operators.filter)(i => !!i));
  }

  async query() {
    return (0, _rxjs.firstValueFrom)(this.observable);
  }

}

exports.Storage = Storage;