module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    jade:{
          compile:{
              options:{
                  pretty:true
              },
              files:{
                  "./app/html/index.html": "./app/views/index.jade"
              }
          }
    },
    clean: {
		options: { force: true },
		releases: ["./releases", "./app/html"]
		//,jadeCompilations: ["./app/html"]
	},
    nodewebkit: {
		options: {
			build_dir: './releases', // Where the build version of my node-webkit app is saved
			mac: true, // We want to build it for mac
			win: false, // We want to build it for win
			linux32: false, // We don't need linux32
			linux64: false, // We don't need linux64
            force_download: false
        },
		src: ['./app/**'] // Your node-webkit app
	},
	bower: {
		install: {
			options: {
				 targetDir: './app/lib',
				 install: true,
				 cleanBowerDir: false,
				 cleanTargetDir: false,
                 layout:"byComponent",
                 verbose:true
			}
		}
  }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-bower-task');
  
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Default task(s).
  grunt.registerTask('default', ['clean','bower', 'jade','nodewebkit']);

};
