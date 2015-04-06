# pelias-cli
The Pelias command-line powertool, which lets you interact with all of the key repositories (like the API,
elasticsearch schema, and importers) in one place via `git`-style subcommands.

## install
Just drop `pelias` into your `PATH`.

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
