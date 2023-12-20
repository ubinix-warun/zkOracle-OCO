# Explain Coverage Badge Demo for zkApp Project

Code coverage is a metric that measures how much of your code is exercised by your tests. A higher coverage percentage indicates that your tests are more likely to catch bugs.

## Enable json-summary reporter in jest.config.js

```
  coverageReporters: [
    "lcov",
    "json-summary"
  ],
```

## Run coverage report

```
pnpm run coverage

```


## Enable Github Action for coverage-badge

### Setup .github/workflows/ci.yml for Action.

```
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Set up NodeJS
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Git checkout
        uses: actions/checkout@v2
      - name: NPM ci, build, & coverage
        run: |
          cd contracts
          npm install
          npm run coverage --if-present
          pwd

```

### Create Coverage Badges Step.

```
      - name: Create Coverage Badges
        uses: jaywcjlove/coverage-badges-cli@main
        with:
          style: classic
          source: contracts/coverage/coverage-summary.json
          output: contracts/coverage/badges.svg
          jsonPath: totals.percent_covered

```

### Deploy Coverage on Github Pages.

```
      - name: Deploy Coverage
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: contracts/coverage
          destination_dir: coverage

```
