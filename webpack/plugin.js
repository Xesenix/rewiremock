const {relative} = require("path");
const {ConcatSource} = require("webpack-sources");

// when working with linked modules executing tests from module that requires some other core module that uses 
// rewiremock can result in paths for process.cwd that link to completely different place on hard drive so we cant 
// use it for evaluating relative paths instead we search for closest node_module on current file __dirname this 
// way we actual get correct relative path to interceptor
const nodeModulesIndex = __dirname.lastIndexOf('node_modules');
const nodeModulesPath = __dirname.substr(0, nodeModulesIndex);
const file = './' + relative(nodeModulesPath, __dirname + '/interceptor.js').replace(/\\/g, '/');

const injectString = "/***/if(typeof __webpack_require__!=='undefined'){__webpack_require__ = __webpack_require__('" + file + "')(__webpack_require__, module);}\n";

class RewiremockPlugin {
  apply(compiler) {
    compiler.plugin('compilation', function (compilation) {

      compilation.moduleTemplate.plugin('render', function (moduleSource) {
        const source = new ConcatSource();
        source.add(injectString);
        source.add(moduleSource);
        return source;
      });
    });
  }
};

module.exports = RewiremockPlugin;