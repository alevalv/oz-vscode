MOzArt for VSCode Extension
===========================

This extension adds support to the MOzArt language to Visual Studio Code.

It is considered a beta release and it could contain multiple bugs.

Source code can be found at [GitHub](https://github.com/alevalv/oz-vscode)

# Linting

To enable linting of MOzArt code, you must set on your `settings.json` the properties `oz.enablelinter` with `true` and `oz.compilerpath` with the path to your compiler if you are in Windows, for *nix based machines, the extension assumes that the ozc compiler is in the path.

# Executing code from Visual Studio Code

You can add the following code to the project's tasks.json to run Oz code from VSCode, remember to uncomment the lines according to your current operating system:

```json
{
    "version": "0.1.0",
    "tasks": [
        {
            "taskName": "build",

            //uncomment this line to compile on windows
            //"command": "C:\\Program Files (x86)\\Mozart\\bin\\ozc.exe",

            //uncomment this line to compile on unix systems
            //"command": "ozc",

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

            //uncomment this line to compile on windows
            //"command": "C:\\Program Files (x86)\\Mozart\\bin\\ozengine.exe",

            //uncomment this line to compile on unix systems
            //"command": "ozengine",

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
