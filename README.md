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
