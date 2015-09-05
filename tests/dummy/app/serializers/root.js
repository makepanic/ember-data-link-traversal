import HalSerializer from "ember-data-hal-9000/serializer";

export default HalSerializer.extend({
  primaryKey: 'id',

  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    payload[this.get('primaryKey')] = '0';
    return this._super(store, primaryModelClass, payload, id, requestType);
  },

  modelNameFromPayloadKey() {
    return 'root';
  }
});
