[DEPRECATED] MOzArt for VSCode Extension
===========================

[![Current Version](https://img.shields.io/github/release/alevalv/oz-vscode.svg?style=flat-square)](https://github.com/alevalv/oz-vscode/releases)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/alevalv.oz-vscode.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=alevalv.oz-vscode)
[![Issues](https://img.shields.io/github/issues/alevalv/oz-vscode.svg?style=flat-square)](https://github.com/alevalv/oz-vscode/issues)

**This extension is merged with the [Oz Extension](https://marketplace.visualstudio.com/items?itemName=mozart-oz.vscode-oz) from Mozart available at [GitHub](https://github.com/mozart/vscode-oz), which also has a better handling of mozart code and all the goodies of this extension as of 1.0.0. From now onwards it won't receive any updates and it will be archived. Please install the [Mozart official extension](https://marketplace.visualstudio.com/items?itemName=mozart-oz.vscode-oz) (which I'm also a maintainer) and remove this one. Thank you for using this extension :)**

---

This extension adds support for the MOzArt language to Visual Studio Code. It provides syntax coloring, common snippets and a linter.

Linting
-------

To use the included linter, set property `oz.enablelinter` with `true`. If you are on Windows, you must set `oz.compilerpath` with the path to your compiler (ozc.exe); for Linux, the extension assumes that the Oz compiler is in the path. The errors are extracted from compiler output.

Linting is performed when a file is saved.

Executing code from Visual Studio Code
--------------------------------------

You can add the following code to the project's tasks.json to run Oz code from VSCode (if you have a different Oz path, modify them before running, for Windows Only):

```json
{
    "version": "0.1.0",
    "tasks": [
        {
            "taskName": "build",
            "command": "ozc",
            "windows": {
                "command": "C:\\Program Files (x86)\\Mozart\\bin\\ozc.exe"
            },
            "isBuildCommand": true,
            "isShellCommand": true,
            "isBackground": true,
            "args": [
                "-c",
                "${file}"
            ],
            "showOutput": "silent"
        },
        {
            "taskName": "run",
            "command": "ozengine",
            "windows": {
                "command": "C:\\Program Files (x86)\\Mozart\\bin\\ozengine.exe"
            },
            "isShellCommand": true,
            "args": [
                "${fileBasenameNoExtension}.ozf"
            ],
            "showOutput": "always",
            "isTestCommand": true,
            "isBackground": false
        },
        {
            "taskName": "clean",
            "command": "rm",
            "isShellCommand": true,
            "args": [
                "${fileBasenameNoExtension}.ozf"
            ],
            "showOutput": "silent"
        }
    ]
}

```
