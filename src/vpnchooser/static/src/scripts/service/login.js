vpnChooserApp.factory('UserService', function ($http, $q, $base64, localStorageService) {

    var userService = {
        name: null,
        api_key: null,
        is_admin: false,

        check_current: function() {
            return $http({
                method: 'GET',
                url: '/users/' + name
            });
        },

        initFromLocalStorage: function() {
            var self = this;
            if(localStorageService.isSupported) {
                var api_key = localStorageService.get('api_key'),
                    user_name = localStorageService.get('user_name')
                ;
                if(user_name && api_key) {
                    self.setApiKey(user_name, api_key);
                }
            }
        },

        setApiKey: function(user_name, api_key) {
            var self = this;
            $http.defaults.headers.common.Authorization = 'Basic ' + $base64.encode(
                 user_name + ':' + api_key
            );
            if(localStorageService.isSupported) {
                localStorageService.set('user_name', user_name);
                localStorageService.set('api_key', api_key);
            }
            self.user_name = user_name;
            self.api_key = api_key;
        },

        isAuthenticated: function() {
            var self = this,
                defer = $q.defer()
            ;

            if(self.user_name) {
                $http({
                    method: 'GET',
                    url: '/users/' + self.user_name
                }).success(function(data, status) {
                    if(status != 200 || !data || !data.api_key) {
                        defer.reject();
                    }
                    else {
                        defer.resolve();
                    }
                });
            } else {
                defer.reject();
            }
            return defer.promise;
        },

        login: function (name, password) {
            var self = this,
                defer = $q.defer();
            self.name = name;

                $http({
                    method: 'GET',
                    url: '/users/' + name,
                    headers: {
                        'Authorization': 'Basic ' + $base64.encode(name + ':' + password)
                    }
                }).success(function (data, status) {
                    if (status != 200 || !data || !data.api_key) {
                        defer.reject();
                    }
                    var api_key = data.api_key;
                    self.is_admin = data.is_admin;

                    self.setApiKey(name, api_key);
                    defer.resolve();

                }).error(function () {
                    $http.defaults.headers.common.Authorization = null;
                    defer.reject();
                });

            return defer.promise;
        }
    };

    userService.initFromLocalStorage();
    return userService;

});
