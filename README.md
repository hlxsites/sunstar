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

## Adding Visual Tests
Visual testing is integrated as a [Github workflow](https://github.com/hlxsites/sunstar/blob/main/.github/workflows/visual-tests.yaml) which executes on any PR submission or modification. The testing framwork does a screenshot diff betwen the `main` and PR `branch`. The screenshots are taken from the following places:
- [Block library](https://main--sunstar--hlxsites.hlx.page/tools/sidekick/library.html?plugin=blocks&path=/sidekick/blocks/&index=0)
- [Test paths](https://github.com/hlxsites/sunstar/blob/b4dff52eb2c126c54655829bf110719d77cafe92/.github/workflows/visual-tests.yaml#L8) (Space seperated list of paths to test)
    For e.g. if your change is on a page like `/brands`, you can add it to the list as below
      ```
      env:
      TEST_PATHS: "/ /career/yuya-yoshisue /brands"
      ```     

⚠️  While proposing a PR with visual changes, please ensure that it has adequate visual testing coverage by adding impacted places at one or both places mentioned above.

## Adding external JS libraries

You can add external JS libraries to your project but you need to make sure to copy over the files to be used in front end code in browser to the [ext-libs](./ext-libs/) folder. This would make them available for execution in the client browser.

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
