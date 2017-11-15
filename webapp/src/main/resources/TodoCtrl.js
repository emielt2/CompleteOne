///<reference path="angular.min.js"/>
var app = angular.module('appname', []);

var todoCtrl = function ($scope) {
    $scope.messaeg="abcdef"
}

app.controller('todoCtrl', function ($scope) {
    var x = 1;

    $scope.totalTodos = x;
    $scope.myString = "Hello there";
    //callFunctionX();
    callFunctionX = function () {
        // logError();
        console.info("aaaa");
        console.log("asdasdasd");
        x=5;
        this.x=5;
        alert("This is alert "+x);
    }
    callFunctionX();
    x=2;
});

app.controller('MyController', function ($scope) {
    $scope.myString1 = "Hello there";
    $scope.myString2 = "Hello again";
    $scope.myBooleanFalse = false;
    $scope.myBooleanTrue = true;

});

var myController = function ($scope){
    $scope.message = "Angular tutorial";
}