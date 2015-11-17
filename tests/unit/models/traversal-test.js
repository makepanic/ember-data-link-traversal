import {
  test,
  moduleForModel
} from "ember-qunit";
import { stubRequest } from 'ember-cli-fake-server';
import Ember from "ember";

import {follow, followUrl, save, configure} from 'ember-data-link-traversal/traversal';

configure({
  rootModel: 'root'
});

let assign = Ember.$.extend,
  {run} = Ember,
  err = (assert) => (e) => assert.ok(false, e);

var server;

moduleForModel('root', 'lookup', {
  needs: [
    'serializer:application',
    'serializer:root',

    'adapter:application',
    'adapter:root',
    'adapter:user',
    'adapter:thread',

    'model:user',
    'model:thread'
  ],
  teardown: function () {
    if (server) {
      server.shutdown();
      server = null;
    }
  }
});

test('it follows a given string path of linked relationships to a single record', function (assert) {
  assert.expect(2);

  const USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {self: {href: req.url}}
  }));

  run(() => {
    follow(this.store(), 'user').then(user => {
      assert.strictEqual(user.get('firstName'), 'Guy');
      assert.strictEqual(user.get('lastName'), 'Montag');
    }).catch(err(assert));
  });
});

test('it follows a given string path of linked relationships to a collection record', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: req.url},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}/threads`, (req) => req.ok({
    _links: {self: {href: req.url}},
    _embedded: {
      threads: [{
        id: 't-1',
        title: 'Ingsoc'
      }, {
        id: 't-2',
        title: 'Ministries of Oceania'
      }]
    }
  }));

  run(() => {
    follow(this.store(), 'user', 'threads').then(threads => {
      assert.strictEqual(threads.get('length'), 2);
      assert.strictEqual(threads.get('firstObject.title'), 'Ingsoc');
      done();
    }).catch(err(assert));
  });
});


test('it follows by using a uri template', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: req.url},
      user: {href: `/user/${USER_ID}{?notify}`, templated: true}
    }
  }));

  stubRequest('get', `/user/${USER_ID}`, (req) => req.queryParams.notify ? req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/user/${USER_ID}/threads{?marked}`, templated: true}
    }
  }) : req.notFound());

  stubRequest('get', `/user/${USER_ID}/threads`, (req) => req.queryParams.marked ? req.ok({
    _links: {self: {href: req.url}},
    _embedded: {
      threads: [{
        id: 't-1',
        title: 'Ingsoc'
      }, {
        id: 't-2',
        title: 'Ministries of Oceania'
      }]
    }
  }) : req.notFound());

  run(() => {
    follow(this.store(), 'user', 'threads', {notify: true, marked: true}).then(threads => {
      assert.strictEqual(threads.get('length'), 2);
      assert.strictEqual(threads.get('firstObject.title'), 'Ingsoc');
      done();
    }).catch(err(assert));
  });
});

test('it follows a given record + string path of linked relationships to a single record', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/user/${USER_ID}/threads`}
    }
  }));

  stubRequest('get', `/user/${USER_ID}/threads`, (req) => req.ok({
    _links: {self: {href: req.url}},
    _embedded: {
      threads: [{
        id: 't-1',
        title: 'Ingsoc'
      }, {
        id: 't-2',
        title: 'Ministries of Oceania'
      }]
    }
  }));

  run(() => {
    let store = this.store();
    follow(store, 'user').then(user => {
      return follow(store, user, 'threads').then(threads => {
        assert.strictEqual(threads.get('length'), 2);
        assert.strictEqual(threads.get('firstObject.title'), 'Ingsoc');
        done();
      });
    }).catch(err(assert));
  });
});

test('it follows a given record + string path of linked relationships to a single record by using a uri template', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/user/${USER_ID}/threads{?marked}`, templated: true}
    }
  }));

  stubRequest('get', `/user/${USER_ID}/threads`, (req) => req.queryParams.marked ? req.ok({
    _links: {self: {href: req.url}},
    _embedded: {
      threads: [{
        id: 't-1',
        title: 'Ingsoc',
        _links: {user: {href: `/user/${USER_ID}`}}
      }, {
        id: 't-2',
        title: 'Ministries of Oceania',
        _links: {user: {href: `/user/${USER_ID}`}}
      }]
    }
  }) : req.notFound());

  run(() => {
    let store = this.store();
    follow(store, 'user').then(user => {
      return follow(store, user, 'threads', {marked: true}).then(threads => {
        assert.strictEqual(threads.get('length'), 2);
        assert.strictEqual(threads.get('firstObject.title'), 'Ingsoc');
        done();
      }).catch(err(assert));
    }).catch(err(assert));
  });
});

test('it allows to save a created record with a given path', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/user/${USER_ID}/threads{?marked}`, templated: true}
    }
  }));

  stubRequest('post', `/user/${USER_ID}/threads`, (req) => {
    let obj = JSON.parse(req.requestBody);
    // use Object.assign, when ready
    return req.ok(assign({}, {
      _links: {
        self: {href: req.url}
      },
      id: 't-3'
    }, obj));
  });
  stubRequest('get', `/user/${USER_ID}/threads`, (req) => req.ok({
    _links: {self: {href: `${req.url}{?marked}`, templated: true}},
    _embedded: {
      threads: [{
        id: 't-1',
        title: 'Ingsoc',
        _links: {user: {href: `/user/${USER_ID}`}}
      }, {
        id: 't-2',
        title: 'Ministries of Oceania',
        _links: {user: {href: `/user/${USER_ID}`}}
      }]
    }
  }));

  run(() => {
    let store = this.store();
    save(store, 'user', 'threads', store.createRecord('thread', {
      title: 'Big Brother'
    })).then(rec => {
      assert.equal(rec.get('id'), 't-3');
      assert.equal(rec.get('title'), 'Big Brother');
      done();
    });
  });
});

test('it allows to reload a given record', function (assert) {
  assert.expect(1);

  const USER_ID = '1234',
    done = assert.async();

  let timesLoaded = 0;

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => {
    let user = {
      id: USER_ID,
      firstName: 'Guy',
      lastName: 'Montag',
      _links: {self: {href: `/non-rest-adapter-path-user/${USER_ID}`}}
    };

    if (timesLoaded > 0) {
      user.firstName = 'Mildred';
    }

    timesLoaded++;
    return req.ok(user);
  });

  run(() => {
    follow(this.store(), 'user').then(user => {
      return user.reload().then(reloadedUser => {
        assert.equal(reloadedUser.get('firstName'), 'Mildred',
          'reloaded record has new remote firstName');
        done();
      });
    }).catch(err(assert));
  });
});

test('it allows to save a dirty record', function (assert) {
  assert.expect(1);

  const USER_ID = '1234',
    done = assert.async();

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {self: {href: `/non-rest-adapter-path-user/${USER_ID}`}}
  }));

  stubRequest('put', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok(assign({}, {
    id: USER_ID,
    _links: {self: {href: req.url}}
  }, JSON.parse(req.requestBody))));


  run(() => {
    follow(this.store(), 'user').then(user => {
      user.set('firstName', 'Mildred');
      return user.save().then(updatedRecord => {
        assert.equal(updatedRecord.get('firstName'), 'Mildred',
          'saved record has new remote firstName');
        done();
      });
    }).catch(err(assert));
  });
});


test('it follows a given string path of linked relationships to a single record while not wrecking the store', function (assert) {
  assert.expect(2);
  let done = assert.async();

  const USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
    }
  }));

  let store = this.store();

  run(() => {
    follow(store, 'user')
      .then(() => follow(store, 'user'))
      .then(user => {
        assert.strictEqual(user.get('firstName'), 'Guy');
        assert.strictEqual(user.get('lastName'), 'Montag');
        done();
      }).catch(err(assert));
  });
});

test('it allows to delete an existing record using `deleteRecord()` and `save()`', function (assert) {
  assert.expect(1);
  let done = assert.async();

  const USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
    }
  }));

  stubRequest('delete', `/non-rest-adapter-path-user/${USER_ID}`, (req) => {
    req.ok({
      id: USER_ID,
      firstName: 'Guy',
      lastName: 'Montag',
      _links: {
        self: {href: req.url},
        threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
      }
    });
  });

  let store = this.store();

  run(() => {
    follow(store, 'user')
      .then(() => follow(store, 'user'))
      .then(user => {
        user.deleteRecord();
        user.save().then(() => {
          assert.ok(true, 'save resolved');
          done();
        });
      }).catch(err(assert));
  });
});


test('it allows to delete an existing record using `destroyRecord()`', function (assert) {
  assert.expect(1);
  let done = assert.async();

  const USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/non-rest-adapter-path-user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/non-rest-adapter-path-user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
    }
  }));

  stubRequest('delete', `/non-rest-adapter-path-user/${USER_ID}`, (req) => {
    req.ok({
      id: USER_ID,
      firstName: 'Guy',
      lastName: 'Montag',
      _links: {
        self: {href: req.url},
        threads: {href: `/non-rest-adapter-path-user/${USER_ID}/threads`}
      }
    });
  });

  let store = this.store();

  run(() => {
    follow(store, 'user')
      .then(() => follow(store, 'user'))
      .then(user => {
        user.destroyRecord().then(() => {
          assert.ok(true, 'save resolved');
          done();
        });
      }).catch(err(assert));
  });
});

test('it follows a given path and loads the last records based on a given url', function (assert) {
  assert.expect(2);

  const done = assert.async(),
    USER_ID = '1234';

  stubRequest('get', '/', (req) => req.ok({
    _links: {
      self: {href: `/`},
      user: {
        href: `/user/${USER_ID}`
      }
    }
  }));

  stubRequest('get', `/user/${USER_ID}`, (req) => req.ok({
    id: USER_ID,
    firstName: 'Guy',
    lastName: 'Montag',
    _links: {
      self: {href: req.url},
      threads: {href: `/user/${USER_ID}/threads`}
    }
  }));

  stubRequest('get', `/user/${USER_ID}/threads`, (req) => req.ok({
    _links: {
      self: {href: req.url},
      next: {href: `${req.url}?page=${req.queryParams.page ? 3 : 2}`}
    },
    _embedded: {
      threads: req.queryParams.page === '2' ? [{
        id: 't-3',
        title: 'thoughtcrime'
      }] : [{
        id: 't-1',
        title: 'Ingsoc'
      }, {
        id: 't-2',
        title: 'Ministries of Oceania'
      }]
    }
  }));

  run(() => {
    let store = this.store();
    follow(store, 'user').then(user => {
      return follow(store, user, 'threads').then(threads => {
        var nextPageUrl = threads.get('meta.links.next');
        return followUrl(store, threads.type, nextPageUrl).then(moreThreads => {
          assert.strictEqual(moreThreads.get('length'), 1);
          assert.strictEqual(moreThreads.get('firstObject.title'), 'thoughtcrime');
          done();
        });
      });
    }).catch(err(assert));
  });
});
