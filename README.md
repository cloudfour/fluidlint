# Fluid Linter

CLI that ensures that [Liquid](https://shopify.github.io/liquid/) features that aren't supported by [Fluid](https://github.com/sebastienros/fluid) are not used.

## Single-Use

```
npx fluidlint
```

## Setting Up In Project

```
npm i -D fluidlint
```

In `package.json`:

```json
  "scripts": {
    "fluidlint": "fluidlint",
  },
```

```
npm run fluidlint
```

## Publishing

- On a non-master branch:

  ```
  npm version [<newversion> | major | minor | patch]
  ```

  This will update the version in `package.json`.

- Create the release notes in a pre-release on GitHub
- Once that PR is merged:

  ```
  git checkout master && git pull && npm publish
  ```

  This will run linting/tests, publish to npm, and create/push the git tag
