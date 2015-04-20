'use strict';

var args = process.argv.slice( 2 );

function printErr( msg ){
  console.error( msg );
}

function printOut( msg ){
  console.log( msg );
}

var targetRepo = {};

if( args.length === 0 ){
  printErr( 'Missing repo name. See `pelias --help` for usage.' );
  process.exit( 1 );
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
}

console.log( JSON.stringify( targetRepo, undefined, 4 ) );
