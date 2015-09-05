import HalTraversalAdapter from "ember-data-link-traversal/adapter";

export default HalTraversalAdapter.extend({
  headers: {
    'Content-Type': 'application/hal+json'
  }
});
