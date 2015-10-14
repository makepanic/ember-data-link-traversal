/* jshint node:true */

module.exports = {
  scenarios: [
    {
      name: "default",
      dependencies: {}
    },
    {
      name: "ember-data-2-0-0",
      dependencies: {
        "ember": "components/ember#release",
        "ember-data": "2.0.0"
      },
      resolutions: {
        "ember": "release"
      }
    },
    {
      name: "ember-data-2-0-1",
      dependencies: {
        "ember": "components/ember#release",
        "ember-data": "2.0.1"
      },
      resolutions: {
        "ember": "release"
      }
    },
    {
      name: "ember-data-2-1-0",
      dependencies: {
        "ember": "components/ember#release",
        "ember-data": "2.1.0"
      },
      resolutions: {
        "ember": "release"
      }
    },
    {
      name: "beta",
      dependencies: {
        "ember": "components/ember#beta",
        "ember-data": "2.2.0-beta.1"
      },
      resolutions: {
        "ember": "beta"
      }
    },
    {
      name: "canary",
      dependencies: {
        "ember": "components/ember#canary",
        "ember-data": "2.2.0-beta.1"
      },
      resolutions: {
        "ember": "canary"
      }
    }
  ]
};
