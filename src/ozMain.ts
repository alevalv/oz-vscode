'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode = require('vscode');
import fs = require('fs');
import {commands, window, workspace, InputBoxOptions} from 'vscode';
import {IOzMessage, validateOz} from './ozlinter'

const IS_WINDOWS = /^win/.test(process.platform);
const LINTER_CONFIGURATION_PROPERTY_NAME = 'enablelinter';
const COMPILER_PATH_PROPERTY_NAME = 'compilerpath';
const OZ_LANGUAGE = 'oz';

let terminal: vscode.Terminal;
let diagnosticCollection: vscode.DiagnosticCollection;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    let disposable = vscode.commands.registerCommand('oz.build', compileAndRun);
    context.subscriptions.push(disposable);
    ozLinting(context);
}

function ozLinting(context: vscode.ExtensionContext):void
{
    console.log("Activating MOzArt for VSCode extension");

    var configuration = workspace.getConfiguration(OZ_LANGUAGE);

    if (!configuration[LINTER_CONFIGURATION_PROPERTY_NAME])
    {
        return;
    }

    var ozCompilerPath:string;
    if (IS_WINDOWS && (!configuration.has[COMPILER_PATH_PROPERTY_NAME] || configuration[COMPILER_PATH_PROPERTY_NAME] == null))
    {
        window.showErrorMessage("Could not find path to the oz executable in the configuration file")
        return;
    }
    else if (!IS_WINDOWS)
    {
        ozCompilerPath = 'ozc';
    }
    else
    {
        ozCompilerPath = configuration[COMPILER_PATH_PROPERTY_NAME];
        if (!fs.existsSync(ozCompilerPath))
        {
            window.showErrorMessage("Cannot find the Oz Compiler at the specified path, check your configuration file")
            return;
        }
    }

    diagnosticCollection = vscode.languages.createDiagnosticCollection(OZ_LANGUAGE);
    context.subscriptions.push(diagnosticCollection);

    context.subscriptions.push(workspace.onDidSaveTextDocument(document => {documentValidator(document, ozCompilerPath)}))
}

function documentValidator(document:vscode.TextDocument, ozCompilerPath:string)
{
    if (document.languageId != OZ_LANGUAGE)
    {
        return;
    }

    validateOz(document.uri.fsPath, false, ozCompilerPath).then(
        errors =>
        {
            diagnosticCollection.clear();

            let diagnosticMap:Map<vscode.Uri, vscode.Diagnostic[]> = new Map();;

            errors.forEach(
                error =>
                {
                    let currentUri = vscode.Uri.file(error.fileName);
                    var line = error.line-1;
                    var startColumn = error.column;
                    var endColumn = error.column;
                    let errorRange = new vscode.Range(line, startColumn, line, endColumn);
                    let errorDiagnostic = new vscode.Diagnostic(errorRange, error.message, error.severity);
                    let diagnostics = diagnosticMap.get(currentUri);
                    if (!diagnostics)
                    {
                        diagnostics = [];
                    }
                    diagnostics.push(errorDiagnostic);
                    diagnosticMap.set(currentUri, diagnostics);
                })



            let entries: [vscode.Uri, vscode.Diagnostic[]][] = [];
            diagnosticMap.forEach(
                (diagnostic, uri) =>
                {
                    entries.push([uri, diagnostic]);
                });

            diagnosticCollection.set(entries);
        }).catch(error =>
        {
            vscode.window.showErrorMessage(error)
        });
}

function compileAndRun(fileURI?: vscode.Uri)
{
    let filePath:string;
    if (fileURI === undefined || fileURI === null || typeof fileURI.fsPath !== 'string') {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            if (!activeEditor.document.isUntitled) {
                if (activeEditor.document.languageId === OZ_LANGUAGE) {
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