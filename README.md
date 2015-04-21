# pelias-cli
[![NPM](https://nodei.co/npm/pelias-cli.png)](https://nodei.co/npm/pelias-cli/)

The Pelias command-line powertool, which lets you interact with all of the key repositories (like the API,
elasticsearch schema, and importers) in one place via `git`-style subcommands.

## install
```
sudo npm install -g pelias-cli
```

## usage

For a detailed help message:

```
pelias --help
```

Example usage might look something like:

```
pelias schema create_index
pelias openstreetmap import
pelias geonames#experimental-branch import -i US
pelias api start
```

## registering repos with the CLI
The CLI only recognizes Pelias repositories with a correspondingly named JSON configuration file in `subcommands/` (for
instance, `subcommands/api.json` for the `pelias/api` repository). Each one defines the available scripts, with a
description and the shell command(s) it aliases to.
