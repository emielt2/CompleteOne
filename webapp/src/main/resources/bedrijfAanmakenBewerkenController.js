'use strict';
/**
 *  Een controller voor de bedrijfAanmakenBewerken-overlay
 *
 */
define(['app'], function (app) {

    app.controller('bedrijfAanmakenBewerkenController', bedrijfAanmakenBewerkenController);
    bedrijfAanmakenBewerkenController.$inject = ['$filter', '$uibModalInstance', 'basisgegevensService', 'webSocketService', 'configuratieService', 'basisgegevensReferentieService', 'esuiteUtilService', 'REGEX', '$scope', '$q'];

    /**
     * bedrijfAanmakenBewerken controller
     *
     * @param $filter                           voor het gebruik van angular filters
     * @param $uibModalInstance,                nodig voor het sluiten van het scherm (Bootstrap.modalInstance)
     * @param basisgegevensService,             verwijzing naar de BasisgegevensService om REST-calls uit te kunnen voeren
     * @param basisgegevensReferentieService,   verwijzing naar de basisgegevensReferentieService om REST-calls uit te kunnen voeren
     * @param webSocketService                  service voor het afhandelen van websockets
     * @param configuratieService               service voor het opvargen van esuite configuratie
     * @param esuiteUtilService                 EsuiteUtilService voor utilities
     * @param REGEX                             Bevat reguliere expressies ter validatie van velden
     * @param $scope,                           verwijzing naar variabelen en functions die beschikbaar in het template
     * @param $q,                               Angular's $q om promises te que-en
     */
    function bedrijfAanmakenBewerkenController($filter, $uibModalInstance, basisgegevensService, webSocketService, configuratieService, basisgegevensReferentieService, esuiteUtilService, REGEX, $scope, $q) {

        var vm = this;

        vm.bewerken = basisgegevensService.getGetoondBedrijf() != null;

        vm.error = {};
        vm.heeftErrors = false;
        vm.bezigMetOpslaan = false;

        vm.vestigingsdatumOpen = false;
        vm.vandaag = new Date();
        vm.vestigingsdatumOpties = {
            maxDate: vm.vandaag
        };

        vm.bedrijf = {};
        vm.vestigingsdatum = {};
        vm.nevenactiviteit = {};
        vm.adres = {};
        vm.datumFormaat = 'dd MMMM yyyy';
        vm.toegestaneDatumFormaten = defaultDatumFormaten;
        vm.TELEFOON_REGEXP = REGEX.TELEFOON_REGEXP;
        vm.EMAIL_REGEXP = REGEX.EMAIL_REGEXP;
        vm.POSTCODE_REGEXP = REGEX.POSTCODE_REGEXP;
        vm.ALLEEN_GETALLEN = REGEX.ALLEEN_GETALLEN;
        vm.ALLEEN_NUMMERS_ZONDER_VOORLOOPNULLEN = REGEX.ALLEEN_NUMMERS_ZONDER_VOORLOOPNULLEN;
        vm.KVK_SIZE = 8;
        vm.VESTIGING_SIZE = 12;

        vm.rechtsvormen = [];
        vm.hoofdactiviteiten = [];
        vm.nevenactiviteiten = [];
        vm.vestigingsstatussen = [];

        vm.nederland = {};

        vm.tabAlgemeen = 0;
        vm.tabAdres = 1;
        vm.tabAanvullend = 2;

        vm.activeTab = vm.tabAlgemeen;

        init();
        function init() {
            $q.all({
                'bedrijf': basisgegevensService.getAanmakenBedrijf(),
                'landen': basisgegevensReferentieService.ophalenActieveLanden(),
                'rechtsvormen': basisgegevensReferentieService.ophalenActieveRechtsvormen(),
                'hoofdactiviteiten': basisgegevensReferentieService.ophalenActieveHoofdactiviteiten(),
                'nevenactiviteiten': basisgegevensReferentieService.ophalenActieveNevenactiviteiten(),
                'vestigingsstatussen': basisgegevensReferentieService.ophalenVestigingsstatussen(),
                'postcodeZoekerIngeschakeld': configuratieService.isPostcodeZoekerIngeschakeld()
            }).then(function ($data) {
                //Bedrijfgegevens
                vm.bedrijf = vm.bewerken ? angular.copy(basisgegevensService.getGetoondBedrijf()) : $data.bedrijf.data;
                vm.vestigingsdatum = $filter('onvolledigeDatum')(vm.bedrijf.vestigingsdatum);
                vm.nevenactiviteit = vm.bedrijf.nevenactiviteiten[0];
                vm.isPostcodeZoekerIngeschakeld = $data.postcodeZoekerIngeschakeld.data;

                bepaalAdres();

                //Lijsten
                vm.landen = $data.landen.data;
                vm.rechtsvormen = $data.rechtsvormen.data;
                vm.hoofdactiviteiten = $data.hoofdactiviteiten.data;
                vm.nevenactiviteiten = $data.nevenactiviteiten.data;
                vm.vestigingsstatussen = $data.vestigingsstatussen.data;

                for (var i = 0; i < vm.landen.length; i++) {
                    if (vm.landen[i].gbaCode == '6030') {
                        vm.nederland = vm.landen[i];
                        break;
                    }
                }
            });
        }

        /**
         * Bepaald het te wijzigen adres in Bedrijf.
         *
         * Als er meerdere adressen zijn gevonden word er gekeken of hier een Vestigingsadres in zit. Wanneer deze niet gevonden kan worden word altijd de
         * eerste genomen.
         */
        function bepaalAdres() {
            for (var i = 0; i < vm.bedrijf.adreskoppelingen.length; i++) {
                if (vm.bedrijf.adreskoppelingen[i].adresType == 'VESTIGINGS_ADRES') {
                    vm.adres = vm.bedrijf.adreskoppelingen[i];
                    return;
                }
            }

            if (vm.bedrijf.adreskoppelingen.length > 0) {
                vm.adres = vm.bedrijf.adreskoppelingen[0];
            }
        }

        /**
         * Bepaald of het adres in het modal een Nederlands adres is
         *
         * @returns {boolean}
         */
        vm.isNederlandsAdres = function () {
            return vm.adres && vm.adres.land && vm.adres.land.gbaCode == '6030';
        };

        /**
         * Het bewerken van een bedrijf.
         */
        vm.aanmakenBewerkenBedrijf = function () {
            vm.bezigMetOpslaan = true;

            //bepaal opnieuw of het nog om een nederlandsadres gaat.
            vm.adres.nederlandsAdres = vm.isNederlandsAdres();

            var gewijzigdBedrijf = angular.copy(vm.bedrijf);

            gewijzigdBedrijf.nevenactiviteiten[0] = vm.nevenactiviteit;

            //De vestigingsdatum in het juiste formaat opslaan
            if (vm.vestigingsdatum) {
                gewijzigdBedrijf.vestigingsdatum = $filter('onvolledigeDatum')(vm.vestigingsdatum);
            } else {
                gewijzigdBedrijf.vestigingsdatum = {};
            }

            if (vm.bewerken) {
                webSocketService.localEvent('WIJZIGING', 'SUBJECT', basisgegevensService.getGetoondBedrijf().id);
                delete gewijzigdBedrijf.messages;
                basisgegevensService.bewerkenBedrijf(gewijzigdBedrijf).then(function ($bewerkenBedrijfResultaat) {
                    angular.merge(basisgegevensService.getGetoondBedrijf(), $bewerkenBedrijfResultaat.data);

                    if (basisgegevensService.getView().geselecteerdSubject != null &&
                        basisgegevensService.getGetoondBedrijf().id == basisgegevensService.getView().geselecteerdSubject.id) {
                        basisgegevensService.getView().geselecteerdSubject = $bewerkenBedrijfResultaat.data;
                    }

                    $uibModalInstance.close($bewerkenBedrijfResultaat.data, vm.bewerken);
                });
            } else {
                basisgegevensService.postAanmakenBedrijf(gewijzigdBedrijf).then(function ($aanmakenBedrijfResultaat) {
                    if ($aanmakenBedrijfResultaat.data.id) {
                        $uibModalInstance.close($aanmakenBedrijfResultaat.data, vm.bewerken);
                    } else {
                        vm.bezigMetOpslaan = false;
                    }
                });
            }
        };

        /**
         * Bepaald of er errors zijn gevonden in vm.error.
         *
         * @returns {boolean}
         */
        $scope.$watchCollection(angular.bind(this, function () {
            return vm.error;
        }), function () {
            for (var property in vm.error) {
                if (vm.error.hasOwnProperty(property) && vm.error[property]) {
                    vm.heeftErrors = true;
                    return;
                }
            }
            vm.heeftErrors = false;
        });

        function isNullOrEmpty(value) {
            return angular.isUndefined(value) || value == null || value == '';
        }


        $scope.$watch('bac.bedrijf.bedrijfsIdentificatienummer.vestigingsnummer', function (newValue) {

            //Het veld is leeg of het veld is gelijk aan het te bewerken bedrijf
            if (isNullOrEmpty(newValue) || vm.bewerken && basisgegevensService.getGetoondBedrijf().bedrijfsIdentificatienummer.vestigingsnummer == newValue) {
                vm.error.bedrijfMetVestigingsnummerBestaatAl = false;
                return;
            }

            basisgegevensService.bestaatBedrijf_vestigingsnummer(newValue).then(function (result) {
                vm.error.bedrijfMetVestigingsnummerBestaatAl = (result.data == 'BEDRIJF_MET_BEDRIJFIDENTIFICATIENUMMER_BESTAAT');
                if (result.data == 'ONGELDIG_BEDRIJFIDENTIFICATIENUMMER') {
                    vm.error.ongeldigVestigingsnummer = true;
                }
            });
        });

        $scope.$watch('bac.bedrijf.bedrijfsIdentificatienummer.kvkNummer', function (newValue) {

            //Het veld is leeg of het veld is gelijk aan het te bewerken bedrijf
            if (isNullOrEmpty(newValue) || vm.bewerken && basisgegevensService.getGetoondBedrijf().bedrijfsIdentificatienummer.kvkNummer == newValue) {
                vm.bedrijfMetKvknummerBestaatAl = false;
                return;
            }

            basisgegevensService.bestaatBedrijf_kvknummer(newValue).then(function (result) {
                vm.bedrijfMetKvknummerBestaatAl = (result.data == 'BEDRIJF_MET_BEDRIJFIDENTIFICATIENUMMER_BESTAAT');
                if (result.data == 'ONGELDIG_BEDRIJFIDENTIFICATIENUMMER') {
                    vm.error.ongeldigKvknummer = true;
                }
            });
        });
        /**
         *
         * Toon de errormeldingen pas na een onblur, (als deze er zijn)
         */
        vm.checkCompanyOnBlur = function () {
            //Controle op minimale lengte en pattern, om meldingen te laten zien
            vm.error.ongeldigVestigingsnummer = vm.algemeneGegevensForm.vestigingsnummer.$error.minlength || vm.algemeneGegevensForm.vestigingsnummer.$error.pattern;
            vm.error.ongeldigKvknummer = vm.algemeneGegevensForm.kvk.$error.minlength || vm.algemeneGegevensForm.kvk.$error.pattern;
        };

        /**
         * Bij het verlaten van de velden telefoonnummer, emailadres wordt deze methode aangeroepen om zo de validatie uit te voeren
         * bedrijfBewerkenForm is de naam van het form zoals gedefinieerd in de html bij ngForm
         */
        vm.onBlur = function () {
            if (vm.algemeneGegevensForm.rsin) {
                vm.error.rsin = vm.algemeneGegevensForm.rsin.$invalid;
            }
            if (vm.aanvullendeGegevensForm.telefoonnummer) {
                vm.error.telefoonnummer = vm.aanvullendeGegevensForm.telefoonnummer.$invalid;
            }
            if (vm.aanvullendeGegevensForm.telefoonnummerAlt) {
                vm.error.telefoonnummerAlternatief = vm.aanvullendeGegevensForm.telefoonnummerAlt.$invalid;
            }

            if (vm.aanvullendeGegevensForm.faxnummer) {
                vm.error.faxnummer = vm.aanvullendeGegevensForm.faxnummer.$invalid;
            }

            if (vm.aanvullendeGegevensForm.emailadres) {
                vm.error.emailadres = vm.aanvullendeGegevensForm.emailadres.$invalid;
            }

            if (vm.algemeneGegevensForm.aantalWerknemers) {
                vm.error.ongeldigAantalWerknemers = vm.algemeneGegevensForm.aantalWerknemers.$invalid;
            }

            if (vm.algemeneGegevensForm.vestigingsdatum) {
                vm.error.vestigingsdatumNietGeldig = vm.algemeneGegevensForm.vestigingsdatum.$invalid;
            }
        };

        /**
         * Opent de datumPopup voor vestigingsdatum
         */
        vm.vestigingsdatumOpenen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.vestigingsdatumOpen = true;
        };

        /**
         * Valideer of de vestigingsdatum niet in de toekomst ligt
         */
        $scope.$watch('bac.vestigingsdatum', function () {
            vm.error.vestigingsdatumToekomst = esuiteUtilService.trunkTime(vm.vestigingsdatum) > esuiteUtilService.trunkTime(vm.vandaag);
        });

        vm.bezigMetOphalenAdres = false;
        vm.ophalenadres = function () {
            vm.bezigMetOphalenAdres = true;
            basisgegevensService.opzoekenAdresViaPostcodeZoeker(vm.adres).then(function (adresAangevuld) {
                angular.merge(vm.adres, adresAangevuld.data);
                vm.bezigMetOphalenAdres = false;
            });
        };

        /**
         * Houdt bij wanneer er een buitenlandsbedrijf word gewijzigd
         */
        vm.buitenlandsbedrijfChanged = function () {
            //Van nederlands naar buitenlands bedrijf
            if (vm.bedrijf.buitenlandsbedrijf && vm.isNederlandsAdres()) {
                vm.adres.land = '';
            }

            //van buitenlands naar nederlands
            if (!vm.bedrijf.buitenlandsbedrijf && !vm.isNederlandsAdres()) {
                vm.adres.land = vm.nederland;
            }
        };

        /**
         * Bij een nederlands valideer extra velden
         */
        vm.onBlurNederlandsAdres = function () {
            if (vm.adresGegevensForm.postcode) {
                //Hierdoor wordt eerst de waarde op het scherm bijgewerkt en daarna wordt pas het pattern gecontroleerd.
                vm.adresGegevensForm.postcode.$setViewValue(angular.uppercase(vm.adresGegevensForm.postcode.$viewValue));
                vm.adresGegevensForm.postcode.$render();

                vm.error.postcode = vm.adresGegevensForm.postcode.$error.pattern;
            }

            if (vm.adresGegevensForm.huisnummer) {
                vm.error.huisnummer = vm.adresGegevensForm.huisnummer.$error.pattern;
            }
        };

        /**
         * Word aangeroepen wanneer er op de 'cancel'-knop word geklikt. Hiermee word de overlay gesloten.
         */
        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }

    app.controller('bedrijfAanmakenBewerkenLinkController', bedrijfAanmakenBewerkenLinkController);
    bedrijfAanmakenBewerkenLinkController.$inject = ['$state', '$uibModal'];

    /**
     * bedrijfAanmakenBewerken LINK controller
     *
     * @param $state, state provider for navigating
     * @param $uibModal, bootstrap modal
     */
    function bedrijfAanmakenBewerkenLinkController($state, $uibModal) {

        var vm = this;
        /**
         * Modal voor het bedrijfAanmakenBewerken
         */
        vm.bedrijfAanmakenBewerken = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '/mp/components/basisgegevens/views/bedrijfAanmakenBewerken.html',
                controller: 'bedrijfAanmakenBewerkenController',
                controllerAs: 'bac'
            });

            modalInstance.result.then(function (bedrijfResultaat, bewerken) {
                if (!bewerken) {
                    $state.go('bedrijf', {bedrijfTID: bedrijfResultaat.id, selecteer: false});
                }
            });
        };
    }
});
