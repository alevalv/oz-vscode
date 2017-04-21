'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
let terminal: vscode.Terminal;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    let disposable = vscode.commands.registerCommand('oz.build', compileAndRun);

    context.subscriptions.push(disposable);
}

function compileAndRun(fileURI?: vscode.Uri)
{
    let filePath:string;
    if (fileURI === undefined || fileURI === null || typeof fileURI.fsPath !== 'string') {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            if (!activeEditor.document.isUntitled) {
                if (activeEditor.document.languageId === 'oz') {
                    filePath = activeEditor.document.fileName;
                } else {
                    vscode.window.showErrorMessage('The active file is not a MOzArt source file');
                    return;
                }
            } else {
                vscode.window.showErrorMessage('The active file needs to be saved before it can be run');
                return;
            }
        } else {
            vscode.window.showErrorMessage('No open file to run in terminal');
            return;
        }
    } else {
        filePath = fileURI.fsPath;

    }
    var compiledFile = filePath.substring(0, filePath.length-2)+'ozf';
    const command = `ozc -c ${filePath} && ozengine ${compiledFile} && rm compiledFile`;
    terminal = terminal ? terminal : vscode.window.createTerminal('MOzArt');
    terminal.sendText(command);
    terminal.show();
}


// this method is called when your extension is deactivated
export function deactivate() {
}