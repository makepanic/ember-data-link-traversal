import DS from 'ember-data';

let {hasMany, attr} = DS;

export default DS.Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),

  threads: hasMany('thread', {async: true})
});
