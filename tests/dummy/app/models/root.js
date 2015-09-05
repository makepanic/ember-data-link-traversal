import DS from 'ember-data';
import Entrypoint from "ember-data-link-traversal/entrypoint";

let {belongsTo} = DS;

export default Entrypoint.extend({
  user: belongsTo('user', {async:true})
});
