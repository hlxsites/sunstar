# Sunstar Website

Franklin project for https://www.sunstar.com/

## Environments

- Preview: https://main--sunstar--hlxsites.hlx.page/
- Live: https://main--sunstar--hlxsites.hlx.live/
- Edit: https://adobe.sharepoint.com/:f:/r/sites/HelixProjects/Shared%20Documents/sites/sunstar/sunstar

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Adding external JS libraries

You can add external JS libraries to your project but you need to make sure to copy over the files to be used in front end code in browser to the [ext-libs](./ext-libs/) folder. This would make them avaialble for execution in the client browser.

Here are the steps to follow:

1. Add the JS library to the [package.json](./package.json) file in the `dependencies` section. For example, to add the `jslinq` library, add the following line to the [package.json](./package.json) file:

    ```
    "dependencies": {
        "jslinq": "^1.0.22"
    }
    ```

2. Run `npm install` to install the library in the [node_modules](./node_modules) folder.

3. Run
    ```
    npm run copy node_modules/jslinq/build ext-libs jslinq
    ```
    to copy the library from the [node_modules](./node_modules) folder to the [ext-libs](./ext-libs) folder.

4. Add a mapping in [.ext-libs-mapping.json](./.ext-libs-mapping.json) file to map the library to its respective location on [ext-libs](./ext-libs/) folder.

    For example, to map the `jslinq` library, add the following line to the [.ext-libs-mapping.json](./.ext-libs-mapping.json) file:

    ```
        {
            "name": "jslinq",
            "source": "node_modules/jslinq/build",
            "target": "ext-libs/jslinq"
        }
    ```
5. THe library is now available in the [ext-libs](./ext-libs/) folder and can be used in the front end code in the browser. For e.g. , add the following in the fron end code to load the `jslinq` library:

    ```
    await loadScript('/ext-libs/jslinq/jslinq.min.js');
    ```