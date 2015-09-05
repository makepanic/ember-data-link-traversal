import DS from 'ember-data';
import {rootModel} from './traversal';

let {Model} = DS;

export default Model.extend({
  modelName: rootModel
});
