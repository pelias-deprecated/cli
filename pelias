'use strict';

var colors = require( 'colors' );
var childProcess = require( 'child_process' );
var path = require( 'path' );
var fs = require( 'fs' );
var util = require( 'util' );

var helpMessage = fs.readFileSync( 'HELP.txt' ).toString();

/**
 * A visually unobtrusive way of executing a shell command and returning its
 * `stdout`.
 */
function $( shellCmd ){
  return childProcess.execSync( shellCmd ).toString();
}

/**
 * Print `msg` to `stdout`, padding it with "pelias: " to distinguish it from
 * the output of the external commands run by this script.
 */
function printOut( msg ){
  console.log( 'pelias:'.blue, msg );
}

/**
 * Like `printOut`, but for printing to `stderr`.
 */
function printErr( msg ){
  console.error( 'pelias:'.blue, 'error:'.red, msg );
}

/**
 * Parse the command-line arguments in `args`, which should be the equivalent
 * of `process.argv.slice( 2 )`, and return an object containing:
 *
 *    name: the name of the repo to target.
 *    branch: the name of the branch to checkout.
 *    subcommand: the name of the script to run via `npm run`
 *    subcommandArgs: an array of the arguments to pass to `npm run $subcommand`.
 */
function parseArgs( args ){
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

  return targetRepo;
}

/**
 * The core of the script, which handles repository cloning, pulling,
 * installing, and subcommand running. The `targetRepo` object argument is
 * expected to be passed in from `parseArgs()`.
 */
function runRepoSubcommand( targetRepo ){
  var peliasCachePath = path.join( process.env.HOME, '.pelias/' );
  if( !fs.existsSync( peliasCachePath ) ){
    fs.mkdirSync( peliasCachePath );
  }

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
      printOut( 'Checking out: ' + targetRepo.branch );
      $( 'git checkout -q ' + targetRepo.branch );
      var stale = $( 'git fetch --dry-run' ).length > 0;
      if( stale ){
        printOut( 'Pulling latest changes.' );
        $( 'git pull' );
      }
      printOut( 'npm installing.' );
      $( 'npm install' );
    }
  }
  else {
    process.chdir( peliasCachePath );
    printOut( 'Cloning repo.' );
    $( 'git clone -q https://github.com/pelias/' + targetRepo.name );
    process.chdir( targetRepo.name );
    if( targetRepo.branch !== 'master' ){
      printOut( 'Checking out: ' + targetRepo.branch );
      $( 'git checkout -q ' + targetRepo.branch );
    }
    printOut( 'npm installing.' );
    $( 'npm install' );
  }

  if( targetRepo.subcommand ){
    var npmScriptArgs = [ '-s', 'run', targetRepo.subcommand, '--' ].concat( targetRepo.subcommandArgs );
    var npmScriptProc = childProcess.spawn( 'npm', npmScriptArgs );
    [ 'stdout', 'stderr' ].forEach( function ( outType ){
      npmScriptProc[ outType ].on( 'data', function ( data ){
        process[ outType ].write( data.toString() );
      });
    });
  }
  else {
    console.log( $( 'npm run' ) );
    process.exit( 1 );
  }
}

runRepoSubcommand( parseArgs( process.argv.slice( 2 ) ) );
