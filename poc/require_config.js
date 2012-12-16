if (typeof ASSETS_PATH == 'undefined'){
  ASSETS_PATH = '';
}

if (typeof BASE_URL == 'undefined'){
  BASE_URL = '';
}

var config= {
  baseUrl: BASE_URL,
  deps: [],
  paths: {
    requireLib: ASSETS_PATH + "/js/require",
    text: ASSETS_PATH + "/js/requirejs-text",
    rless: ASSETS_PATH + "/js/rless",
    less: ASSETS_PATH + "/js/less.js/dist/less-1.3.1",
    jquery: ASSETS_PATH + "/js/jquery",
    underscore: ASSETS_PATH + "/js/underscore.js/underscore",
    backbone: ASSETS_PATH + "/js/backbone",
    _s: ASSETS_PATH + "/js/underscore.string",
  },

  shim: {
    underscore: {
      exports: "_"
    },

    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },

    ui: {
      deps: ["jquery"],
    },

    qtip: {
      deps: ["jquery"],
    },

    uiExtras: {
      deps: ["ui"]
    },

    tabble: {
      deps: ["ui"]
    },
    jqplot: ["ui"],
    "jqplot/plugins/jqplot.barRenderer.min": ["jqplot"],
    "jqplot/plugins/jqplot.categoryAxisRenderer.min": ["jqplot"],
  },

  packages: [
  {
    "name": "Charts",
    "location": BASE_URL + "/../src"
  },
  {
    "name": "Util",
    "location": ASSETS_PATH + "/js/util/src"
  },

  {
    "name": "CommonStyles",
    "location": ASSETS_PATH + "/js/commonStyles/src"
  },

  {
    "name": "ui",
    "location": ASSETS_PATH + "/js/jquery.ui",
    "main": "js/jquery-ui-1.9.1.custom.js"
  },

  {
    "name": "uiExtras",
    "location": ASSETS_PATH + "/js/jquery.ui.extras"
  },

  {
    "name": "tabble",
    "location": ASSETS_PATH + "/js/jquery.ui.tabble",
    "main": "jquery.ui.tabble"
  },

  {
    "name": "Menus",
    "location": ASSETS_PATH + "/js/menus/src"
  },

  {
    "name": "qtip",
    "location": ASSETS_PATH + "/js/jquery.qtip",
    "main": "jquery.qtip",
  },

  {
    "name": "jqplot",
    "location": ASSETS_PATH + "/js/jqplot",
    "main": "jquery.jqplot.min",
  }

  ]

};

if (typeof require == 'undefined'){
  require = {};
}
for (var k in config){
  require[k] = config[k]
}
