var myApp = angular.module('appmodulenamefive', []);

// var pageFiveController = function ($scope) {
//     $scope.message="abcdef"
// }
//
// // myApp.controller('myController', function ($scope) {
// myApp.controller('pageFiveController',pageFiveController);

myApp.controller('pageFiveController', function ($scope) {

    var x = 5;

    $scope.totalTodos = x;
    $scope.myString = "Hello there";
    newstring = function () {
        return "BBBBB";

    }
    $scope.names = [
        {name:'Jani',country:'Norway'},
        {name:'Hege',country:'Sweden'},
        {name:'Kai',country:'Denmark'},
        {name:newstring(),country:'Denmark'}
    ];

    //callFunctionX();
    $scope.callFunctionXfive = function () {
        // logError();
        console.info("aaaa");
        console.log("asdasdasd");
        x=6;
        this.x=7;
        x=99;
        $scope.totalTodos=99;
        // x.
       // alert("This is alert "+x + " "+this.x);
        return "XXXX";
    }
    funcGiveA = function () {
        // logError();
        return "A";
    }
    function myFunction(p1, p2) {
        return p1 * p2;
    }
    //callFunctionXfive();
    x=2;
});



