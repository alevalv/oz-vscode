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

export function activate(context: vscode.ExtensionContext)
{
    console.log("Activating MOzArt for VSCode extension");

    var configuration = workspace.getConfiguration(OZ_LANGUAGE);

    if (!configuration[LINTER_CONFIGURATION_PROPERTY_NAME])
    {
        return;
    }

    var ozCompilerPath:string;
    if (IS_WINDOWS && configuration[COMPILER_PATH_PROPERTY_NAME] == null)
    {
        window.showErrorMessage(
            "Could not find path to the oz executable in the configuration file")
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
            window.showErrorMessage(
                "Cannot find the Oz Compiler at the specified path, check your configuration file")
            return;
        }
    }

    diagnosticCollection = vscode.languages.createDiagnosticCollection(OZ_LANGUAGE);
    context.subscriptions.push(diagnosticCollection);

    context.subscriptions.push(workspace.onDidSaveTextDocument(
        document => {documentValidator(document, ozCompilerPath)}))
}

function documentValidator(document:vscode.TextDocument, ozCompilerPath:string)
{
    if (document.languageId != OZ_LANGUAGE)
    {
        return;
    }

    validateOz(document.uri.fsPath, ozCompilerPath).then(
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

export function deactivate() {
}