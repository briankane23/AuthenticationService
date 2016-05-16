var mainApplicationModuleName = 'AuthenticationService';

var mainApplicationModule = angular.module(mainApplicationModuleName, [
	'ngRoute',
	'ngResource'
]);

//Add hashbang support for crawlers
mainApplicationModule.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.element(document).ready(function()  {
	angular.bootstrap(document, [mainApplicationModuleName]);
});
