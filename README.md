### oz-vscode Extension
This extension add supports to the MOzArt language to Visual Studio Code.

It is published as an early alpha and it could contain multiple bugs.

Source code can be found at [GitHub](https://github.com/alevalv/oz-vscode)

To compile oz code in Visual Studio Code you can add this to your tasks.json of your project:

```
{
    "version": "0.1.0",
    "tasks": [
        {
            "taskName": "build",
            "command": "ozc",
            "isShellCommand": true,
            "isBackground": true,
            "args": [
                "-c",
                "${file}"
            ],
            "showOutput": "always",
            "isBuildCommand": true
        },
        {
            "taskName": "run",
            "command": "ozengine",
            "isShellCommand": true,
            "args": [
                "${fileBasenameNoExtension}.ozf"
            ],
            "showOutput": "always",
            "isTestCommand": true
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
