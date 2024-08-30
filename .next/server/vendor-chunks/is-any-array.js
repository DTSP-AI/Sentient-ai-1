"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-any-array";
exports.ids = ["vendor-chunks/is-any-array"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-any-array/lib-esm/index.js":
/*!****************************************************!*\
  !*** ./node_modules/is-any-array/lib-esm/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   isAnyArray: () => (/* binding */ isAnyArray)\n/* harmony export */ });\n// eslint-disable-next-line @typescript-eslint/unbound-method\nconst toString = Object.prototype.toString;\n/**\n * Checks if an object is an instance of an Array (array or typed array, except those that contain bigint values).\n *\n * @param value - Object to check.\n * @returns True if the object is an array or a typed array.\n */\nfunction isAnyArray(value) {\n    const tag = toString.call(value);\n    return tag.endsWith('Array]') && !tag.includes('Big');\n}\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtYW55LWFycmF5L2xpYi1lc20vaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktY29tcGFuaW9uLy4vbm9kZV9tb2R1bGVzL2lzLWFueS1hcnJheS9saWItZXNtL2luZGV4LmpzPzkwZDUiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC91bmJvdW5kLW1ldGhvZFxuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuLyoqXG4gKiBDaGVja3MgaWYgYW4gb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIGFuIEFycmF5IChhcnJheSBvciB0eXBlZCBhcnJheSwgZXhjZXB0IHRob3NlIHRoYXQgY29udGFpbiBiaWdpbnQgdmFsdWVzKS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgLSBPYmplY3QgdG8gY2hlY2suXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvYmplY3QgaXMgYW4gYXJyYXkgb3IgYSB0eXBlZCBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW55QXJyYXkodmFsdWUpIHtcbiAgICBjb25zdCB0YWcgPSB0b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgICByZXR1cm4gdGFnLmVuZHNXaXRoKCdBcnJheV0nKSAmJiAhdGFnLmluY2x1ZGVzKCdCaWcnKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-any-array/lib-esm/index.js\n");

/***/ })

};
;