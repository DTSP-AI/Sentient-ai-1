/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/faiss-node";
exports.ids = ["vendor-chunks/faiss-node"];
exports.modules = {

/***/ "(rsc)/./node_modules/faiss-node/lib/index.js":
/*!**********************************************!*\
  !*** ./node_modules/faiss-node/lib/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const faiss = __webpack_require__(/*! bindings */ \"(rsc)/./node_modules/bindings/bindings.js\")('faiss-node');\n\nfaiss.MetricType = void 0;\nvar MetricType;\n(function (MetricType) {\n  MetricType[MetricType[\"METRIC_INNER_PRODUCT\"] = 0] = \"METRIC_INNER_PRODUCT\";\n  MetricType[MetricType[\"METRIC_L2\"] = 1] = \"METRIC_L2\";\n  MetricType[MetricType[\"METRIC_L1\"] = 2] = \"METRIC_L1\";\n  MetricType[MetricType[\"METRIC_Linf\"] = 3] = \"METRIC_Linf\";\n  MetricType[MetricType[\"METRIC_Lp\"] = 4] = \"METRIC_Lp\";\n  MetricType[MetricType[\"METRIC_Canberra\"] = 20] = \"METRIC_Canberra\";\n  MetricType[MetricType[\"METRIC_BrayCurtis\"] = 21] = \"METRIC_BrayCurtis\";\n  MetricType[MetricType[\"METRIC_JensenShannon\"] = 22] = \"METRIC_JensenShannon\";\n  MetricType[MetricType[\"METRIC_Jaccard\"] = 23] = \"METRIC_Jaccard\";\n})(MetricType || (faiss.MetricType = MetricType = {}));\n\nmodule.exports = faiss;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZmFpc3Mtbm9kZS9saWIvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsY0FBYyxtQkFBTyxDQUFDLDJEQUFVOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLG1EQUFtRDs7QUFFcEQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1jb21wYW5pb24vLi9ub2RlX21vZHVsZXMvZmFpc3Mtbm9kZS9saWIvaW5kZXguanM/MmIyMCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmYWlzcyA9IHJlcXVpcmUoJ2JpbmRpbmdzJykoJ2ZhaXNzLW5vZGUnKTtcblxuZmFpc3MuTWV0cmljVHlwZSA9IHZvaWQgMDtcbnZhciBNZXRyaWNUeXBlO1xuKGZ1bmN0aW9uIChNZXRyaWNUeXBlKSB7XG4gIE1ldHJpY1R5cGVbTWV0cmljVHlwZVtcIk1FVFJJQ19JTk5FUl9QUk9EVUNUXCJdID0gMF0gPSBcIk1FVFJJQ19JTk5FUl9QUk9EVUNUXCI7XG4gIE1ldHJpY1R5cGVbTWV0cmljVHlwZVtcIk1FVFJJQ19MMlwiXSA9IDFdID0gXCJNRVRSSUNfTDJcIjtcbiAgTWV0cmljVHlwZVtNZXRyaWNUeXBlW1wiTUVUUklDX0wxXCJdID0gMl0gPSBcIk1FVFJJQ19MMVwiO1xuICBNZXRyaWNUeXBlW01ldHJpY1R5cGVbXCJNRVRSSUNfTGluZlwiXSA9IDNdID0gXCJNRVRSSUNfTGluZlwiO1xuICBNZXRyaWNUeXBlW01ldHJpY1R5cGVbXCJNRVRSSUNfTHBcIl0gPSA0XSA9IFwiTUVUUklDX0xwXCI7XG4gIE1ldHJpY1R5cGVbTWV0cmljVHlwZVtcIk1FVFJJQ19DYW5iZXJyYVwiXSA9IDIwXSA9IFwiTUVUUklDX0NhbmJlcnJhXCI7XG4gIE1ldHJpY1R5cGVbTWV0cmljVHlwZVtcIk1FVFJJQ19CcmF5Q3VydGlzXCJdID0gMjFdID0gXCJNRVRSSUNfQnJheUN1cnRpc1wiO1xuICBNZXRyaWNUeXBlW01ldHJpY1R5cGVbXCJNRVRSSUNfSmVuc2VuU2hhbm5vblwiXSA9IDIyXSA9IFwiTUVUUklDX0plbnNlblNoYW5ub25cIjtcbiAgTWV0cmljVHlwZVtNZXRyaWNUeXBlW1wiTUVUUklDX0phY2NhcmRcIl0gPSAyM10gPSBcIk1FVFJJQ19KYWNjYXJkXCI7XG59KShNZXRyaWNUeXBlIHx8IChmYWlzcy5NZXRyaWNUeXBlID0gTWV0cmljVHlwZSA9IHt9KSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZmFpc3M7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/faiss-node/lib/index.js\n");

/***/ })

};
;