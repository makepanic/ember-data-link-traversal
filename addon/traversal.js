import Ember from 'ember';
import DS from 'ember-data';

let {Model} = DS;
let {RSVP} = Ember;

// const when https://github.com/jshint/jshint/issues/2430 is in ember-cli-qunit
var TRAVERSAL_TEMPLATE_OPTIONS = '__traversal-template-options',//Symbol('traversal-template-options'),
  TRAVERSAL_QUERY_LINK = '__traversal-query-link', //Symbol('traversal-query-link'),
  TRAVERSAL_META = '__traversal-meta', //Symbol('traversal-meta'),
  TRAVERSAL_ROOT = '__traversal-root'; //Symbol('traversal-root');

// let when https://github.com/jshint/jshint/issues/2430 is in ember-cli-qunit
var rootModel = 'entrypoint',
  extractRecordLinks;

const DEFAULT_CONFIGURATION = {
  rootModel: 'entrypoint',
  extractRecordLinks(record) {
    return record.get('data.links') || record.get('meta.links');
  }
};

/**
 * Function to configure various fields
 * @param configuration
 */
function configure(configuration = {}) {
  let merged = Ember.$.extend({}, DEFAULT_CONFIGURATION, configuration);
  rootModel = merged.rootModel;
  extractRecordLinks = merged.extractRecordLinks;
}

configure();

/**
 * Check if a given value is a DS.Model instance
 * @param {*} value
 * @returns {boolean} true if value is a DS.Model
 */
function isDSModel(value) {
  return value !== undefined && value instanceof Model ||
    (value && value.content && value.content instanceof Model);
}

function callQueryMethod(store, record, path, templateParams) {
  const relationship = record.relationshipFor(path),
    modelClass = store.modelFor(relationship.type),
    queryMethod = relationship.kind === 'belongsTo' ? 'queryRecord' : 'query';

  return store[queryMethod](modelClass.modelName, {
    modelClass: modelClass,
    [TRAVERSAL_QUERY_LINK]: extractRecordLinks(record)[path],
    templateParams: templateParams
  });
}

/**
 * Follow a records links by a given path.
 * Provide a templateParams object to expand possible uri templates.
 * @param {DS.Store} store
 * @param {DS.Record} record
 * @param {Array.<String>} paths
 * @param templateParams
 * @returns {String|Function|{}|void|Promise.<*>|*}
 */
function followFromRecord(store, record, paths, templateParams) {
  let promise = RSVP.resolve(record);

  paths.forEach(path => {
    promise = promise.then(record => {
      if (templateParams) {
        record.set(TRAVERSAL_TEMPLATE_OPTIONS, templateParams);
      }
      return callQueryMethod(store, record, path, templateParams);
    });
  });

  return promise;
}

//Follows a given path to a resource using
function followFromRoot(store, paths, templateParams) {
  return store.findRecord(rootModel, 1).then(record => {
    return followFromRecord(store, record, paths, templateParams);
  });
}

function follow(store, first, ...paths) {
  let templateParams,
    isModel = isDSModel(first);

  if (paths.length > 0 && typeof paths[paths.length - 1] !== 'string') {
    templateParams = paths.pop();
  }

  return isModel ?
    followFromRecord(store, first, paths, templateParams) :
    followFromRoot(store, [first].concat(paths), templateParams);
}

/**
 * Function to create a record by following a chain of link relations and POSTing the given record
 * @param {DS.Store} store Ember data store
 * @param {String|DS.Model} first First link to follow or record to start the link traversal from
 * @param {Array.<String>} paths
 * @returns {void|Promise|Promise.<T>} Promise that resolves after the record is created.
 */
function save(store, first, ...paths) {
  let newRecord = paths.pop(),
    templateParams;

  if (paths.length > 0 && typeof paths[paths.length - 1] !== 'string') {
    templateParams = paths.pop();
  }

  return follow(...arguments).then(record => {
      newRecord.set(TRAVERSAL_META, {
        [TRAVERSAL_QUERY_LINK]: extractRecordLinks(record).self,
        templateParams: templateParams
      });

      return newRecord.save();
    });
}

export {
  save,
  follow,
  configure,
  extractRecordLinks,
  rootModel,
  TRAVERSAL_ROOT,
  TRAVERSAL_META,
  TRAVERSAL_TEMPLATE_OPTIONS,
  TRAVERSAL_QUERY_LINK
};
