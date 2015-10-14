/* global urltemplate */

import DS from 'ember-data';
import {TRAVERSAL_META, TRAVERSAL_QUERY_LINK, extractRecordLinks} from './traversal';

export default DS.JSONAPIAdapter.extend({
  keyForRelationship(relationshipKey/*, relationshipMeta */) {
    return relationshipKey;
  },

  applyURLTemplate(url, templateOptions = {}) {
    if (url.meta && url.meta.templated) {
      url = urltemplate.parse(url.href).expand(templateOptions);
    }

    return url;
  },

  query(store, type, query/*, recordArray */) {
    let url = query[TRAVERSAL_QUERY_LINK],
      templatedURL = this.applyURLTemplate(url, query.templateParams);

    return this.ajax(templatedURL, 'GET');
  },

  queryRecord(store, type, query/*, recordArray */) {
    let url = query[TRAVERSAL_QUERY_LINK],
      templatedURL = this.applyURLTemplate(url, query.templateParams);

    return this.ajax(templatedURL, 'GET');
  },

  findBelongsTo(store, snapshot, url, relationship) {
    let selfURL = extractRecordLinks(snapshot.record)[relationship.key],
      templatedURL = this.applyURLTemplate(selfURL, {});

    return this.ajax(templatedURL, 'GET');
  },

  findHasMany(store, snapshot, url, relationship) {
    let selfURL = extractRecordLinks(snapshot.record)[relationship.key],
      templatedURL = this.applyURLTemplate(selfURL, {});

    return this.ajax(templatedURL, 'GET');
  },

  createRecord (store, type, snapshot) {
    let meta = snapshot.record.get(TRAVERSAL_META),
      url = meta[TRAVERSAL_QUERY_LINK],
      templatedURL = this.applyURLTemplate(url, meta);

    return this.ajax(templatedURL, 'POST', {data: snapshot.record.toJSON()});
  },

  findRecord(store, type, id, snapshot) {
    let selfURL = extractRecordLinks(snapshot.record).self,
      templatedURL = this.applyURLTemplate(selfURL, {});

    return this.ajax(templatedURL, 'GET');
  },

  updateRecord (store, type, snapshot) {
    let selfURL = extractRecordLinks(snapshot.record).self,
      templatedURL = this.applyURLTemplate(selfURL, {});

    return this.ajax(templatedURL, 'PUT', {data: snapshot.record.toJSON()});
  },

  deleteRecord (store, type, snapshot) {
    let selfURL = extractRecordLinks(snapshot.record).self,
      templatedURL = this.applyURLTemplate(selfURL, {});

    return this.ajax(templatedURL, 'DELETE', {data: snapshot.record.toJSON()});
  }
});
