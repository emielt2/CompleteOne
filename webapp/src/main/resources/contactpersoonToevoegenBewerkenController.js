'use strict';
/**
 *  Een controller voor de contactpersoon-overlay
 *
 */
define(['app'], function (app) {
    app.controller('contactpersoonToevoegenBewerkenController', contactpersoonToevoegenBewerken);
    contactpersoonToevoegenBewerken.$inject = ['$uibModalInstance', 'basisgegevensService', 'webSocketService', 'REGEX', 'contactpersoon', 'bedrijf'];

    /**
     * Controller over de modal bij het toevoegen en bewerken van een contacpersoon
     * @param $uibModalInstance     Instance van de modal
     * @param basisgegevensService  Rest-service
     * @param REGEX                 Reguliere expressies voor het valideren
     * @param contactpersoon        Het te bewerken contactpersoon
     * @param bedrijf               Het bedrijf waarbij een contactpersoon word toegevoegd
     */
    function contactpersoonToevoegenBewerken($uibModalInstance, basisgegevensService, webSocketService, REGEX, contactpersoon, bedrijf) {

        var vm = this;
        vm.bewerken = false;
        vm.contactpersoon = {};

        if (contactpersoon) {
            vm.bewerken = true;
            vm.contactpersoon = angular.copy(contactpersoon);
            vm.persoonnaam = contactpersoon.naam;
        }

        vm.bedrijf = bedrijf;
        vm.error = {};
        vm.TELEFOON_REGEXP = REGEX.TELEFOON_REGEXP;
        vm.EMAIL_REGEXP = REGEX.EMAIL_REGEXP;

        vm.onBlur = function () {
            vm.error.telefoonnummer = vm.contactpersoonForm.telefoonnummer.$error.pattern;
            vm.error.emailadres = vm.contactpersoonForm.emailadres.$error.pattern;
            vm.error.faxnummer = vm.contactpersoonForm.faxnummer.$error.pattern;
            vm.error.eenIsVerplicht = vm.contactpersoonForm.telefoonnummer.$error.required || vm.contactpersoonForm.emailadres.$error.required || vm.contactpersoonForm.faxnummer.$error.required;
        };


        vm.ok = function () {
            webSocketService.localEvent('WIJZIGING', 'CONTACTPERSOON_BIJ_BEDRIJF', basisgegevensService.getGetoondBedrijf().id);
            if (vm.bewerken) {
                basisgegevensService.wijzigenContactpersoon(vm.contactpersoon).then(function () {
                    $uibModalInstance.close();
                });
            } else {
                basisgegevensService.toevoegenContactpersoonAanBedrijf(vm.contactpersoon, vm.bedrijf.id).then(function () {
                    $uibModalInstance.close();
                });
            }
        };

        /**
         * Word aangeroepen wanneer er op de 'cancel'-knop word geklikt. Hiermee word de overlay gesloten.
         */
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    app.controller('contactpersoonToevoegenBewerkenLinkController', contactpersoonToevoegenBewerkenLinkController);
    contactpersoonToevoegenBewerkenLinkController.$inject = ['$uibModal', '$translate', 'basisgegevensService', 'esuiteModalService'];

    /**
     * Een link controller om de modal te openen
     *
     * @param $uibModal             Bootstrap modal
     * @param $translate            Vertalings module
     * @param basisgegevensService  Rest-service
     * @param esuiteModalService    Modal service voor het openen van een confirm-modal
     */
    function contactpersoonToevoegenBewerkenLinkController($uibModal, $translate, basisgegevensService, esuiteModalService) {

        var vm = this;

        vm.openOverlayContactpersoonToevoegenBewerken = function (contactpersoon, bedrijf) {

            var modalInstance = $uibModal.open({
                templateUrl: '/mp/components/basisgegevens/views/contactpersoonToevoegenBewerken.html',
                controller: 'contactpersoonToevoegenBewerkenController',
                controllerAs: 'cptbc',
                size: 'sm',
                resolve: {
                    contactpersoon: function () {
                        return contactpersoon;
                    },
                    bedrijf: function () {
                        return bedrijf;
                    }
                }
            });

            modalInstance.result.then(function () {
                basisgegevensService.updateGetoondBedrijf();
            });
        };

        vm.openOverlayVerwijderen = function (contactpersoon, bedrijfsnaam) {

            var modalInstance = esuiteModalService.openConfirmModal({
                'header': {
                    'title': 'contactpersoon.header.verwijderen',
                    'title2': contactpersoon.naam
                },
                'body': $translate.instant('contactpersoon.verwijderen.melding', {
                    'contactpersoonNaam': contactpersoon.naam,
                    'bedrijfsnaam': bedrijfsnaam
                })
            });

            modalInstance.then(function () {
                basisgegevensService.verwijderContactpersoon(contactpersoon).then(function () {
                    basisgegevensService.updateGetoondBedrijf();
                });
            });
        };
    }
});
