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



  // Initialize Firebase
	var config = {
		apiKey: "AIzaSyCFT4fjJtYxQwr9fGYY95YL1e-7mqjj2hM",
		authDomain: "project-7288100014883596985.firebaseapp.com",
		databaseURL: "https://project-7288100014883596985.firebaseio.com",
		storageBucket: "project-7288100014883596985.appspot.com",
		messagingSenderId: "352691130287"
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

app.factory('Profile', ['$firebaseObject', 'Auth', function($firebaseObject, Auth) {
	var auth = Auth.$getAuth();
	var user = auth.uid;
	var userRef = firebase.database().ref('users').orderbyKey().equalTo(user);
	return $firebaseObject(userRef);
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
}]);

app.directive('contenteditable', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel) {

			function read() {
				ngModel.$setViewValue(element.html());
			};

			ngModel.$render = function() {
				element.html(ngModel.$viewValue || '');
			};

			element.bind('blur keyup change', function() {
				scope.$apply(read);
			});
		}
	}
});

app.directive('onEnter', function() {
	return function(scope, element, attrs) {
		element.bind('keydown keypress', function(event) {
			if (event.which === 13) {
				event.preventDefault();
				scope.$apply(function () {
					scope.$eval(attrs.onEnter);
				});
			}
		});
	};
});

app.directive('resetFocusOnNew', function($timeout) {
	return function(scope, element, attrs, ctrl) {
		if( scope.$last ) {
			$timeout(function() {
				element[0].focus();
			});
		}
		scope.$watch('$last', function() {
			if( scope.$last ) {
				$timeout(function() {
					element[0].focus();
				});
			}
		});
	};
});

app.directive('bodyEvent', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('child_removed', function() {
				$rootScope.$broadcast('child_removed');
			});
		}
	}
});

app.directive('deleteItemListener', function($timeout, Items) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var items = Items;
			element.focus(function() {
				attrs.$observe('ngModel', function(item) {
					element.bind('keydown', function(event) {
						if (event.which === 8) {
							if (event.target.innerText === '') {
								scope.$apply(function() {
									scope.$eval(attrs.deleteItemListener);
									event.preventDefault();
								});
								//event.preventDefault();
                                /*$timeout(function() {
                                    element[0].focus();
                                });*/
							}
						}
					});
				});
			});
			$timeout(function() {
				element[0].focus();
			});
		}
	};
});

app.directive('focusIter', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
				var atomSelector = attrs.focusIter;

				elem.on('keyup', atomSelector, function(e) {
					var atoms = elem.find(atomSelector),
						lenAtoms = atoms.length,
						toAtom = null;

					for (var i = lenAtoms - 1; i >= 0; i--) {
						if (atoms[i] === e.target) {
							if (e.keyCode === 38) {
								e.preventDefault();
								toAtom = atoms[i - 1];
							}
							if (e.keyCode === 40) {
								e.preventDefault();
								toAtom = atoms[i + 1];
							}
						/*	if (e.keyCode === 9) {
								toAtom = atoms[i + 1];
							}
							if (e. shiftKey && e.keyCode === 9) {
								toAtom = atoms[i - 1];
							}*/
							break;
						}
					}

					if (toAtom) {
						toAtom.focus();
					}
				});
				elem.on('keydown', atomSelector, function(e) {
					if (e.keyCode === 38 || e.keyCode === 40) {
						e.preventDefault();
					}
				});
			}
	}
});

app.directive('indent', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('keydown', function(event) {
				if (event.keyCode === 9 && !event.shiftKey) {
					scope.$apply(function() {
						scope.$eval(attrs.indent);
					});
					event.preventDefault();
				}
			});
		}
	}
});

app.directive('outdent', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('keydown', function(event) {
				if (event.shiftKey && event.keyCode === 9) {
					scope.$apply(function() {
						scope.$eval(attrs.outdent);
					});
					event.preventDefault();
				};
				console.log(event);
			});
		}
	}
});

app.controller('appCtrl',['$location', function($location) {
	var vm = this;

	vm.projectsShow = true;
	vm.timersShow = false;
	vm.addProjectShow = false;
	vm.registerShow = false;
}]);

app.controller('userAuth', ['Auth', '$location', '$timeout', '$firebaseObject', '$firebaseArray', function(Auth, $location, $timeout, $firebaseObject, $firebaseArray) {
    var vm = this;
	vm.auth = Auth;
	vm.user = vm.auth.$getAuth();

	var newProjectRef = firebase.database().ref().child('projects');
	vm.newProject = $firebaseArray(newProjectRef);

    vm.email = null;
    vm.password = null;

    vm.signIn = function() {
        vm.auth.$signInWithEmailAndPassword(vm.email, vm.password).then(function(firebaseUser) {
            console.log('Signed in as:', firebaseUser.uid);
			$location.path('/profile');
        }).catch(function(error) {
            console.error('Authentication failed:', error);
        });

        vm.email = null;
        vm.password = null;
    };

	vm.register = function() {
		vm.auth.$createUserWithEmailAndPassword(vm.email, vm.password).then(function(firebaseUser) {
			console.log('User ' + firebaseUser.uid + ' created successfully!');
			vm.newProject.$add({
				title: 'Inbox',
				user_id: firebaseUser.uid
			}).then(function(newProjectRef) {
				vm.projId = newProjectRef.key;
				$location.path('/' + vm.projId);
			});

		}).catch(function(error) {
			console.log('Error: ', error);
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
			content: '',
			dueDate: '',
			user_id: user,
			project_id: projectId,
			completed: false,
			priority: 0
		}).then(function(Items) {
			var id = Items.key;
			itemRef = {};
			itemRef[id] = true;
			projectRef.child('items').update(itemRef);
		});

		vm.newItem = null;
	};

	vm.completed = function(item) {
		vm.list.$save(item).then(function(Items) {
			Items.key === item.$id;
		});
	};

	vm.updateItem = function(item) {
		vm.list.$save(item).then(function(Items) {
			Items.key === vm.list.$id;
		});
	};

	vm.deleteItem = function(item, index) {
		vm.list.$remove(item).then(function(ref) {
			ref.key === vm.list.$id;
			itemRef = {};
			itemRef[ref.key] = null;
			projectRef.child('items').set(itemRef);
		});
	};

	vm.decreaseItemPriority = function(item) {
		item.priority += 1;
		vm.list.$save(item).then(function(Items) {
			Items.key === vm.list.$id;
		});
	};

	vm.increaseItemPriority = function(item) {
		if (item.priority > 0) {
			item.priority -= 1;
			vm.list.$save(item).then(function(Items) {
				Items.key === vm.list.$id;
			});
		}
	};


}]);

