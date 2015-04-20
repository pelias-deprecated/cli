'use strict';

var colors = require( 'colors' );
var childProcess = require( 'child_process' );
var path = require( 'path' );
var fs = require( 'fs' );
var util = require( 'util' );
var args = process.argv.slice( 2 );

function $( shellCmd ){
  return childProcess.execSync( shellCmd ).toString();
}

function printErr( msg ){
  console.error( 'pelias:'.blue, 'error:'.red, msg );
}

function printOut( msg ){
  console.log( 'pelias:'.blue, msg );
}

var helpMessage = fs.readFileSync( 'HELP.txt' ).toString();
var targetRepo = {};

if( args.length === 0 ){
  printErr( 'Missing repo name.' );
  printErr( helpMessage );
  process.exit( 1 );
}
else if( args[ 0 ] === '--help' ){
  printOut( helpMessage );
  process.exit();
}
else {
  if( args.length === 1 ){
    printErr( 'Missing repo subcommand.' );
  }
  else {
    targetRepo.subcommand = args[ 1 ];
  }

  var repoBranchNames = args[ 0 ];
  var poundIndex = repoBranchNames.indexOf( '#' );
  if( poundIndex === -1 ){
    targetRepo.name = repoBranchNames;
    targetRepo.branch = 'master';
  }
  else {
    targetRepo.name = repoBranchNames.substring( 0, poundIndex );
    targetRepo.branch = repoBranchNames.substring( poundIndex + 1 );
  }

  targetRepo.subcommandArgs = args.slice( 2 );
}

var peliasCachePath = path.join( process.env.HOME, '.pelias/' );
var repoPath = path.join( peliasCachePath, targetRepo.name );
if( fs.existsSync( repoPath ) ){
  process.chdir( repoPath );
  if( $( 'git rev-parse --abbrev-ref HEAD' ).trim() === targetRepo.branch ){
    var stale = $( 'git fetch --dry-run 2>&1' ).length > 0;
    if( stale ){
      printOut( 'Pulling latest changes.' );
      $( 'git pull' );
      printOut( 'Reinstalling.' );
      $( 'npm install' );
    }
  }
  else {
    $( 'git checkout -q ' + targetRepo.branch );
    var stale = $( 'git fetch --dry-run' ).length > 0;
    if( stale ){
      printOut( 'Pulling latest changes.' );
      $( 'git pull' );
    }
    printOut( 'Installing.' );
    $( 'npm install' );
  }
}
else {
  process.chdir( peliasCachePath );
  printOut( 'Cloning repo.' );
  $( 'git clone -q https://github.com/pelias/' + targetRepo.name );
  process.chdir( targetRepo.name );
  if( targetRepo.branch !== 'master' ){
    $( 'git checkout -q ' + targetRepo.branch );
  }
  printOut( 'Installing.' );
  $( 'npm install' );
}

if( targetRepo.subcommand ){
  var proc = childProcess.spawn( 'npm', [ '-s', 'run', targetRepo.subcommand, '--' ].concat( targetRepo.subcommandArgs ) );
  [ 'stdout', 'stderr' ].forEach( function ( outType ){
    proc[ outType ].on( 'data', function ( data ){
      process[ outType ].write( data.toString() );
    });
  });
}
else {
  console.log( $( 'npm run' ) );
  process.exit( 1 );
}
