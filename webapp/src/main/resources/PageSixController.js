var myApp = angular.module("myAppSix", []);
myApp.directive("w3TestDirective", function() {
    return {
        template : "<h1>Made by a directive!</h1><h2>H2</h2>"
    };
});

myApp.controller('pageSixController', function ($scope) {

});




//https://www.w3schools.com/angular/angular_directives.asp
