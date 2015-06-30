'use strict';

/* Services */

angular.module('myApp.services', [])
    .value('FIREBASE_URL', 'https://waitandeat-pk.firebaseio.com/')
    .factory('dataService', function($firebase, FIREBASE_URL) {
        var dataRef = new Firebase(FIREBASE_URL);
        var dataService = $firebase(dataRef);

        return dataService;
    })
    .factory('partyService', function(dataService) {
        var users = dataService.$child('users');

        var serviceObject = {
            saveParty: function(party, userId) {
                users.$child(userId).$child('parties').$add(party);
            },
            getPartiesByUserId: function(userId) {
                return users.$child(userId).$child('parties');
            }

        };

        return serviceObject;
    })
    .factory('textMessageService', function(dataService, partyService) {
        var textMessages = dataService.$child('textMessages');

        var serviceObject = {
            sendTextMessage: function(party, userId) {
                var newTextMessage = {
                    phoneNumber: party.phone,
                    size: party.size,
                    name: party.name
                };
                textMessages.$add(newTextMessage);
                partyService.getPartiesByUserId(userId).$child(party.$id).$update({notified: 'Yes'});
            }
        };

        return serviceObject;
    })
    .factory('authService', function($firebaseSimpleLogin, FIREBASE_URL, $location, $rootScope, dataService) {
        var authRef = new Firebase(FIREBASE_URL);
        var auth = $firebaseSimpleLogin(authRef);
        var emails = dataService.$child('emails');

        var serviceObject = {
            register: function(user) {
                auth.$createUser(user.email, user.password).then(function(data) {
                    console.log(data);
                    serviceObject.login(user, function() {
                        emails.$add({email: user.email});
                    });
                });
            },
            login: function(user, optionalCallback) {
                auth.$login('password', user).then(function (data) {
                    console.log(data);
                    if (optionalCallback) {
                        optionalCallback();
                    }
                    $location.path('/waitlist');
                });
            },
            logout: function() {
                auth.$logout();
                $location.path('/');
            },
            getCurrentUser: function() {
                return auth.$getCurrentUser();
            }

        };

        $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
            $rootScope.currentUser = user;
        });

        $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
            $rootScope.currentUser = null;
        });

        return serviceObject;
    });
