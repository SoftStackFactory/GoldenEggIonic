angular.module('GoldenEggDirectives', [])

.directive("repeatNtimes", function() {
  return {
    restrict: "E",
    compile: function(scope, Element, attrs) {
      var content = Element.children();
      for (var i=1; i<attrs.repeat; i++) {
        Element.append(content.clone());
      }
    }
  };
});