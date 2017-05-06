MOzArt for VSCode Extension
===========================

This extension adds support to the MOzArt language to Visual Studio Code. It provides syntax coloring, common snippets and a linter.

# Linting

To use the included linter, set property `oz.enablelinter` with `true`. If you are on Windows, you must set `oz.compilerpath` with the path to your compiler (ozc.exe); for Linux, the extension assumes that the Oz compiler is in the path. The errors are extracted from compiler output.

# Executing code from Visual Studio Code

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
