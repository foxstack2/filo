# Filo

Filo is a light frontend library that facilitates communication between different parts of a browser extension.

This repository is a monorepo that contains two libraries, namely filo and filo-react. The latter library provides a set
of useful React hooks that encapsulate the functionality of the filo client.

```
/core       @foxstack/filo
/react-hook @foxstack/filo-react-hook
/examples   a collection of examples used to validate the functionality of the aforementioned libraries.
```

## Usage

Check examples.

# Contributing

`cd` to the lib dir and run the scripts there. Some useful scripts are listed here:

```bash
# Delete the output directory and rebuild the package.
pnpm run clean:build
```