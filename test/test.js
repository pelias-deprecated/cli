/**
 * @file The package's unit-tests.
 */

'use strict';

var requireDir = require( 'require-dir' );
var subcommands = requireDir( '../subcommands' );
var tape = require( 'tape' );

tape( 'subcommands/ JSON configs have correct schemas.', function ( test ){
  for( var repo in subcommands ){
    var repoConfig = subcommands[ repo ];
    test.equal( typeof repoConfig, 'object', repo + ' config is an object.');
    for( var command in repoConfig ){
      var subcommandConfig = repoConfig[ command ];
      test.equal( typeof subcommandConfig.description, 'string', 'Subcommand config has a `string` description.');
      test.equal( typeof subcommandConfig.command, 'string', 'Subcommand config has a `string` command.');
    }
  }
  test.end();
});
