(function () {
    'use strict';

    angular.module('material-lite', [
        'app.constants',

        'ngRoute',
        'ngAnimate',
        'ngSanitize', // Required by angular-ui-select

        'angular.mdl', // Required to make MDL components work with angular
        'ml.chat',
        'ml.menu',
        'ml.svg-map',
        'ml.todo',
        'ui.select', // Enhanced select element
        'ngFileUpload', // File uploader
        'ngWig', // Text editor
        'pikaday', // Datepicker

        'ngPlaceholders',
        'ngTable',

        'uiGmapgoogle-maps',

        'gridshore.c3js.chart', // C3 chart directives

        'angularGrid',
        'LocalStorageModule', // Required by todo module'
        'as.sortable',
        'timer'

    ]);

})();
(function () {
    'use strict';

    // routes
    angular
        .module('material-lite')
        .config(['$routeProvider', routeProvider])
        .run(['$route', routeRunner]);

    function routeProvider($routeProvider) {

        $routeProvider.when('/', {
            templateUrl: 'tpl/demo/dashboard.html'

        }).when('/:folder/:tpl', {
            templateUrl: function (attr) {
                return 'tpl/demo/' + attr.folder + '/' + attr.tpl + '.html';
            }

        }).when('/:tpl', {
            templateUrl: function (attr) {
                return 'tpl/demo/' + attr.tpl + '.html';
            }

        }).otherwise({redirectTo: '/'});
    }

    function routeRunner($route) {
        // $route.reload();
    }

})();
(function () {
    'use strict';

    // set constants
    angular
        .module('material-lite')
        .run(['$rootScope', 'APP', Constants])
        .run(['$rootScope', '$timeout', InitMaterialLayout])
        .config(['uiGmapGoogleMapApiProvider', GoogleMapsConfig]);

    function Constants($rootScope, APP) {
        $rootScope.APP = APP;
    }

    // Initialize MaterialLayout when everything is rendered
    // Or else there will be a race condition where the drawer can't be opened
    function InitMaterialLayout($rootScope, $timeout) {
        $rootScope.$on('$viewContentLoaded', function (event) {
            $timeout(function () {
                var element = document.querySelector('.mdl-layout');
                // This will make sure the MaterialLayout isn't initialized
                // on page load so we can do it manually
                element.classList.add('mdl-js-layout');
                componentHandler.upgradeElement(element, 'MaterialLayout');
            });
        });
    }

    // google maps
    function GoogleMapsConfig(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
        });
    }

})();
angular.module('app.constants', [])

    .constant('APP', {version: '1.1.0'})

;
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('MainController', ['$scope', MainController]);

    function MainController($scope) {

        // Trigger manual input event to hide label
        $scope.onPikadaySelect = function onPikadaySelect(pikaday, date) {
            var event = new Event('input');

            pikaday._o.field.dispatchEvent(event);
        };

    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('DashboardController', ['$timeout', '$scope', DashboardController]);

    function DashboardController($timeout, $scope) {
        var random_load_value = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var randomData = function (size, min, max) {
            var data = [];
            for (var i = 0; i < size; ++i) {
                data.push(random_load_value(min, max));
            }
            return data;
        };
        var randomDataOrganic = function (size, min, max) {
            var data = [];
            for (var i = 0; i < size; ++i) {
                if (data.length) {
                    var factor = 10;
                    var minOrganic = data[data.length - 1] - factor;
                    var maxOrganic = data[data.length - 1] + factor;
                    data.push(
                        random_load_value(
                            minOrganic < min ? min : minOrganic,
                            maxOrganic > max ? max : maxOrganic
                        )
                    );
                } else {
                    data.push(random_load_value(min, max));
                }
            }
            return data;
        };

        $scope.chartData1 = randomData(75, 5, 200).join();
        $scope.chartData2 = randomData(24, 5, 200).join();
        $scope.chartData3 = randomData(20, 5, 200).join();
        $scope.chartData4 = randomDataOrganic(50, 10, 30).join();
        $scope.chartData5 = randomDataOrganic(18, 10, 30).join();

        var chatEnded = false;

        $timeout(function () {
            $scope.$broadcast('chat:receiveMessage', 'I have a problem with an order, could you help me out?');
        }, 3000);

        $scope.$on('chat:sendMessage', function () {
            if (!chatEnded) {
                chatEnded = true;

                $timeout(function () {
                    $scope.$broadcast('chat:receiveMessage', 'Thanks!');
                }, 2000);
            }
        });
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .service('TodoWebService', ['$q', '$http', TodoWebService])
        .controller('TodoController', ['$scope', 'TodoWebService', 'TodoService', TodoController]);

    function TodoWebService($q, $http) {
        this.baseURL = 'https://payninja.azurewebsites.net';
        this.userData = null;
        this.getToken = function () {
            var req = {
                method: 'POST',
                url: this.baseURL + '/token',
                data: 'username=ivantest@gmail.com&password=123456&grant_type=password&client_id=paylenz-api-client_1607859&client_secret=paylenz-api-plsecrect_80d3da4d89a6311',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                },
            }

            return $http(req);
        }
        this._callAPI = function (method, path, data) {
            var req = {
                method: method,
                url: this.baseURL + path,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': this.userData.token_type + " " + this.userData.access_token
                }
            }

            return $http(req);
        }
        this.postTask = function (data) {
            if (this.userData === null) {
                return false;
            }
            return this._callAPI("POST", "/api/v1/task?userKey=", data);
        }
        this.getTask = function () {
            if (this.userData === null) {
                return false;
            }
            return this._callAPI("GET", "/api/v1/task?userKey=");
        }
        this.startInterval = function (data) {
            if (this.userData === null) {
                return false;
            }
            return this._callAPI("POST", "/api/v1/taskInterval?userKey=", data);
        }
        this.stopInterval = function (data) {
            if (this.userData === null) {
                return false;
            }
            return this._callAPI("POST", "/api/v1/taskInterval?userKey=", data);
        }

    }

    function TodoController($scope, TodoWebService, TodoService) {
        TodoWebService.getToken().then(function (res) {
            TodoWebService.userData = res.data;
            $scope.todoWebService = TodoWebService;
            $scope.todoService = new TodoService($scope);
        });

    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('LoadingController', LoadingController);

    function LoadingController() {
        var p1 = document.querySelector('#p1');
        var p3 = document.querySelector('#p3');

        p1.addEventListener('mdl-componentupgraded', function () {
            this.MaterialProgress.setProgress(44);
        });

        p3.addEventListener('mdl-componentupgraded', function () {
            this.MaterialProgress.setProgress(33);
            this.MaterialProgress.setBuffer(87);
        });

        componentHandler.downgradeElements([p1, p3]);
        componentHandler.upgradeElement(p1, 'MaterialProgress');
        componentHandler.upgradeElement(p3, 'MaterialProgress');
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .directive('disableAnimate', ['$animate', disableAnimate])
        .service('imageService', ['$q', '$http', imageService])
        .controller('GalleryController', ['$scope', 'imageService', 'angularGridInstance', GalleryController]);

    function imageService($q, $http) {
        /* jshint validthis: true */
        this.loadImages = function () {
            return $http.get('js/demo/apis/gallery.json');
        };
    }

    function disableAnimate($animate) {
        return function (scope, element) {
            $animate.enabled(false, element);
        };
    }

    function GalleryController($scope, imageService, angularGridInstance) {

        $scope.type = '';

        imageService.loadImages().then(function (res) {

            var images = res.data;
            $scope.images = images;
            $scope.searchTxt = "";

            //apply search and sort method
            $scope.$watch('searchTxt', function (val) {
                val = val.toLowerCase();
                $scope.images = images.filter(function (obj) {
                    return obj.title.toLowerCase().indexOf(val) != -1;
                });
            });

            $scope.showType = function (val) {
                val = val.toLowerCase();
                $scope.images = images.filter(function (obj) {
                    return obj.type.toLowerCase().indexOf(val) != -1;
                });
            };

            // example sorting functions
            $scope.sortByLikes = function () {
                $scope.images.sort(function (a, b) {
                    return b.likes - a.likes;
                });
            };

            $scope.sortByWatch = function () {
                $scope.images.sort(function (a, b) {
                    return b.watch - a.watch;
                });
            };

            $scope.sortByTime = function () {
                $scope.images.sort(function (a, b) {
                    return b.time - a.time;
                });
            };

        });
    }
})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('SelectController', ['$scope', SelectController]);

    function SelectController($scope) {
        $scope.person = {};
        $scope.people = [
            {name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States'},
            {name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina'},
            {name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina'},
            {name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador'},
            {name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador'},
            {name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States'},
            {name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia'},
            {name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador'},
            {name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia'},
            {name: 'Nicolás', email: 'nicolas@email.com', age: 43, country: 'Colombia'}
        ];

        $scope.availableColors = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon', 'Umbra', 'Turquoise'];

        $scope.selectedState = '';
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('UploadController', ['$scope', 'Upload', '$timeout', UploadController]);

    function UploadController($scope, Upload, $timeout) {

        $scope.fileReaderSupported = window.FileReader !== undefined && (window.FileAPI === undefined || FileAPI.html5 !== false);

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        var progressHandler = function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        };

        var successHandler = function (data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
        };

        var thumbHandler = function (file) {
            generateThumb(file);
        };

        var generateThumb = function (file) {
            if (file !== undefined) {
                if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                    $timeout(function () {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function (e) {
                            $timeout(function () {
                                file.dataUrl = e.target.result;
                            });
                        };
                    });
                }
            }
        };

        $scope.upload = function (files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    Upload.upload({
                        url: '#',
                        file: file
                    })
                        .progress(progressHandler)
                        .success(successHandler);
                }
            }
        };

        $scope.$watch('files', function (files) {
            $scope.formUpload = false;
            if (files !== undefined && files !== null) {
                for (var i = 0; i < files.length; i++) {
                    $scope.errorMsg = undefined;
                    (thumbHandler)(files[i]);
                }
            }
        });
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('TextEditorController', ['$scope', TextEditor]);

    function TextEditor($scope) {
        $scope.text1 = '<h1>Lorem ipsum</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe maxime similique, ab voluptate dolorem incidunt, totam dolores illum eum ad quas odit. Magnam rerum doloribus vitae magni quasi molestias repellat.</p><ul><li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus tempora explicabo fugit unde maxime alias.</li><li>Numquam, nihil. Fugiat aspernatur suscipit voluptatum dolorum nisi numquam, fugit at, saepe alias assumenda autem.</li><li>Iste dolore sed placeat aperiam alias modi repellat dolorem, temporibus odio adipisci obcaecati, est facere!</li><li>Quas totam itaque voluptatibus dolore ea reprehenderit ut quibusdam, odit beatae aliquam, deleniti unde tempora!</li><li>Rerum quis soluta, necessitatibus. Maxime repudiandae minus at eum, dicta deserunt dignissimos laborum doloribus. Vel.</li></ul><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis enim illum, iure cumque amet. Eos quisquam, nemo voluptates. Minima facilis, recusandae atque ullam illum quae iure impedit nihil dolorum hic?</p>';
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('ClickableMapController', ['$scope', ClickableMapController]);

    function ClickableMapController($scope) {
        $scope.map = {center: {latitude: 40.399516, longitude: -22.703348}, zoom: 2};

        $scope.centerOn = function (lat, lng) {
            $scope.map.center = {latitude: lat, longitude: lng};
        };

        var markers = [];

        markers.push({
            id: 0,
            latitude: 52.369371,
            longitude: 4.894494,
            title: 'Amsterdam'
        });
        markers.push({
            id: 1,
            latitude: 40.712942,
            longitude: -74.005774,
            title: 'New York'
        });
        markers.push({
            id: 2,
            latitude: 41.385196,
            longitude: 2.173315,
            title: 'Barcelona'
        });
        markers.push({
            id: 3,
            latitude: 37.764355,
            longitude: -122.451954,
            title: 'San Francisco'
        });

        $scope.markers = markers;
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('SearchableMapController', ['$scope', 'uiGmapGoogleMapApi', SearchableMapController]);

    function SearchableMapController($scope, uiGmapGoogleMapApi) {
        $scope.map = {
            center: {
                latitude: 40.399516,
                longitude: -22.703348
            },
            control: {},
            zoom: 2
        };

        uiGmapGoogleMapApi.then(function (maps) {
            $scope.searchFor = function (query) {
                var geocoder = new maps.Geocoder();
                geocoder.geocode({address: query}, function (results, status) {
                    if (status == maps.GeocoderStatus.OK) {
                        var latlng = results[0].geometry.location;
                        $scope.map.control.refresh({latitude: latlng.lat(), longitude: latlng.lng()});
                        $scope.map.control.getGMap().setZoom(6);
                    }
                });
            };
        });
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('ZoomableMapController', ['$scope', ZoomableMapController]);

    function ZoomableMapController($scope) {
        var zoomed_from_slider = false;
        $scope.map = {
            center: {
                latitude: 52.369371,
                longitude: 4.894494
            },
            control: {},
            events: {
                zoom_changed: function (maps, eventName, args) {
                    if (zoomed_from_slider === false) {
                        var zoom = $scope.getMapInstance().getZoom();
                        $scope.zoom_level = zoom;
                    } else {
                        zoomed_from_slider = false;
                    }
                }
            },
            zoom: 5
        };

        $scope.update_zoom = function () {
            zoomed_from_slider = true;
            $scope.getMapInstance().setZoom(parseInt($scope.zoom_level));
        };

        $scope.getMapInstance = function () {
            return $scope.map.control.getGMap();
        };
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('StyledMapController', ['$scope', StyledMapController]);

    function StyledMapController($scope) {
        $scope.map = {
            center: {
                latitude: 52.369371,
                longitude: 4.894494
            },
            control: {},
            zoom: 5
        };

        // Find more styles at: https://snazzymaps.com/

        $scope.options = {
            styles: [
                {
                    'featureType': 'all',
                    'elementType': 'labels.text.fill',
                    'stylers': [
                        {
                            'color': '#ffffff'
                        }
                    ]
                },
                {
                    'featureType': 'all',
                    'elementType': 'labels.text.stroke',
                    'stylers': [
                        {
                            'color': '#000000'
                        },
                        {
                            'lightness': 13
                        }
                    ]
                },
                {
                    'featureType': 'administrative',
                    'elementType': 'geometry.fill',
                    'stylers': [
                        {
                            'color': '#000000'
                        }
                    ]
                },
                {
                    'featureType': 'administrative',
                    'elementType': 'geometry.stroke',
                    'stylers': [
                        {
                            'color': '#144b53'
                        },
                        {
                            'lightness': 14
                        },
                        {
                            'weight': 1.4
                        }
                    ]
                },
                {
                    'featureType': 'landscape',
                    'elementType': 'all',
                    'stylers': [
                        {
                            'color': '#08304b'
                        }
                    ]
                },
                {
                    'featureType': 'poi',
                    'elementType': 'geometry',
                    'stylers': [
                        {
                            'color': '#0c4152'
                        },
                        {
                            'lightness': 5
                        }
                    ]
                },
                {
                    'featureType': 'road.highway',
                    'elementType': 'geometry.fill',
                    'stylers': [
                        {
                            'color': '#000000'
                        }
                    ]
                },
                {
                    'featureType': 'road.highway',
                    'elementType': 'geometry.stroke',
                    'stylers': [
                        {
                            'color': '#0b434f'
                        },
                        {
                            'lightness': 25
                        }
                    ]
                },
                {
                    'featureType': 'road.arterial',
                    'elementType': 'geometry.fill',
                    'stylers': [
                        {
                            'color': '#000000'
                        }
                    ]
                },
                {
                    'featureType': 'road.arterial',
                    'elementType': 'geometry.stroke',
                    'stylers': [
                        {
                            'color': '#0b3d51'
                        },
                        {
                            'lightness': 16
                        }
                    ]
                },
                {
                    'featureType': 'road.local',
                    'elementType': 'geometry',
                    'stylers': [
                        {
                            'color': '#000000'
                        }
                    ]
                },
                {
                    'featureType': 'transit',
                    'elementType': 'all',
                    'stylers': [
                        {
                            'color': '#146474'
                        }
                    ]
                },
                {
                    'featureType': 'water',
                    'elementType': 'all',
                    'stylers': [
                        {
                            'color': '#021019'
                        }
                    ]
                }
            ]
        };
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('FullMapController', ['$scope', FullMapController]);

    function FullMapController($scope) {
        $scope.map = {center: {latitude: 40.399516, longitude: -22.703348}, zoom: 3};

        $scope.centerOn = function (lat, lng) {
            $scope.map.center = {latitude: lat, longitude: lng};
        };

        var markers = [];

        markers.push({
            id: 0,
            latitude: 52.369371,
            longitude: 4.894494,
            title: 'Amsterdam'
        });
        markers.push({
            id: 1,
            latitude: 40.712942,
            longitude: -74.005774,
            title: 'New York'
        });
        markers.push({
            id: 2,
            latitude: 41.385196,
            longitude: 2.173315,
            title: 'Barcelona'
        });
        markers.push({
            id: 3,
            latitude: 37.764355,
            longitude: -122.451954,
            title: 'San Francisco'
        });

        $scope.markers = markers;
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('ChartsController', ['$scope', ChartsController]);

    function ChartsController($scope) {

        var pattern = [];
        pattern.push('#4CAF50');
        pattern.push('#2196F3');
        pattern.push('#9c27b0');
        pattern.push('#ff9800');
        pattern.push('#F44336');

        $scope.color_pattern = pattern.join();
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .controller('TablesDataController', ['$scope', 'PlaceholderTextService', 'ngTableParams', '$filter', TablesDataController]);

    function TablesDataController($scope, PlaceholderTextService, ngTableParams, $filter) {

        // adding demo data
        var data = [];
        var cnt = 200;
        for (var i = 1; i <= cnt; i++) {
            data.push({
                icon: PlaceholderTextService.createIcon(),
                firstname: PlaceholderTextService.createFirstname(),
                lastname: PlaceholderTextService.createLastname(),
                paragraph: PlaceholderTextService.createSentence()
            });
        }
        $scope.data = data;

        /* jshint newcap: false */
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,
            sorting: {
                firstname: 'asc'     // initial sorting
            }
        }, {
            filterDelay: 50,
            total: data.length, // length of data
            getData: function ($defer, params) {
                var searchStr = params.filter().search;
                var mydata = [];

                if (searchStr) {
                    searchStr = searchStr.toLowerCase();
                    mydata = data.filter(function (item) {
                        return item.firstname.toLowerCase().indexOf(searchStr) > -1 || item.lastname.toLowerCase().indexOf(searchStr) > -1;
                    });

                } else {
                    mydata = data;
                }

                mydata = params.sorting() ? $filter('orderBy')(mydata, params.orderBy()) : mydata;
                $defer.resolve(mydata.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .directive('dynamicColor', dynamicColor);

    function dynamicColor() {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                angular.forEach(element.children(), function (div) {

                    var elem = angular.element(div);
                    var css_class = elem.attr('class').match(/mdl-color--(.*?)($|\s)/g)[0];

                    elem.html(css_class);

                    if (/-900 $/g.test(css_class)) {
                        elem.after('<br/>');
                    }
                });
            }
        };
    }

})();
(function () {
    'use strict';
    angular
        .module('material-lite')
        .directive('mlHeader', mlHeader);

    function mlHeader() {
        return {
            restrict: 'E',
            templateUrl: 'tpl/demo/partials/header.html',
            replace: true
        };
    }

})();
(function () {
    'use strict';

    angular
        .module('material-lite')
        .directive('mlSidebar', mlSidebar);

    function mlSidebar() {
        return {
            restrict: 'E',
            templateUrl: 'tpl/demo/partials/sidebar.html',
            replace: true
        };
    }

})();
(function () {
    'use strict';

    angular
        .module('ml.chat', [])
        .constant('mlChatConfig', {
            endpoint: 'js/demo/apis/chats.json'
        })
        .controller('mlChatController', ['$scope', 'mlChatService', mlChatController])
        .factory('mlChatService', ['$q', '$http', 'mlChatConfig', mlChatService])
        .directive('mlChatWidget', mlChatWidget)
        .directive('mlChatApp', mlChatApp)
        .filter('mlChatDate', mlChatDate);

    function mlChatController($scope, mlChatService) {
        /* jshint validthis: true */
        var vm = this;

        // Created a public method which can be called from the mlChatApp directive
        vm.getConversations = function () {
            return mlChatService.getConversations();
        };

        $scope.conversations = [];
        $scope.currentConversation = {name: 'Undefined', messages: []};

        $scope.$on('chat:receiveMessage', function (event, message) {
            $scope.currentConversation.messages.push(mlChatService.prepareMessage(message, false));
        });

        $scope.switchConversation = function (conversation) {
            $scope.currentConversation = conversation;
        };

        $scope.sendMessage = function () {
            if ($scope.message !== '' && $scope.message !== undefined) {
                $scope.currentConversation.messages.push(mlChatService.prepareMessage($scope.message, true));
                $scope.message = '';

                $scope.$emit('chat:sendMessage');
            }
        };
    }

    function mlChatService($q, $http, mlChatConfig) {
        function prepareMessage(message, me) {
            return {text: message, datetime: moment().format(), me: me};
        }

        function getConversations() {
            var defer = $q.defer();

            $http.get(mlChatConfig.endpoint, {cache: 'true'})
                .then(function (response) {
                    defer.resolve(response);
                }, function (response) {
                    // Handle errors
                });

            return defer.promise;
        }

        return {
            prepareMessage: prepareMessage,
            getConversations: getConversations
        };
    }

    function mlChatWidget() {
        return {
            restrict: 'EA',
            controller: 'mlChatController',
            templateUrl: 'tpl/partials/chat-widget.html'
        };
    }

    function mlChatApp() {
        return {
            restrict: 'EA',
            controller: 'mlChatController',
            link: link
        };

        function link($scope, $element, $attributes, chatCtrl) {
            chatCtrl
                .getConversations()
                .then(function (response) {
                    $scope.conversations = response.data;
                    $scope.currentConversation = $scope.conversations[0];
                });
        }
    }

    function mlChatDate() {
        return filter;

        function filter(input) {
            if (!input || !input.length) {
                return;
            }

            return moment(input).format('LLL');
        }
    }

}());
(function () {
    'use strict';

    angular
        .module('ml.menu', [])

        .constant('menuConfig', {
            closeOthers: true
        })

        .controller('MenuController', ['$scope', '$attrs', '$location', '$rootScope', 'menuConfig', MenuController])

        // The ml-menu directive sets up the directive controller
        .directive('mlMenu', Menu)

        .directive('mlMenuItem', MenuItem)

        // The ml-menu-group directive indicates a block of html that will expand and collapse in a menu
        .directive('mlMenuGroup', MenuGroup)

        // Use ml-menu-heading below an menu-group to provide a heading containing HTML
        // <ml-menu-group>
        //   <ml-menu-heading>Heading containing HTML - <img src="..."></ml-menu-heading>
        // </ml-menu-group>
        .directive('mlMenuGroupHeading', MenuGroupHeading)

        // Use in the menu-group template to indicate where you want the heading to be transcluded
        // You must provide the property on the ml-menu-group controller that will hold the transcluded element
        // <li>
        //   <a class="mdl-navigation__link" ><span ... ml-menu-transclude="heading">...</span></a>
        //   ...
        // </li>
        .directive('mlMenuTransclude', MenuTransclude)

        .directive('collapse', ['$animate', collapse]);

    function MenuController($scope, $attrs, $location, $rootScope, menuConfig) {
        /* jshint validthis: true */
        var vm = this;

        // This array keeps track of the menu groups
        vm.groups = [];

        // This array keeps track of the menu items
        vm.items = [];

        // Ensure that all the groups in this menu are closed
        vm.closeOthers = function (openGroup) {
            var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : menuConfig.closeOthers;
            if (closeOthers) {
                angular.forEach(vm.groups, function (group) {
                    if (group !== openGroup) {
                        group.isOpen = false;
                    }
                });
            }
        };

        // Ensure that all other items are inactive
        vm.inactivateOthers = function (activeItem) {
            angular.forEach(vm.items, function (item) {
                if (item !== activeItem) {
                    item.isActive = false;
                }
            });
        };

        // This is called from the ml-menu-group directive to add itself to the menu
        vm.addGroup = function (groupScope) {
            groupScope.isOpen = true;
            vm.groups.push(groupScope);
        };

        // This is called from the ml-menu-group directive to add itself to the menu
        vm.addItem = function (itemScope) {
            vm.items.push(itemScope);
        };

        vm.isOpen = function (path) {
            var folder = $location.path().split('/')[1];
            return folder == path;
        };

        vm.isActive = function (href) {
            return $location.path() == href.slice(1, href.length);
        };

        vm.setBreadcrumb = function (name) {
            $rootScope.pageTitle = name;
        };

    }

    function Menu() {
        return {
            restrict: 'EA',
            controller: 'MenuController'
        };
    }

    function MenuItem() {
        return {
            require: '^mlMenu',   // We need this directive to be inside a menu
            restrict: 'EA',
            transclude: true,     // It transcludes the contents of the directive into the template
            replace: true,        // The element containing the directive will be replaced with the template
            templateUrl: 'tpl/partials/menu-item.html',
            scope: {
                isActive: '=?'
            },
            link: link
        };

        function link(scope, element, attrs, menuCtrl) {
            menuCtrl.addItem(scope);

            scope.$watch('isActive', function (value) {
                if (value) {
                    menuCtrl.inactivateOthers(scope);
                }
            });

            var href = angular.element(element.children()[0]).attr('href');

            scope.isActive = menuCtrl.isActive(href);

            scope.toggleActive = function () {
                if (!scope.isActive) {
                    scope.isActive = !scope.isActive;
                }


                var a = element.find('a').clone();
                a.find('i').remove();
                var title = a.text().trim();

                menuCtrl.setBreadcrumb(title == 'Dashboard' ? '' : title);

            };

        }
    }

    function MenuGroup() {
        return {
            require: '^mlMenu',   // We need this directive to be inside a menu
            restrict: 'EA',
            transclude: true,     // It transcludes the contents of the directive into the template
            replace: true,        // The element containing the directive will be replaced with the template
            templateUrl: 'tpl/partials/menu-group.html',
            scope: {
                heading: '@',       // Interpolate the heading attribute onto this scope
                path: '@',
                isOpen: '=?'
            },
            controller: function () {
                this.setHeading = function (element) {
                    this.heading = element;
                };
            },
            link: link
        };

        function link(scope, element, attrs, menuCtrl) {
            menuCtrl.addGroup(scope);

            scope.$watch('isOpen', function (value) {
                if (value) {
                    menuCtrl.closeOthers(scope);
                }
            });

            scope.isOpen = menuCtrl.isOpen(attrs.path);

            scope.toggleOpen = function () {
                scope.isOpen = !scope.isOpen;
            };
        }
    }

    function MenuGroupHeading() {
        return {
            restrict: 'EA',
            transclude: true,   // Grab the contents to be used as the heading
            template: '',       // In effect remove this element!
            replace: true,
            require: '^mlMenuGroup',
            link: link
        };

        function link(scope, element, attr, menuGroupCtrl, transclude) {
            // Pass the heading to the ml-menu-group controller
            // so that it can be transcluded into the right place in the template
            // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
            menuGroupCtrl.setHeading(transclude(scope, angular.noop));
        }
    }

    function MenuTransclude() {
        return {
            require: '^mlMenuGroup',
            link: link
        };

        function link(scope, element, attr, controller) {
            scope.$watch(function () {
                return controller[attr.mlMenuTransclude];
            }, function (heading) {
                if (heading) {
                    element.html('');
                    element.replaceWith(heading);
                }
            });
        }
    }

    function collapse($animate) {
        return {
            link: link
        };

        function link(scope, element, attrs) {
            function expand() {
                element.removeClass('collapse').addClass('collapsing');
                $animate.addClass(element, 'in', {
                    to: {height: element[0].scrollHeight + 'px'}
                }).then(expandDone);
            }

            function expandDone() {
                element.removeClass('collapsing');
                element.css({height: 'auto'});
            }

            function collapse() {
                element
                // IMPORTANT: The height must be set before adding "collapsing" class.
                // Otherwise, the browser attempts to animate from height 0 (in
                // collapsing class) to the given height here.
                    .css({height: element[0].scrollHeight + 'px'})
                    // initially all panel collapse have the collapse class, this removal
                    // prevents the animation from jumping to collapsed state
                    .removeClass('collapse')
                    .addClass('collapsing');

                $animate.removeClass(element, 'in', {
                    to: {height: '0'}
                }).then(collapseDone);
            }

            function collapseDone() {
                element.css({height: '0'}); // Required so that collapse works when animation is disabled
                element.removeClass('collapsing');
                element.addClass('collapse');
            }

            scope.$watch(attrs.collapse, function (shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    }

}());
(function () {
    'use strict';

    angular
        .module('ml.svg-map', [])
        .directive('mlSvgMap', ['$compile', mlSvgMap])
        .directive('mlSvgMapRegion', ['$compile', mlSvgMapRegion])
        .filter('mlSvgMapColor', mlSvgMapColor);

    function mlSvgMap($compile) {
        return {
            restrict: 'EA',
            templateUrl: templateUrl,
            link: link
        };

        function templateUrl($element, $attributes) {
            return $attributes.templateUrl || 'some/path/default.html';
        }

        function link($scope, $element, $attributes) {
            var regions = $element[0].querySelectorAll('path');

            angular.forEach(regions, function (path, key) {
                var regionElement = angular.element(path);
                regionElement.attr('ml-svg-map-region', '');
                regionElement.attr('hover-region', 'hoverRegion');
                $compile(regionElement)($scope);
            });
        }
    }

    function mlSvgMapRegion($compile) {
        return {
            restrict: 'A',
            scope: {
                hoverRegion: '='
            },
            link: link
        };

        function link($scope, $element, $attributes) {
            $scope.elementId = $element.attr('id');

            $scope.regionClick = function () {
                alert($scope.elementId);
            };

            $scope.regionMouseOver = function () {
                $scope.hoverRegion = $scope.elementId;
                $element[0].parentNode.appendChild($element[0]);
            };

            $element.attr('ng-click', 'regionClick()');
            $element.attr('ng-attr-fill', '{{ elementId | mlSvgMapColor }}');
            $element.attr('ng-mouseover', 'regionMouseOver()');
            $element.attr('ng-class', '{ active:hoverRegion == elementId }');
            $element.removeAttr('ml-svg-map-region');

            $compile($element)($scope);
        }
    }

    function mlSvgMapColor() {
        return filter;

        function filter() {
            var r = Math.floor((Math.random() * 200) + 50);
            var g = Math.floor((Math.random() * 200) + 50);
            var b = Math.floor((Math.random() * 200) + 50);

            return 'rgba(' + r + ',' + g + ',' + b + ',1)';
        }
    }

}());
(function () {
    'use strict';

    angular.module('ml.todo', [])
        .factory('TodoService', ['localStorageService', '$rootScope', '$filter', TodoService])
        .directive('mlTodoWidget', ['TodoService', TodoWidget])
        .directive('mlTodoFocus', TodoFocus);

    function TodoService(localStorageService, $rootScope, $filter) {
        function Todo($scope) {
            var self = this;
            this.$scope = $scope;
            this.todoFilter = {};
            this.activeTodo = {};
            this.activeFilter = 0;
            this.$scope.timerRunning = false;
            this.$scope.timerRequest = {
                "Id": null,
                "UserId": null,
                "TaskId": null,
                "Started": null,
                "Ended": null
            }
            this.$scope.startTimer = function () {
                self.$scope.timerRequest = {
                    "Id": null,
                    "UserId": self.$scope.todoWebService.userData.userId,
                    "TaskId": self.activeTodo.Id,
                    "Started": new Date().toJSON(),
                    "Ended": null
                }
                self.$scope.todoWebService.startInterval(self.$scope.timerRequest).then(function (res) {
                    console.log(res);
                    self.$scope.timerRequest = res.data;
                    self.$scope.$broadcast('timer-start');
                    self.$scope.timerRunning = true;
                });
            };

            this.$scope.stopTimer = function () {
                self.$scope.timerRequest.Ended = new Date().toJSON();
                self.$scope.todoWebService.stopInterval(self.$scope.timerRequest).then(function (res) {
                    console.log(res);
                    self.$scope.timerRequest = {
                        "Id": null,
                        "UserId": null,
                        "TaskId": null,
                        "Started": null,
                        "Ended": null
                    }
                    self.$scope.$broadcast('timer-stop');
                    self.$scope.timerRunning = false;
                });

            };


            // this.filters = [
            //   {
            //     'title': 'All',
            //     'method': 'all'
            //   },
            //   {
            //     'title': 'Active',
            //     'method': 'active'
            //   },
            //   {
            //     'title': 'Completed',
            //     'method': 'completed'
            //   }
            // ];

            this.newTodoDescription = {
                "todayDescription": "",
                "nextDescription": "",
                "laterDescription": "",
                "editing": false
            }

            this.newTodo = {
                "JobId": null,
                "Description": "",
                "PublicNote": "",
                "PrivateNote": "",
                "Created": "",
                "PosNo": 1,
                "UnitMins": 25,
                "RestMins": 5,
                "UnitsEst": null,
                "UnitsAct": null,
                "SplitOfTaskId": null,
                "DayAllocation": 0,
                "Done": null,
            };

            this.$scope.sprintSortOptions = {

                //restrict move across backlogs. move only within backlog.
                // accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
                //   return sourceItemHandleScope.itemScope.sortableScope.$parent.$parent.backlog.$$hashKey === destSortableScope.$parent.$parent.backlog.$$hashKey;
                // },
                itemMoved: function (event) {
                    var destIndex = event.dest.index;
                    var destModelName = event.dest.sortableScope.element[0].attributes['data-ng-model'].value;
                    var changedTodo;
                    if (destModelName == 'todayTodos') {
                        $scope.todayTodos[destIndex].DayAllocation = 0;
                        changedTodo = $scope.todayTodos[destIndex];
                    }
                    else if (destModelName == 'nextdayTodos') {
                        $scope.nextdayTodos[destIndex].DayAllocation = 1;
                        changedTodo = $scope.nextdayTodos[destIndex]
                    }
                    else if (destModelName == 'laterTodos') {
                        $scope.laterTodos[destIndex].DayAllocation = 2;
                        changedTodo = $scope.laterTodos[destIndex]

                    }
                    self.restore();
                },
                orderChanged: function (event) {
                    console.log("orderChanged");
                    console.log(event);
                    self.restore();
                },
                containment: '#todos_container'
            };

            this.completedTodos = function (dayAllocation) {
                if (dayAllocation === 0) {
                    return $filter('filter')(this.$scope.todayTodos, {Done: null});
                }
                else if (dayAllocation == 1) {
                    return $filter('filter')(this.$scope.nextdayTodos, {Done: null});
                }
                else if (dayAllocation == 2) {
                    return $filter('filter')(this.$scope.laterTodos, {Done: null});
                }

            };
            this._getTodosbyDayAllocation = function (dayAllocation) {
                return $filter('filter')(this.$scope.todos, {DayAllocation: dayAllocation});
            }
            this.getTodosbyDayAllocation = function () {
                this.$scope.todayTodos = this._getTodosbyDayAllocation(0);
                this.$scope.nextdayTodos = this._getTodosbyDayAllocation(1);
                this.$scope.laterTodos = this._getTodosbyDayAllocation(2);
            }

            this.getOpenedTodoCounts = function () {
                this.$scope.openedTodayTodosCount = this.count(0);
                this.$scope.openedNextTodosCount = this.count(1);
                this.$scope.openedLaterTodosCount = this.count(2);
            }

            this.setActiveTodo = function () {
                if (this.activeTodo.Id != this.$scope.todayTodos[0].Id) {
                    this.activeTodo = this.$scope.todayTodos[0];
                    if (this.$scope.timerRunning) {
                        this.$scope.stopTimer();
                    }
                }
                // return this.$scope.activeTodo;
            }

            this.$scope.todoWebService.getTask().then(function (res) {
                console.log(res);
                self.$scope.todos = res.data;
                self.getTodosbyDayAllocation();
                self.restore();
            })


            this.addTodo = function () {
                if (this.todo.Description !== '' && this.todo.Description !== undefined) {
                    console.log(this.todo);
                    this.todo.Created = new Date().toJSON();
                    // this.$scope.todos.push(this.todo);
                    this.$scope.todoWebService.postTask(JSON.stringify(this.todo)).then(function (res) {
                        self.$scope.todos.push(res.data);
                        self.getTodosbyDayAllocation();
                        self.restore();
                    });

                }
            };

            this.updateTodo = function () {
                this.getTodosbyDayAllocation();
                this.restore();
            };
        }

        /*
         * Param: dayAllocation: 0: today, 1: nextday, 2: later
         */
        Todo.prototype.saveTodo = function (dayAllocation) {
            if (dayAllocation === 0) {
                this.todo.Description = this.todoDescription.todayDescription
            }
            else if (dayAllocation == 1) {
                this.todo.Description = this.todoDescription.nextDescription
            }
            else if (dayAllocation == 2) {
                this.todo.Description = this.todoDescription.laterDescription
            }

            if (this.todoDescription.editing) {
                this.updateTodo();
            } else {
                this.todo.DayAllocation = dayAllocation;
                this.addTodo();

                this.focusTodoInput(dayAllocation);
            }
        };

        Todo.prototype.editTodo = function (todo, dayAllocation) {
            console.log(todo);
            this.todo = todo;
            if (dayAllocation === 0) {
                this.todoDescription.todayDescription = this.todo.Description;
            }
            else if (dayAllocation == 1) {
                this.todoDescription.nextDescription = this.todo.Description;
            }
            else if (dayAllocation == 2) {
                this.todoDescription.laterDescription = this.todo.Description;
            }

            this.todoDescription.editing = true;

            this.focusTodoInput(dayAllocation);
        };

        Todo.prototype.focusTodoInput = function (dayAllocation) {
            if (dayAllocation === 0) {
                this.$scope.$broadcast('focusTodayTodoInput');
            }
            else if (dayAllocation == 1) {
                this.$scope.$broadcast('focusNextTodoInput');
            }
            else if (dayAllocation == 2) {
                this.$scope.$broadcast('focusLaterTodoInput');
            }
        }

        Todo.prototype.toggleDone = function (todo) {
            // todo.Done = !todo.Done;
            if (todo.Done === null) {
                todo.Done = new Date().toJSON();
            }
            else {
                todo.Done = null
            }
            this.getOpenedTodoCounts();

        };

        Todo.prototype.showTimer = function (index, todo) {
            var orginTodo = {},
                changedTodo = {};
            if (todo.DayAllocation === 0) {
                this.$scope.todayTodos.splice(index, 1);
            }
            else if (todo.DayAllocation == 1) {
                this.$scope.nextdayTodos.splice(index, 1);
            }
            else if (todo.DayAllocation == 2) {
                this.$scope.laterTodos.splice(index, 1);
            }
            todo.DayAllocation = 0;
            this.$scope.todayTodos.unshift(todo);
            this.getOpenedTodoCounts();
            this.setActiveTodo();
        }

        Todo.prototype.clearCompleted = function () {
            this.$scope.todos = this.completedTodos();
            this.restore();
        };

        Todo.prototype.count = function (dayAllocation) {
            return this.completedTodos(dayAllocation).length;
        };

        Todo.prototype.restore = function () {
            // this.getTodosbyDayAllocation();
            this.getOpenedTodoCounts();
            this.setActiveTodo();
            this.todo = angular.copy(this.newTodo);
            this.todoDescription = angular.copy(this.newTodoDescription);
        };

        Todo.prototype.filter = function (filter) {
            if (filter === 'active') {
                this.activeFilter = 1;
                this.todoFilter = {Done: null};
            } else if (filter === 'completed') {
                this.activeFilter = 2;
                this.todoFilter = {Done: !null};
            } else {
                this.activeFilter = 0;
                this.todoFilter = {};
            }
        };

        return Todo;
    }

    function TodoWidget(TodoService) {
        return {
            restrict: 'EA',
            templateUrl: 'tpl/partials/todo-widget.html',
            replace: true,
            link: link
        };

        function link($scope, $element) {
            $scope.todoService = new TodoService($scope);
        }
    }

    function TodoFocus() {
        return function (scope, elem, attr) {
            scope.$on(attr.mlTodoFocus, function (e) {
                elem[0].focus();
            });
        };
    }

}());
(function () {
    'use strict';

    // Directive: sticky
    //
    angular
        .module('material-lite')
        .directive('mlSticky', sticky);

    function sticky() {
        return {
            restrict: 'A', // this directive can only be used as an attribute.
            link: link
        };

        function link($scope, $element, $attributes) {
            var bodyClass, offset;

            // elements
            bodyClass = $attributes.bodyClass || '';

            offset = typeof $attributes.offset === 'string' ?
                parseInt($attributes.offset.replace(/px;?/, '')) :
                0;

            if (bodyClass) {
                var el = document.getElementsByClassName(bodyClass);
                var length = el.length;
                var container = angular.element(el[length - 1]);

                var t = $element[0].offsetTop;
                var w = $element[0].clientWidth;

                container.on('scroll', function () {
                    if (container[0].scrollTop > t - offset + 30) {

                        $element.css('position', 'fixed')
                            .css('margin-top', 0)
                            .css('top', offset + 'px')
                            .css('max-width', w + 'px');
                    } else {
                        $element.css('position', 'static');
                    }
                });
            }
        }
    }

}());
