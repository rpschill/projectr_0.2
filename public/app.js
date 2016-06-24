var app = angular.module('app',['ngRoute', 'firebase']);

/*app.run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
        if (error === 'AUTH_REQUIRED') {
            $location.path('/login');
        }
    });
}]);*/

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider

    .when ('/', {
        templateUrl : 'views/main.html',
       /* resolve: {
            'currentAuth': ['Auth', function(Auth) {
                return Auth.$requireSignIn();
            }]
        }*/
    })

    .when ('/login', {
        templateUrl : 'views/login.html'
    })
}]);

app.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
    return $firebaseAuth();
}]);

app.factory('Projects',)

app.controller('userAuth', ['$scope', 'Auth', function($scope, Auth) {
    $scope.auth = Auth;

    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
        $scope.firebaseUser = firebaseUser;
    });

    $scope.email = null;
    $scope.password = null;

    $scope.signIn = function() {
        $scope.auth.$signInWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
            console.log('Signed in as:', firebaseUser.uid);
        }).catch(function(error) {
            console.error('Authentication failed:', error);
        });

        $scope.email = null;
        $scope.password = null;
    };

    $scope.register = function() {
        $scope.auth.$createUserWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
            console.log('User ' + firebaseUser.uid + ' created successfully!');
        }).catch(function(error) {
            console.error('Error: ', error);
        });

        $scope.email = null;
        $scope.password = null;
    };

}]);

app.controller('projectCtrl',['$scope', '$firebaseArray', function($scope, $firebaseArray) {

}])