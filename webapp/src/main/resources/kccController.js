'use strict';
/**
 *  Een controller voor de KCC hoofdpagina (zoekpagina)
 *
 */
define(['app'], function (app) {

    app.controller('kccController', kccController);
    kccController.$inject = ['$translate',];

    function kccController($translate) {


        $translate('kcc.title').then(function (title) {
            esuiteMpService.setTitle(title);
        });

    }
});
