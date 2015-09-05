/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-data-link-traversal',

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/url-template/lib/url-template.js');
  }
};
