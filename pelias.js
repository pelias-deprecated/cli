#! /usr/bin/env node

/**
 * The Pelias command-line power tool.
 */

'use strict';

var colors = require( 'colors' ); /* jshint ignore:line */
var childProcess = require( 'child_process' );
var path = require( 'path' );
var fs = require( 'fs' );
var util = require( 'util' );
var requireDir = require( 'require-dir' );

var subcommands = requireDir( 'subcommands' );

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
 * Returns a boolean indicating whether the Git repository in the current
 * dictory has upstream changes that need to be pulled in.
 */
function isGitBranchStale(){
  return $( 'git fetch --dry-run 2>&1' ).length > 0;
}

/**
 * Pretty-print all of the subcommands available for repo named `repoName`.
 */
function printRepoSubcommands( repoName ){
  printOut( util.format( 'Here are the avilable subcommands for `%s`.', repoName ) );
  var commands = subcommands[ repoName ];
  for( var command in commands ){
    var commandObj = commands[ command ];
    printOut( util.format( '    %s: %s', command.green, commandObj.description ) );
  }
}

/**
 * Print the names of all the repos that have subcommands.
 */
function printRepoNames(){
  printOut( 'Here are the available repos:' );
  for( var repo in subcommands ){
    printOut( '    ' + repo.green );
  }
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
    printRepoNames();
    process.exit( 1 );
  }
  else if( args[ 0 ] === '--help' ){
    var helpMessage = fs.readFileSync( path.join(__dirname, 'HELP.txt' ) ).toString();
    printOut( helpMessage );
    process.exit();
  }
  else {
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

    if( !subcommands.hasOwnProperty( targetRepo.name ) ){
      printErr( util.format(
        'Repo `%s` has no subcommands. Open an issue at github.com/pelias/cli if you believe it should.',
        targetRepo.name
      ));

      printRepoNames();
      process.exit();
    }

    var commands = subcommands[ targetRepo.name ];

    if( args.length === 1 ){
      printErr( 'Missing repo subcommand.' );
      printRepoSubcommands( targetRepo.name );
      process.exit();
    }

    targetRepo.subcommand = args[ 1 ];
    if( commands[ targetRepo.subcommand ] === undefined ){
      printErr( util.format( 'Subcommand `%s` not found.', targetRepo.subcommand ) );
      printRepoSubcommands( targetRepo.name );
      process.exit();
    }
    targetRepo.subcommandArgs = args.slice( 2 );
  }

  return targetRepo;
}

function npmInstall(){
  if( fs.existsSync( 'package.json' ) ){
    $( 'npm install' );
  }
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
      if( isGitBranchStale() ){
        printOut( 'Pulling latest changes.' );
        $( 'git pull' );
        printOut( 'Reinstalling.' );
      }
    }
    else {
      printOut( 'Checking out: ' + targetRepo.branch );
      $( 'git checkout -q ' + targetRepo.branch );
      if( isGitBranchStale() ){
        printOut( 'Pulling latest changes.' );
        $( 'git pull' );
      }
      printOut( 'npm installing.' );
      npmInstall();
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
    npmInstall();
  }

  var command = subcommands[ targetRepo.name ][ targetRepo.subcommand ].command;
  var commandStr = command + ' ' + targetRepo.subcommandArgs.join( ' ' );
  childProcess.execSync( commandStr, { stdio: 'inherit' });
}

runRepoSubcommand( parseArgs( process.argv.slice( 2 ) ) );
