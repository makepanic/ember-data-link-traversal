# Ember-data-link-traversal

An ember-data adapter and utility for link relation APIs. 
This adapter has no initial knowledge on resource URLs and gathers it by following from an api entrypoint.

The adapter is serializer independent and requires [JSON API Links](http://jsonapi.org/) [links](http://jsonapi.org/format/#document-links) (see "Compatibility" for more information).

[![Build
Status](https://travis-ci.org/makepanic/ember-data-link-traversal.svg?branch=master)](https://travis-ci.org/makepanic/ember-data-link-traversal)
[![Code Climate](https://codeclimate.com/github/makepanic/ember-data-link-traversal/badges/gpa.svg)](https://codeclimate.com/github/makepanic/ember-data-link-traversal)

## Compatibility

`ember-data-link-traversal` supports ember data and ember data 1.13.4+.
Currently it requires [ember-data-hal-9000](https://github.com/makepanic/ember-data-link-traversal) because of the way it stores document links.
By overwriting the `ember-data-link-traversal/traversal` `extractRecordLinks` method and let it return the record links, it should work with any other serializer but that isn't currently tested.

## Usage

Install `ember-data-link-traversal`:

 * `npm install --save-dev ember-data-link-traversal`
 * Extend your application adapter from the Traversal adapter, e.g.:

```javascript
// app/adapters/application.js

import TraversalAdapter from "ember-data-traversal-adapter/adapter";
export default TraversalAdapter.extend();
```

 * Extend your application serializer from the HAL-9000 serializer, e.g.:

```javascript
// app/serializers/application.js

import HalSerializer from "ember-data-traversal-adapter/serializer";
export default HalSerializer.extend();
```

Tested with Ember release, beta and canary channels.

### Entrypoint

You need an ember model that represents your api entrypoint with all corresponding links. In the test app the entrypoint model is called `root`.

### Link following

* `import {follow} from 'ember-data-link-traversal/traversal'` 
* follow resolves a promise with a found record (like `findRecord` or `findAll`)
* start at your api entrypoint by using a links key string as the second method parameter

```javascript
follow(store, 'user', 'family').then(familyRecord => {

});
```

* start from an already loaded record by using the record as the second parameter

```javascript
follow(store, userRecord, 'family').then(familyRecord => {

});
```

* provide an object that is expanded in possible templated link uris
* the object will be expanded in each template uri link

```javascript
// user._links = {pets: {href: '/foo{?onlyCats}', templated: true}}
follow(store, 'user', 'pets', {onlyCats: true}).then(petCatsCollection => {

});
```

### Creating new records

* `import {save} from 'ember-data-link-traversal/traversal'` 
* follows a given path to get a link to `POST` the locally created record


```javascript
let newThread = store.createRecord('thread', {
  title: 'Big Brother'
});

// follow entrypoint, user, threads links and POST the new user json
save(store, 'user', 'threads', newThread).then(createdThread => {

});
```

## Running Tests

* `npm test` # test all scenarios in config/ember-try.js
* `ember try <scenario-name> test --server` # test a specific scenario
