'use strict';
define(['app'], function (app) {

    app.controller('testController', testController);
    testController.$inject = ['basisgegevensService'];

    function testController(basisgegevensService) {

        var vm = this;
        vm.initAfgerondFalse = false;
        vm.initAfgerondTrue = true;

    }
});