(function() {
  'use strict';

  angular
    .module('material-lite')
    .service('TodoWebService', ['$q', '$http', TodoWebService])
    .controller('TodoController', ['$scope', 'TodoWebService', 'TodoService', TodoController]);

  function TodoWebService($q, $http){
  	this.baseURL = 'https://payninja.azurewebsites.net';
  	this.userData = null;
  	this.getToken = function(){
		var req = {
			method: 'POST',
			url: this.baseURL + '/token',
			data: 'username=ivantest@gmail.com&password=123456&grant_type=password&client_id=paylenz-api-client_1607859&client_secret=paylenz-api-plsecrect_80d3da4d89a6311',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
			},
		}

		return $http(req);
	}
	this._callAPI = function(method, path, data){
		var req = {
			method: method,
			url: this.baseURL + path,
			data: data,
			headers: {
				'Content-Type': 'application/json',
				// 'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': this.userData.token_type+" "+this.userData.access_token
			}
		}

		return $http(req);
	}
	this.postTask = function(data){
		if (this.userData === null){
			return false;
		}
		return this._callAPI("POST", "/api/v1/task?userKey=", data);
	}
	this.getTask = function(){
		if (this.userData === null){
			return false;
		}
		return this._callAPI("GET", "/api/v1/task?userKey=");
	}
	this.startInterval = function(data){
		if (this.userData === null){
			return false;
		}
		return this._callAPI("POST", "/api/v1/taskInterval?userKey=", data);
	}
	this.stopInterval = function(data){
		if (this.userData === null){
			return false;
		}
		return this._callAPI("POST", "/api/v1/taskInterval?userKey=", data);
	}
	
  }
  function TodoController($scope, TodoWebService, TodoService) {
  	TodoWebService.getToken().then(function(res){
  		TodoWebService.userData = res.data;
  		$scope.todoWebService = TodoWebService;
  		$scope.todoService = new TodoService($scope);
  	});
    
  }

})();
