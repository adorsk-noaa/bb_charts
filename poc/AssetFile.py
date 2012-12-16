config = {
    'CACHE_DIR': 'cache',
    'TARGET_DIR': 'assets/js'
}

assets = {
    'backbone.js': {
        'type': 'git',
        'source': 'https://github.com/documentcloud/backbone.git',
        'path': 'backbone.js'
    },
    'commonStyles': {
        'type': 'git',
        'source': 'https://github.com/adorsk-noaa/commonStyles.git'
    },
    'jquery.js': {
        'type': 'url',
        'source': 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
    },
    'jquery.ui': {
        'type': 'url',
        'source': 'http://jqueryui.com/resources/download/jquery-ui-1.9.1.custom.zip',
        'unzip': True,
        'path': 'jquery-ui-1.9.1.custom'
    },
    'jquery.ui.extras': {
        'type': 'git',
        'source': 'https://github.com/adorsk-noaa/jquery.ui.extras.git'
    },
    'jquery.qtip': {
        'type': 'git',
        'source': 'https://github.com/Craga89/qTip2.git',
        'path': 'dist'
    },
    'less.js': {
        'type': 'git',
        'source': 'https://github.com/adorsk/less.js.git'
    },
    'require.js': {
        'type': 'git',
        'source': 'https://github.com/jrburke/requirejs.git',
        'path': 'require.js'
    },
    'rless.js': {
        'type': 'git',
        'source': 'https://github.com/adorsk/requirejs-less.git',
        'path': 'requirejs-less.js'
    },
    'requirejs-text.js': {
        'type': 'git',
        'source': 'https://github.com/requirejs/text.git',
        'path': 'text.js'
    },
    'underscore.js': {
        'type': 'git',
        'source': 'https://github.com/documentcloud/underscore.git'
    },
    'underscore.string.js': {
        'type': 'git',
        'source': 'https://github.com/adorsk/underscore.string.git',
        'path': 'lib/underscore.string.js'
    },
    'util': {
        'type': 'git',
        'source': 'https://github.com/adorsk-noaa/georefine_util.git'
    },
    'jquery.ui.tabble': {
        'type': 'git',
        'source': 'https://github.com/adorsk/jquery.ui.tabble.git'
    },
    'jqplot': {
        'type': 'url',
        'source': 'https://cdn.bitbucket.org/cleonello/jqplot/downloads/jquery.jqplot.1.0.4r1121.zip',
        'unzip': True,
        'path': 'dist'
    },
}
