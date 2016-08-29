/* jshint node:true */

var TASKS = [
	'grunt-contrib-clean',
	'grunt-contrib-copy',
	'grunt-contrib-watch',
	'grunt-contrib-jshint',
	'grunt-contrib-symlink',
	'grunt-jscs',
	'grunt-text-replace',
	'grunt-ts',
	'grunt-tslint',
	'grunt-shell',
	'intern'
];

function mixin(destination, source) {
	for (var key in source) {
		destination[key] = source[key];
	}
	return destination;
}

module.exports = function (grunt) {
	TASKS.forEach(grunt.loadNpmTasks.bind(grunt));

	var tsconfigContent = grunt.file.read('tsconfig.json');
	var tsconfig = JSON.parse(tsconfigContent);
	var compilerOptions = mixin({}, tsconfig.compilerOptions);

	tsconfig.filesGlob = tsconfig.filesGlob.map(function (glob) {
		if (/^\.\//.test(glob)) {
			// Remove the leading './' from the glob because grunt-ts
			// sees it and thinks it needs to create a .baseDir.ts which
			// messes up the "dist" compilation
			return glob.slice(2);
		}
		return glob;
	});
	var packageJson = grunt.file.readJSON('package.json');

	grunt.initConfig({
		name: packageJson.name,
		version: packageJson.version,
		tsconfig: tsconfig,
		istanbulIgnoreNext: '/* istanbul ignore next */',
		all: [ '<%= tsconfig.filesGlob %>' ],
		skipTests: [ '<%= all %>', '!tests/**/*.ts' ],
		staticTestFiles: 'tests/**/*.{html,css}',
		srcDirectory: 'src',
		siteDirectory: '.',
		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',
		distDirectory: 'docs',
		testDirectory: 'test',
		targetDirectory: '<%= devDirectory %>',

		clean: {
			dist: {
				src: [ '<%= distDirectory %>/' ]
			},
			dev: {
				src: [ '<%= devDirectory %>' ]
			},
			src: {
				src: [ '{src,tests}/**/*.js' ],
				filter: function (path) {
					// Only clean the .js file if a .js.map file also exists
					var mapPath = path + '.map';
					if (grunt.file.exists(mapPath)) {
						grunt.file.delete(mapPath);
						return true;
					}
					return false;
				}
			},
			coverage: {
				src: [ 'html-report/' ]
			}
		},

		copy: {
			staticSiteFiles: {
				expand: true,
				cwd: '.',
				src: [ '<%= siteDirectory %>/*.html' ],
				dest: '<%= targetDirectory %>'
			},
			staticTestFiles: {
				expand: true,
				cwd: '.',
				src: [ '<%= staticTestFiles %>' ],
				dest: '<%= devDirectory %>'
			},
			staticDistFiles: {
				expand: true,
				cwd: '.',
				src: [ 'README.md', 'LICENSE', 'package.json' ],
				dest: '<%= distDirectory %>'
			},
			nodeModules: {
				expand: true,
				cwd: '.',
				src: [ 'node_modules/**/*' ],
				dest: '<%= distDirectory %>'
			}
		},

		shell: {
			prune: {
				command: 'npm prune --production',
				options: {
					execOptions: {
						cwd: '<%= distDirectory %>'
					}
				}
			}
		},

		intern: {
			options: {
				runType: 'runner',
				config: '<%= devDirectory %>/tests/intern'
			},
			runner: {
				options: {
					reporters: [ 'runner', 'lcovhtml' ]
				}
			},
			local: {
				options: {
					config: '<%= devDirectory %>/tests/intern-local',
					reporters: [ 'runner', 'lcovhtml' ]
				}
			},
			client: {
				options: {
					runType: 'client',
					reporters: [ 'console', 'lcovhtml' ]
				}
			},
			proxy: {
				options: {
					proxyOnly: true
				}
			}
		},

		rename: {
			sourceMaps: {
				expand: true,
				cwd: '<%= distDirectory %>',
				src: [ '**/*.js.map', '!_debug/**/*.js.map' ],
				dest: '<%= distDirectory %>/_debug/'
			}
		},

		rewriteSourceMaps: {
			dist: {
				src: [ '<%= distDirectory %>/_debug/**/*.js.map' ]
			}
		},

		replace: {
			addIstanbulIgnore: {
				src: [ '<%= devDirectory %>/**/*.js' ],
				overwrite: true,
				replacements: [
					{
						from: /^(var __(?:extends|decorate) = )/gm,
						to: '$1<%= istanbulIgnoreNext %> '
					},
					{
						from: /^(\()(function \(deps, )/m,
						to: '$1<%= istanbulIgnoreNext %> $2'
					}
				]
			}
		},

		symlink: {
			dev: {
				src: 'node_modules',
				dest: '<%= devDirectory %>/node_modules'
			}
		},

		ts: {
			options: mixin(
				compilerOptions,
				{
					failOnTypeErrors: true,
					fast: 'never'
				}
			),
			dev: {
				outDir: '<%= devDirectory %>',
				src: [ '<%= all %>' ]
			},
			dist: {
				options: {
					mapRoot: '../<%= distDirectory %>/_debug'
				},
				outDir: '<%= distDirectory %>/src',
				src: [ '<%= skipTests %>' ]
			}
		},

		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},
			src: {
				src: [
					'<%= all %>',
					'!typings/**/*.ts',
					'!tests/typings/**/*.ts'
				]
			}
		},

		jshint: {
			all: [ 'Gruntfile.js', '<%= srcDirectory %>/**/*.js', '<%= testDirectory %>/**/*.js' ]
		},

		jscs: {
			all: [ 'Gruntfile.js', '<%= srcDirectory %>/**/*.js', '<%= testDirectory %>/**/*.js' ]
		},

		watch: {
			grunt: {
				options: {
					reload: true
				},
				files: [ 'Gruntfile.js', 'tsconfig.json', 'typings.json' ]
			},
			src: {
				options: {
					atBegin: true
				},
				files: [ '<%= all %>', '<%= staticTestFiles %>' ],
				tasks: [
					'build-quick'
				]
			}
		}
	});

	// Set some Intern-specific options if specified on the command line.
	[ 'suites', 'functionalSuites', 'grep' ].forEach(function (option) {
		var value = grunt.option(option);
		if (value) {
			if (option !== 'grep') {
				value = value.split(',').map(function (string) {
					return string.trim();
				});
			}
			grunt.config('intern.options.' + option, value);
		}
	});

	grunt.registerMultiTask('rewriteSourceMaps', function () {
		this.filesSrc.forEach(function (file) {
			var map = JSON.parse(grunt.file.read(file));
			var sourcesContent = map.sourcesContent = [];
			var path = require('path');
			map.sources = map.sources.map(function (source, index) {
				sourcesContent[index] = grunt.file.read(path.resolve(path.dirname(file), source));
				return source.replace(/^.*\/src\//, '');
			});
			grunt.file.write(file, JSON.stringify(map));
		});
		grunt.log.writeln('Rewrote ' + this.filesSrc.length + ' source maps');
	});

	grunt.registerMultiTask('rename', function () {
		this.files.forEach(function (file) {
			if (grunt.file.isFile(file.src[0])) {
				grunt.file.mkdir(require('path').dirname(file.dest));
			}
			require('fs').renameSync(file.src[0], file.dest);
			grunt.verbose.writeln('Renamed ' + file.src[0] + ' to ' + file.dest);
		});
		grunt.log.writeln('Moved ' + this.files.length + ' files');
	});

	grunt.registerTask('updateTsconfig', function () {
		var tsconfig = JSON.parse(tsconfigContent);
		tsconfig.files = grunt.file.expand(tsconfig.filesGlob);

		var output = JSON.stringify(tsconfig, null, '\t') + require('os').EOL;
		if (output !== tsconfigContent) {
			grunt.file.write('tsconfig.json', output);
			tsconfigContent = output;
		}
	});

	grunt.registerTask('settarget', function (target) {
		var directory = grunt.config.get('targetDirectory');
		if (target === 'dist') {
			directory = grunt.config.get('distDirectory');
		}
		console.log('Setting targetDirectory to ' + target + ': ' + directory);
		grunt.config.set('targetDirectory', directory);
	});

	grunt.registerTask('build-quick', [
		'ts:dev',
		'copy:staticSiteFiles'
	]);
	grunt.registerTask('build', [
		'ts:dev',
		'copy:staticSiteFiles',
		'copy:staticTestFiles',
		'symlink:dev',
		'replace:addIstanbulIgnore',
		'updateTsconfig'
	]);
	grunt.registerTask('dist', [
		'settarget:dist',
		'clean:dist',
		'ts:dist',
		'rename:sourceMaps',
		'rewriteSourceMaps',
		'copy:staticSiteFiles',
		'copy:staticDistFiles',

		/* copy our node modules which we need to bundle */
		'copy:nodeModules',

		/* prune the npm packages for a production build */
		'shell:prune'
	]);

	grunt.registerTask('lint', [ 'jshint', 'jscs', 'tslint' ]);
	grunt.registerTask('test', [ 'build', 'intern:client' ]);
	grunt.registerTask('test-local', [ 'build', 'intern:local' ]);
	grunt.registerTask('test-proxy', [ 'build', 'intern:proxy' ]);
	grunt.registerTask('test-runner', [ 'build', 'intern:runner' ]);
	grunt.registerTask('ci', [ 'clean', 'lint', 'test' ]);
	grunt.registerTask('default', [ 'clean', 'lint', 'build' ]);
};
