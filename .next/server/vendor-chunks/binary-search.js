/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/binary-search";
exports.ids = ["vendor-chunks/binary-search"];
exports.modules = {

/***/ "(ssr)/./node_modules/binary-search/index.js":
/*!*********************************************!*\
  !*** ./node_modules/binary-search/index.js ***!
  \*********************************************/
/***/ ((module) => {

eval("module.exports = function(haystack, needle, comparator, low, high) {\n  var mid, cmp;\n\n  if(low === undefined)\n    low = 0;\n\n  else {\n    low = low|0;\n    if(low < 0 || low >= haystack.length)\n      throw new RangeError(\"invalid lower bound\");\n  }\n\n  if(high === undefined)\n    high = haystack.length - 1;\n\n  else {\n    high = high|0;\n    if(high < low || high >= haystack.length)\n      throw new RangeError(\"invalid upper bound\");\n  }\n\n  while(low <= high) {\n    // The naive `low + high >>> 1` could fail for array lengths > 2**31\n    // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`\n    // works for array lengths <= 2**32-1 which is also Javascript's max array\n    // length.\n    mid = low + ((high - low) >>> 1);\n    cmp = +comparator(haystack[mid], needle, mid, haystack);\n\n    // Too low.\n    if(cmp < 0.0)\n      low  = mid + 1;\n\n    // Too high.\n    else if(cmp > 0.0)\n      high = mid - 1;\n\n    // Key found.\n    else\n      return mid;\n  }\n\n  // Key not found.\n  return ~low;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYmluYXJ5LXNlYXJjaC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1jb21wYW5pb24vLi9ub2RlX21vZHVsZXMvYmluYXJ5LXNlYXJjaC9pbmRleC5qcz9lNGMyIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGF5c3RhY2ssIG5lZWRsZSwgY29tcGFyYXRvciwgbG93LCBoaWdoKSB7XG4gIHZhciBtaWQsIGNtcDtcblxuICBpZihsb3cgPT09IHVuZGVmaW5lZClcbiAgICBsb3cgPSAwO1xuXG4gIGVsc2Uge1xuICAgIGxvdyA9IGxvd3wwO1xuICAgIGlmKGxvdyA8IDAgfHwgbG93ID49IGhheXN0YWNrLmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCBsb3dlciBib3VuZFwiKTtcbiAgfVxuXG4gIGlmKGhpZ2ggPT09IHVuZGVmaW5lZClcbiAgICBoaWdoID0gaGF5c3RhY2subGVuZ3RoIC0gMTtcblxuICBlbHNlIHtcbiAgICBoaWdoID0gaGlnaHwwO1xuICAgIGlmKGhpZ2ggPCBsb3cgfHwgaGlnaCA+PSBoYXlzdGFjay5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImludmFsaWQgdXBwZXIgYm91bmRcIik7XG4gIH1cblxuICB3aGlsZShsb3cgPD0gaGlnaCkge1xuICAgIC8vIFRoZSBuYWl2ZSBgbG93ICsgaGlnaCA+Pj4gMWAgY291bGQgZmFpbCBmb3IgYXJyYXkgbGVuZ3RocyA+IDIqKjMxXG4gICAgLy8gYmVjYXVzZSBgPj4+YCBjb252ZXJ0cyBpdHMgb3BlcmFuZHMgdG8gaW50MzIuIGBsb3cgKyAoaGlnaCAtIGxvdyA+Pj4gMSlgXG4gICAgLy8gd29ya3MgZm9yIGFycmF5IGxlbmd0aHMgPD0gMioqMzItMSB3aGljaCBpcyBhbHNvIEphdmFzY3JpcHQncyBtYXggYXJyYXlcbiAgICAvLyBsZW5ndGguXG4gICAgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSA+Pj4gMSk7XG4gICAgY21wID0gK2NvbXBhcmF0b3IoaGF5c3RhY2tbbWlkXSwgbmVlZGxlLCBtaWQsIGhheXN0YWNrKTtcblxuICAgIC8vIFRvbyBsb3cuXG4gICAgaWYoY21wIDwgMC4wKVxuICAgICAgbG93ICA9IG1pZCArIDE7XG5cbiAgICAvLyBUb28gaGlnaC5cbiAgICBlbHNlIGlmKGNtcCA+IDAuMClcbiAgICAgIGhpZ2ggPSBtaWQgLSAxO1xuXG4gICAgLy8gS2V5IGZvdW5kLlxuICAgIGVsc2VcbiAgICAgIHJldHVybiBtaWQ7XG4gIH1cblxuICAvLyBLZXkgbm90IGZvdW5kLlxuICByZXR1cm4gfmxvdztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/binary-search/index.js\n");

/***/ })

};
;