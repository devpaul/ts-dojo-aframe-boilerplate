/* jshint node:true */

var TASKS = [
	'grunt-contrib-watch',
	'grunt-contrib-jshint',
	'grunt-contrib-symlink',
	'grunt-gh-pages',
	'grunt-jscs',
	'grunt-text-replace',
	'grunt-shell',
	'intern'
];

module.exports = function (grunt) {

	TASKS.forEach(grunt.loadNpmTasks.bind(grunt));

	require('grunt-dojo2').initConfig(grunt, {
		istanbulIgnoreNext: '/* istanbul ignore next */',
		staticTestFiles: 'tests/**/*.{html,css}',
		distDirectory: 'dist',
		testDirectory: 'test',
		srcDirectory: 'src',
		targetDirectory: '<%= devDirectory %>',
		siteDirectory: '.',
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
		clean: {
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
		'gh-pages': {
			publish: {
				options: {
					base: '<%= distDirectory %>',
					push: true
				},

				src: [ '**/*' ]
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
		'replace:addIstanbulIgnore'
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
	grunt.registerTask('publish', [ 'dist', 'gh-pages:publish' ]);
	grunt.registerTask('default', [ 'clean', 'lint', 'build' ]);
};
