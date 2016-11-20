/**
 * Created by asus on 11/19/16.
 */

isea.loader.load([
    'bower_components/angular-ui-select/dist/select.css',
    'css/select2.css',
    'bower_components/ng-wig/dist/css/ng-wig.css',
    'bower_components/ng-table/dist/ng-table.css',
    'bower_components/pikaday/css/pikaday.css',
    'bower_components/c3/c3.css',
    'bower_components/font-awesome/css/font-awesome.css',
    'bower_components/animate.css/animate.css',
    'bower_components/ng-sortable/dist/ng-sortable.css',
    //app
    'css/material-lite-demo.css',
    'css/helpers.css'
]);
if (BROWSER.type == 'ie') {
    isea.loader.load([
        'http://cdn.bootcss.com/es5-shim/4.5.9/es5-shim.min.js',
        'http://cdn.bootcss.com/classlist/2014.01.31/classList.min.js',
        'http://cdn.bootcss.com/selectivizr/1.0.2/selectivizr-min.js',
        'http://cdn.bootcss.com/flexie/1.0.3/flexie.min.js'
    ]);
    if (BROWSER.version < 9) {
        isea.loader.load('http://cdn.bootcss.com/html5shiv/r29/html5.min.js');
    }
}
isea.loader.load([/* build:js js/vendors.min.js */
    // 'js/vendors.min.js',
    'bower_components/material-design-lite/material.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-animate/angular-animate.js',
    //Required by angular-ui-select
    'bower_components/angular-ui-select/dist/select.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    // Required by to-do module
    'bower_components/angular-local-storage/dist/angular-local-storage.js',

    //http://www.cnblogs.com/whitewolf/p/4417873.html
    'bower_components/lodash/dist/lodash.min.js',

    'bower_components/angular-simple-logger/dist/angular-simple-logger.js',
    'bower_components/angular-google-maps/dist/angular-google-maps.js',

    'bower_components/ng-file-upload/ng-file-upload.js',
    'bower_components/ng-table/dist/ng-table.js',
    //Text editor
    'bower_components/ng-wig/dist/ng-wig.js',
    //Required by pikaday
    'bower_components/moment/moment.js',
    'bower_components/moment/min/locales.min.js',
    //Convert millisecond durations to English and many other languages.
    // humanizeDuration(2015)      // '2.25 seconds'
    'bower_components/humanize-duration/humanize-duration.js',
    //Required by pikaday
    'bower_components/pikaday/pikaday.js',//Required by pikaday-angular
    'bower_components/pikaday-angular/pikaday-angular.js',//Datepicker
    //Charts
    'bower_components/d3/d3.js',
    'bower_components/c3/c3.js',
    //C3 Chart directives
    'bower_components/c3-angular/c3-angular.min.js',
    // ...
    'bower_components/angulargrid/angulargrid.js',
    'bower_components/ngSmoothScroll/dist/angular-smooth-scroll.min.js',
    'bower_components/ng-sortable/dist/ng-sortable.min.js',
    'bower_components/angular-timer/dist/angular-timer.min.js',
    'js/vendors/angular-placeholders.js',
    'js/vendors/angular-mdl.js',

     /* build:js js/demo.min.js */
     'js/demo.min2.js'
]);