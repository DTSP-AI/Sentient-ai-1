"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/num-sort";
exports.ids = ["vendor-chunks/num-sort"];
exports.modules = {

/***/ "(ssr)/./node_modules/num-sort/index.js":
/*!****************************************!*\
  !*** ./node_modules/num-sort/index.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nfunction assertNumber(number) {\n\tif (typeof number !== 'number') {\n\t\tthrow new TypeError('Expected a number');\n\t}\n}\n\nexports.ascending = (left, right) => {\n\tassertNumber(left);\n\tassertNumber(right);\n\n\tif (Number.isNaN(left)) {\n\t\treturn -1;\n\t}\n\n\tif (Number.isNaN(right)) {\n\t\treturn 1;\n\t}\n\n\treturn left - right;\n};\n\nexports.descending = (left, right) => {\n\tassertNumber(left);\n\tassertNumber(right);\n\n\tif (Number.isNaN(left)) {\n\t\treturn 1;\n\t}\n\n\tif (Number.isNaN(right)) {\n\t\treturn -1;\n\t}\n\n\treturn right - left;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbnVtLXNvcnQvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWtCO0FBQ2xCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktY29tcGFuaW9uLy4vbm9kZV9tb2R1bGVzL251bS1zb3J0L2luZGV4LmpzPzk4MjIiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlcnROdW1iZXIobnVtYmVyKSB7XG5cdGlmICh0eXBlb2YgbnVtYmVyICE9PSAnbnVtYmVyJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyJyk7XG5cdH1cbn1cblxuZXhwb3J0cy5hc2NlbmRpbmcgPSAobGVmdCwgcmlnaHQpID0+IHtcblx0YXNzZXJ0TnVtYmVyKGxlZnQpO1xuXHRhc3NlcnROdW1iZXIocmlnaHQpO1xuXG5cdGlmIChOdW1iZXIuaXNOYU4obGVmdCkpIHtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRpZiAoTnVtYmVyLmlzTmFOKHJpZ2h0KSkge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0cmV0dXJuIGxlZnQgLSByaWdodDtcbn07XG5cbmV4cG9ydHMuZGVzY2VuZGluZyA9IChsZWZ0LCByaWdodCkgPT4ge1xuXHRhc3NlcnROdW1iZXIobGVmdCk7XG5cdGFzc2VydE51bWJlcihyaWdodCk7XG5cblx0aWYgKE51bWJlci5pc05hTihsZWZ0KSkge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKE51bWJlci5pc05hTihyaWdodCkpIHtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRyZXR1cm4gcmlnaHQgLSBsZWZ0O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/num-sort/index.js\n");

/***/ })

};
;