import { registerUnbound } from 'discourse-common/lib/helpers';

let _injections;

function renderRaw(ctx, container, template, templateName, params) {
  params.parent = params.parent || ctx;

  if (!params.view) {
    if (!_injections) {
      _injections = {
        siteSettings: container.lookup('site-settings:main'),
        currentUser: container.lookup('currentUser:main'),
        site: container.lookup('site:main'),
        session: container.lookup('session:main'),
        topicTrackingState: container.lookup('topic-tracking-state:main')
      };
    }

    const module = `discourse/raw-views/${templateName}`;
    if (requirejs.entries[module]) {
      const viewClass = require(module, null, null, true);
      if (viewClass && viewClass.default) {
        params.view = viewClass.default.create(params, _injections);
      }
    }
  }

  return new Handlebars.SafeString(template(params));
}

registerUnbound('raw', function(templateName, params) {
  templateName = templateName.replace('.', '/');

  const container = Discourse.__container__;
  var template = container.lookup('template:' + templateName + '.raw');
  if (!template) {
    Ember.warn('Could not find raw template: ' + templateName);
    return;
  }
  return renderRaw(this, container, template, templateName, params);
});
