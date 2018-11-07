## Development workflow

### Requirements

- npm i 

### Commands

- Launching server localy: `npm start`
- Build: `npm build`
- Run tests: `npm test`
- Run tests with coverage outpur: `npm run test:coverage`
- Publish new version on this repo: `npm run publish:dev` (you will only be able to use this command in a fork)
- Publish new version to personal github page: `npm run publish:prod` (this command will only work for me)


### Extras

VSCode workspace config to hide transpiled scripts files and all the assets at the root of the `src` folder.

```json
{
    "files.exclude": {
        "**/scripts/*.js": true,
        "**/src/*.png": true,
        "**/src/*.svg": true
    }
}
```