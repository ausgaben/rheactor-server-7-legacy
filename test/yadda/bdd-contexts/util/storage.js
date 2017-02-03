'use strict'

import _template from 'lodash/template'

function storage (store, defaults, context, name, value) {
  if (!context[store]) {
    context[store] = defaults
  }
  if (value === undefined) {
    if (name === undefined) {
      return context[store]
    }
    return context[store][name]
  }
  context[store][name] = value
}

export const utils = {
  template: (str, data) => {
    return _template(str, {interpolate: /\{([\s\S]+?)\}/g})(data)
  },
  header: storage.bind(null, 'header', {}),
  data: storage.bind(null, 'data', {time: Date.now()})
}
