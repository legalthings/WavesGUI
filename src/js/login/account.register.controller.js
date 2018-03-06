(function () {
    'use strict';

    var WALLET_NAME_MAXLENGTH = 16;

    function AccountRegisterController($scope, accountService, cryptoService, loginContext, $http) {
        var ctrl = this;

        ctrl.validationOptions = {
            onfocusout: false,
            rules: {
                walletName: {
                    maxlength: WALLET_NAME_MAXLENGTH
                },
                walletPassword: {
                    required: true,
                    minlength: 8,
                    password: true
                },
                walletPasswordConfirm: {
                    equalTo: '#walletPassword'
                }
            },
            messages: {
                walletName: {
                    maxlength: 'A wallet name is too long. Maximum name length is ' +
                        WALLET_NAME_MAXLENGTH + ' characters'
                },
                walletPassword: {
                    required: 'A password is required to store your seed safely',
                    minlength: 'Password must be 8 characters or longer'
                },
                walletPasswordConfirm: {
                    equalTo: 'Passwords do not match'
                }
            }
        };
        ctrl.saveAccountAndSignIn = saveAccountAndSignIn;
        ctrl.cancel = cancel;
        ctrl.seed = function (seed) {
            return arguments.length ? (loginContext.seed = seed) : loginContext.seed;
        };

        function cleanup() {
            ctrl.name = '';
            ctrl.password = '';
            ctrl.email = '';
            ctrl.confirmPassword = '';
        }

        function saveAccountAndSignIn(form) {
            // TODO: Make call to backend and receive something back;
            if (!form.validate()) {
                return false;
            }

            var data = {
                name: ctrl.name,
                email: ctrl.email,
                password: ctrl.password
            };

            var seed = loginContext.seed;
            var cipher = cryptoService.encryptWalletSeed(seed, ctrl.password).toString();
            var keys = cryptoService.getKeyPair(seed);
            var checksum = cryptoService.seedChecksum(seed);
            var address = cryptoService.buildRawAddress(keys.public);

            var account = {
                name: ctrl.name,
                cipher: cipher,
                checksum: checksum,
                publicKey: keys.public,
                address: address
            };

            accountService.addAccount(account);
            loginContext.notifySignedIn($scope, address, seed, keys);
            cleanup();
            // $http.post('/sven_api', {
            //     email: ctrl.email,
            //     name: ctrl.name,
            //     address: address
            // }).then(function (response) {
            //     accountService.addAccount(account);
            //     loginContext.notifySignedIn($scope, address, seed, keys);
            //     cleanup();
            // }).catch(function(err) {
            //     // TODO: Show ERROR
            //     console.log('Error', err);
            //     cleanup();
            // });
            return true;
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountRegisterController.$inject = ['$scope', 'accountService', 'cryptoService', 'loginContext', '$http'];

    angular
        .module('app.login')
        .controller('accountRegisterController', AccountRegisterController);
})();
