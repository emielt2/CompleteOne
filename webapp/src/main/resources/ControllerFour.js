var app = angular.module('appname', []);

app.controller('myControlerFour', function ($scope) {
    $scope.totalTodos = 4;
    $scope.myString = "Hello there";
    $scope.myBoolean = false;

    bedrijfAanmakenBewerken = function () {
        myBoolean=true;
        console.info("aaaa");
        console.log("asdasdasd");
        alert('Login incorrect');
    }


});

