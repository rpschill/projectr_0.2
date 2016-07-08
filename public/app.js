var app = angular.module('app',['ngRoute', 'ngAnimate', 'firebase']);

/* Looks at auth object and if user not logged in, redirects to login page */

app.run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
        if (error === 'AUTH_REQUIRED') {
            $location.path('/login');
        }
    });
}]);

app.config(['$routeProvider', function($routeProvider) {

/* Firebase config code */

	var config = {
                apiKey: "AIzaSyCFT4fjJtYxQwr9fGYY95YL1e-7mqjj2hM",
                authDomain: "project-7288100014883596985.firebaseapp.com",
                databaseURL: "https://project-7288100014883596985.firebaseio.com",
                storageBucket: "",
            };
            firebase.initializeApp(config);


/* Routing */

$routeProvider

    .when ('/', {
       templateUrl : 'views/profileView.html',
       resolve: {
            'currentAuth': ['Auth', function(Auth) {
                return Auth.$requireSignIn();
            }]
        }
    })

    .when ('/login', {
        templateUrl : 'views/loginView.html',
		resolve: {
			'currentAuth': ['Auth', '$location', function(Auth, $location) {
				return Auth.$waitForSignIn();
			}]
		}
    })

	.when ('/profile', {
		templateUrl : 'views/profileView.html',
		resolve: {
			'currentAuth': ['Auth', '$location', function(Auth, $location) {
				return Auth.$requireSignIn();
			}]
		}
	})

	.when ('/:projId', {
		templateUrl : 'views/appView.html',
		resolve: {
			'currentAuth': ['Auth', '$location', function(Auth, $location) {
				return Auth.$requireSignIn();
			}]
		}
	})
}]);

app.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
    return $firebaseAuth();
}]);

app.factory('Projects', ['$firebaseArray', 'Auth', function($firebaseArray, Auth) {
	var auth = Auth.$getAuth();
	var user = auth.uid;
	var projectsRef = firebase.database().ref().child('projects');
	var query = projectsRef.orderByChild('user_id').equalTo(user);
	var projects = $firebaseArray(query);
	return projects;
}]);

app.factory('Items', ['$firebaseArray', 'Auth', function($firebaseArray, Auth) {
	var auth = Auth.$getAuth();
	var user = auth.uid;
	var ref = firebase.database().ref().child('items');
	var query = ref.orderByChild('user_id').equalTo(user);
	var list = $firebaseArray(query);

	return list;
}])

app.controller('appCtrl',['$location', function($location) {
	var vm = this;

	vm.projectsShow = false;
	vm.timersShow = false;
	vm.addProjectShow = false;
	vm.addItemShow = false;
}])

app.controller('userAuth', ['Auth', '$location', '$timeout', '$firebaseObject', 'Projects', function(Auth, $location, $timeout, $firebaseObject, Projects) {
    var vm = this;
	vm.auth = Auth;
	vm.user = vm.auth.$getAuth();

	vm.projects = Projects;

    vm.email = null;
    vm.password = null;

    vm.signIn = function() {
        vm.auth.$signInWithEmailAndPassword(vm.email, vm.password).then(function(firebaseUser) {
            console.log('Signed in as:', firebaseUser.uid);
			$state.go('profile');
        }).catch(function(error) {
            console.error('Authentication failed:', error);
        });

        vm.email = null;
        vm.password = null;
    };

    vm.register = function() {
        vm.auth.$createUserWithEmailAndPassword(vm.email, vm.password).then(function(firebaseUser) {
            console.log('User ' + firebaseUser.uid + ' created successfully!');
        }).catch(function(error) {
            console.error('Error: ', error);
        });

        vm.email = null;
        vm.password = null;
    };

	vm.signOut = function() {
		vm.auth.$signOut();
		console.log('User signed out.');
		$timeout(function() {
			$location.path('/login');
		}, 1000);
	};

	vm.displayName = null;
	vm.profileEdit = false;

	vm.updateProfile = function() {
		vm.user.updateProfile({
			displayName: vm.displayName
		});
	};

	vm.newEmail = null;

	vm.updateEmail = function(newEmail) {
		vm.user.updateEmail(newEmail)
	};

}]);

app.controller('projectCtrl', ['$firebaseArray', 'Auth', 'Projects', function($firebaseArray, Auth, Projects) {
	var vm = this;

	vm.projects = Projects;

	vm.auth = Auth;
	vm.user = vm.auth.$getAuth();
	vm.user_id = vm.user.uid;

	vm.projTitle = null;

	vm.newProject = function() {

		vm.projects.$add({
			title: vm.projTitle,
			user_id: vm.user_id
		}).then(function(Projects) {
			var id = Projects.key();

		})
		vm.projTitle = null;
	};

	vm.deleteProject = function(project) {
		vm.projects.$remove(project).then(function(Projects) {
			Projects.key() === vm.projects.$id;
		});
	};
}]);

app.controller('listCtrl', ['$firebaseArray', '$firebaseObject', 'Auth', '$routeParams', 'Items', function($firebaseArray, $firebaseObject, Auth, $routeParams, Items) {
	var vm = this;

	var projectId = $routeParams.projId;
	var projects = firebase.database().ref().child('projects');
	var projectRef = projects.child(projectId);
	vm.project = $firebaseObject(projectRef);
	vm.projTitle = vm.project.title;

	var auth = Auth.$getAuth();
	var user = auth.uid;

	vm.projFilter = function(item) {
		return item.project_id == projectId ? true : false;
	};

	vm.list = Items;

	vm.newItem = null;

	vm.addItem = function() {
		vm.list.$add({
			content: vm.newItem,
			dueDate: '',
			user_id: user,
			project_id: projectId,
			completed: false
		}).then(function(Items) {
			var id = Items.key();
		})

		vm.newItem = null;
	};

	vm.completed = function(item) {
		vm.list.$save(item).then(function(Items) {
			Items.key() === item.$id;
		});
	};


}]);

