(function(global) {
  
  var mV8Repo = 'git://github.com/v8/v8.git';
  
  function JSExec(pConfig) {
    this.config = pConfig;
    this.output = null;
    this.jsResources = [];
    this.nativeResources = [];

    this.thisDir = (pConfig.properties.pluginDir || 'plugins') + '/JSExec/plugin';
    this.buildDir = pConfig.properties.buildDir || 'build';
    this.binDir = pConfig.properties.binDir || 'bin';
    this.vendorDir = pConfig.properties.vendorDir || 'vendor';
  }

  JSExec.prototype = Object.create(global.plugins.Builder);

  JSExec.prototype.setData = function(pData) {
    
  };

  JSExec.prototype.setOutputs = function(pOutputs) {
    if (pOutputs.length > 1) {
      print('JSExec can only have one output per target');
      return false;
    }

    this.output = pOutputs[0];
  };

  JSExec.prototype.setResources = function(pResources) {
    this.jsResources.length = 0;
    this.nativeResources.length = 0;

    for (var i = 0, il = pResources.length; i < il; i++) {
      var tResource = pResources[i].file;
      var tEnd = tResource.substr(-3);
      if (tEnd === '.js') {
        this.jsResources.push(tResource);
      } else if (tEnd === '.cc') {
        this.nativeResources.push(tResource);
      }
    }
  };

  JSExec.prototype.build = function() {
    if (stat(this.vendorDir + '/v8/Makefile') === null) {
      print(system('mkdir -p ' + this.vendorDir));
      print(system('git clone ' + mV8Repo + ' ' + this.vendorDir + '/v8'));
      print(system('cd ' + this.vendorDir + '/v8 && make dependencies'));
    }

    global.setenv('BUILD_DIR', this.buildDir);
    global.setenv('OUT', this.binDir);
    global.setenv('JS_FILES', this.jsResources.join(' '));
    global.setenv('NATIVE_FILES', this.nativeResources.join(' ') + ' ' + this.thisDir + '/native/main.cc');

    var tOutput = system('make -f ' + this.thisDir + '/Makefile jsexec');

    if (!this.config.isQuiet) {
      print(tOutput);
    }

    return this.output;
  }; 

  global.on('queryBuilders', function(pBuilders) {
    pBuilders.jsexec = JSExec; 
  });
}(this));
