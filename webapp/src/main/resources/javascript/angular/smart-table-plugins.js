(function () {
    var app = angular.module('smart-table');
    app.directive('bsPagination', function () {
        return {
            restrict: 'EA',
            require: '^stTable',
            scope: {
                totalItems: '=', // total-items; totaal aantal items in de tabel
                itemsPerPage: '=?', // items-per-page: maximaal aantal items per pagina van de tabel (default 5)
                maxSize: '=?' // max-size: maximaal aantal getoonde paginaknoppen (default 5)
                // direction-links, previous-text, next-text: vorige en volgende knoppen
                // boundary-links, first-tekst, last-text: eerste en laatste knoppen
                // rotation: huidige pagina in het midden houden
            },
            template: '<ul uib-pagination ng-show="showPages" ng-model="currentPage" ng-change="pageChanged()" total-items="totalItems"' +
            ' items-per-page="itemsPerPage" max-size="maxSize" direction-links="true" boundary-links="true" rotate="true"' +
            ' first-text="{{ \'paginering.eerste\' | translate }}" previous-text="{{ \'paginering.vorige\' | translate }}" next-text="{{' +
            ' \'paginering.volgende\' | translate }}"' +
            ' last-text="{{ \'paginering.laatste\' | translate }}"></ul>',
            link: function (scope, element, attrs, ctrl) {
                scope.itemsPerPage = scope.itemsPerPage || 5;
                scope.maxSize = scope.maxSize || 5;
                scope.numPages = 0;
                scope.showPages = false;
                scope.currentPage = 1;

                function redraw() {
                    var paginationState = ctrl.tableState().pagination;
                    scope.numPages = scope.totalItems < 1 ? 0 : scope.itemsPerPage < 1 ? 1 : Math.ceil(scope.totalItems / scope.itemsPerPage);
                    scope.showPages = 1 < scope.numPages;
                    scope.currentPage = Math.floor(paginationState.start / paginationState.number) + 1;
                }

                scope.$watch('totalItems', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        redraw();
                    }
                });

                scope.$watch('itemsPerPage', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        redraw();
                    }
                });

                scope.$watch(function () {
                    return ctrl.tableState().pagination;
                }, function (newValue, oldValue) {
                    if (newValue.start !== oldValue.start || newValue.number !== oldValue.number) {
                        redraw();
                    }
                }, true);

                scope.pageChanged = function () {
                    if (0 < scope.currentPage && scope.currentPage <= scope.numPages) {
                        ctrl.slice((scope.currentPage - 1) * scope.itemsPerPage, scope.itemsPerPage);
                    }
                };
                scope.pageChanged();
            }
        };
    }).directive('stRatio', function () {
        return {
            link: function (scope, element, attr) {
                var ratio = +(attr.stRatio);
                element.css('width', ratio + '%');
            }
        };
    }).directive('onFilter', function () {
        return {
            require: '^stTable',
            scope: {
                onFilter: '='
            },
            link: function (scope, element, attr, table) {
                scope.$watch(function () {
                    return table.tableState().search;
                }, function () {
                    scope.onFilter(table);
                }, true);
            }
        };
    }).directive('selectGekoppeldOntkoppeld', [function () {
        /**
         * Een select directive te gebruiken bij de custom Filter: smart-table-plugins.js#gekoppeldOntkoppeldFilter
         * Deze select zorgt ervoor dat er een selectie box komt met de waarden [Alle, Gekoppeld, Ontkoppeld]
         */
        return {
            restrict: 'E',
            require: '^stTable',
            scope: {
                selectedObject: '=',
                predicate: '@',
                defaultOption: '@'
            },
            template: '<select class="width-100" ng-model="selectedOption" ng-change="optionChanged()" ' +
            'ng-options="opt | translate for opt in options"><option value="" translate="-alle-"></option></select>',
            link: function (scope, element, attr, table) {

                scope.optionChanged = optionChanged;
                init();

                function init() {
                    scope.options = ['Gekoppeld', 'Ontkoppeld'];
                    scope.selectedOption = scope.defaultOption;
                    scope.optionChanged();
                }

                function optionChanged() {
                    var query = {
                        matchAny: {}
                    };

                    var keys = [];
                    for (var key in scope.selectedObject) {
                        if (scope.selectedObject[key]) {
                            keys.push(key);
                        }
                    }

                    query.matchAny.items = keys;
                    if (!scope.selectedOption) {
                        query.matchAny.all = true;
                    } else {
                        if (scope.selectedOption == 'Ontkoppeld') {
                            query.matchAny.reverse = true;
                        }
                    }

                    table.search(query, scope.predicate);
                }

            }
        };
    }]).directive('stSelectDistinct', [function () {
        /**
         * Een select directive te gebruiken bij de custom Filter: smart-table-plugins.js#gekoppeldOntkoppeldFilter
         * Deze select zorgt ervoor dat er correct word gefilterd aan de hand van de selectie lijst.
         */
        return {
            restrict: 'E',
            require: '^stTable',
            scope: {
                collection: '=',
                predicate: '@'
            },
            template: '<select class="width-330" ng-model="selectedOption" ng-change="optionChanged(selectedOption)" ng-options="opt for opt in distinctItems">' +
            '<option value="" translate="-alle-"></option></select>',
            link: function (scope, element, attr, table) {

                scope.$watch('collection', function (newValue) {
                    if (newValue) {
                        var temp = [];
                        scope.distinctItems = [];

                        angular.forEach(scope.collection, function (item) {
                            var value = item[scope.predicate];

                            if (value && value.trim().length > 0 && temp.indexOf(value) === -1) {
                                temp.push(value);
                            }
                        });
                        temp.sort();

                        scope.distinctItems = scope.distinctItems.concat(temp);
                        scope.selectedOption = null;
                        scope.optionChanged(scope.selectedOption);
                    }
                }, true);

                scope.optionChanged = function (selectedOption) {
                    var query = {};

                    query.distinct = selectedOption;

                    if (!selectedOption) {
                        query.distinct = '';
                    }

                    table.search(query, scope.predicate);
                };
            }
        };
    }]).filter('gekoppeldOntkoppeldFilter', ['$filter', function ($filter) {

        /**
         * Custom filter voor smarttable lijsten waar een gekoppeld/ontkoppeld selectie box bij zit.
         * Deze filter zorgt ervoor dat de juiste resultaten worden weergegeven (geselecteerd/niet geselecteerd)
         */

        var filterFilter = $filter('filter');
        var standardComparator = function standardComparator(obj, text) {
            text = ('' + text).toLowerCase();
            return ('' + obj).toLowerCase().indexOf(text) > -1;
        };

        return function customFilter(array, expression) {
            function customComparator(actual, expected) {

                if (angular.isObject(expected)) {
                    if (expected.distinct) {
                        if (!actual || actual.toLowerCase() !== expected.distinct.toLowerCase()) {
                            return false;
                        }
                        return true;
                    }

                    if (expected.matchAny) {
                        if (expected.matchAny.all) {
                            return true;
                        }

                        if (!actual) {
                            return false;
                        }

                        for (var i = 0; i < expected.matchAny.items.length; i++) {
                            if (actual.toLowerCase() == expected.matchAny.items[i].toLowerCase()) {
                                return !expected.matchAny.reverse;
                            }
                        }

                        return expected.matchAny.reverse;
                    }
                    return true;
                }
                return standardComparator(actual, expected);
            }

            return filterFilter(array, expression, customComparator);
        };
    }]);
})();
