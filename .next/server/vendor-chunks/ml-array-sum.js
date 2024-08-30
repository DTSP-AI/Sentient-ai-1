"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/ml-array-sum";
exports.ids = ["vendor-chunks/ml-array-sum"];
exports.modules = {

/***/ "(ssr)/./node_modules/ml-array-sum/lib-es6/index.js":
/*!****************************************************!*\
  !*** ./node_modules/ml-array-sum/lib-es6/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ sum)\n/* harmony export */ });\n/* harmony import */ var is_any_array__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-any-array */ \"(ssr)/./node_modules/is-any-array/lib-esm/index.js\");\n\n\nfunction sum(input) {\n  if (!(0,is_any_array__WEBPACK_IMPORTED_MODULE_0__.isAnyArray)(input)) {\n    throw new TypeError('input must be an array');\n  }\n\n  if (input.length === 0) {\n    throw new TypeError('input must not be empty');\n  }\n\n  var sumValue = 0;\n\n  for (var i = 0; i < input.length; i++) {\n    sumValue += input[i];\n  }\n\n  return sumValue;\n}\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWwtYXJyYXktc3VtL2xpYi1lczYvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBMEM7O0FBRTFDO0FBQ0EsT0FBTyx3REFBVTtBQUNqQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxrQkFBa0Isa0JBQWtCO0FBQ3BDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFMEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1jb21wYW5pb24vLi9ub2RlX21vZHVsZXMvbWwtYXJyYXktc3VtL2xpYi1lczYvaW5kZXguanM/MWEyMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0FueUFycmF5IH0gZnJvbSAnaXMtYW55LWFycmF5JztcblxuZnVuY3Rpb24gc3VtKGlucHV0KSB7XG4gIGlmICghaXNBbnlBcnJheShpbnB1dCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnB1dCBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gIH1cblxuICBpZiAoaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaW5wdXQgbXVzdCBub3QgYmUgZW1wdHknKTtcbiAgfVxuXG4gIHZhciBzdW1WYWx1ZSA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgIHN1bVZhbHVlICs9IGlucHV0W2ldO1xuICB9XG5cbiAgcmV0dXJuIHN1bVZhbHVlO1xufVxuXG5leHBvcnQgeyBzdW0gYXMgZGVmYXVsdCB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/ml-array-sum/lib-es6/index.js\n");

/***/ })

};
;