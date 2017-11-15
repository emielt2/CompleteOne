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
        {name:'Jani',country:'Norway',city:'Duckstad1'},
        {name:'Hege',country:'Sweden',city:'Duckstad2'},
        {name:'Kai',country:'Denmark',city:'Duckstad3'},
        {name:newstring(),country:'Denmark',city:'Duckstad4'}
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
    $scope.funcGiveA = function () {
        // logError();
//        alert("This is alert in funcGiveA"+x + " "+this.x);
        console.info("ConsoleLogAAAAAAA");
        alert("This is alert in funcGiveA");
        return "AAAAAAAA";
    }
    function myFunction(p1, p2) {
        return p1 * p2;
    }
    //callFunctionXfive();
    x=2;

    $scope.giveCSSJS = function () {
        return "font-family: Courier; background-color: black"
    }

    $scope.giveRedColor = function (){
    return "color: orange";
    }
});



