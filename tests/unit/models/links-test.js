import {
  test,
  moduleForModel
} from "ember-qunit";
import { stubRequest } from 'ember-cli-fake-server';
import Ember from "ember";

moduleForModel('moose', 'Links', {
  needs: ['serializer:application', 'adapter:application']
});

test('single resource links are available in model data.links property', function(assert){
  stubRequest('get', '/mooses/1', (request) => {
    request.ok({
      id: 1,
      _links: {
        self:  { href: '/mooses/1' },
        cats:  { href: '/mooses/1/cats' }
      }
    });
  });

  const store = this.store();
  return Ember.run(function(){
    return store.findRecord('moose', 1).then(function(moose){
      var links = moose.get('data.links');

      assert.deepEqual(links, {self: '/mooses/1', cats: '/mooses/1/cats' });
    });
  });
});
