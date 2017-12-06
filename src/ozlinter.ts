/*
 Mozart for Visual Studio Code Extension
 Copyright (C) 2017  Alejandro Valdes

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import cp = require('child_process');

import {DiagnosticSeverity as Severity} from 'vscode';

export interface IOzMessage {
    fileName:string;
    line:number;
    column:number;
    message:string;
    severity:Severity;
}
const IS_WINDOWS = /^win/.test(process.platform);
const noErrorRegex = /% -+ accepted/;

//check which type of error have been sent from the compiler
//some of them have different structures, so a different regex must
//be defined, the following regex detects a unique identifier from the error
//to differentiate them
const bindAnalysisRegex = /\*+ binding analysis.+/;
const staticAnalysisRegex = /\*+ static analysis.+/;
const parseRegex = /\*+ parse.+/;
const syntaxErrorRegex = /\*+ syntax error.+/;

export function validateOz(fileName:string, ozCompilerPath="oz"):Promise<IOzMessage[]>
{
    var validate = new Promise(
        (resolve, reject) =>
        {
            cp.execFile(
            ozCompilerPath,
            ['-c', fileName],
            (error, stdOut, stdErr) =>
            {
                try
                {
                    if (noErrorRegex.test(stdErr))
                    {
                        const compiledFileName = fileName.split('\\').pop().split('/').pop() + "f";
                        if (IS_WINDOWS)
                        {
                            cp.execFile("del", [compiledFileName]);
                        }
                        else
                        {
                            cp.execFile("rm", [compiledFileName]);
                        }
                    }
                    var errors = stdErr.split('%******');
                    var parsedErrors:IOzMessage[] = [];
                    errors.forEach(
                        error =>
                        {
                            var diagnostic:IOzMessage;
                            error = cleanErrorInput(error);
                            if (
                                bindAnalysisRegex.test(error)
                                || parseRegex.test(error)
                                || syntaxErrorRegex.test(error))
                            {
                                diagnostic = parseBindAnalysis(error, fileName);
                            }
                            else if (staticAnalysisRegex.test(error))
                            {
                                diagnostic = parseStaticAnalysis(error, fileName);
                            }
                            if (diagnostic != null)
                            {
                                parsedErrors.push(diagnostic);
                            }
                        });
                    resolve(parsedErrors);
                }
                catch(error)
                {
                    reject(error);
                }
            });
        });
    return Promise.all([validate]).then(results => [].concat.apply([], results));
}

function cleanErrorInput(input:string):string
{
    const newLineRegex = /\r\n?|\n/;
    while (newLineRegex.test(input))
    {
        input = input.replace(newLineRegex, '');
    }
    return input;
}

function parseBindAnalysis(text:string, fileName:string):IOzMessage
{
    var regex = /\*+\s(.*)\s(warning|error).*\%\*\*\%\*\*(.*)\%\*\*\%\*\*.*\/(.*)\.oz.*line\s([0-9]+).*column\s([0-9]+)/;
    var match = regex.exec(text);
    var diagnostic:IOzMessage;
    if (match != null)
    {
        var [_, errorType, textSeverity, message, _, line, column] = match;
        var severity:Severity = textSeverity=="warning" ? Severity.Warning : Severity.Error;
        diagnostic =
            {
                fileName: fileName,
                line: +line,
                column: +column,
                message: (errorType + ": " + message),
                severity: severity
            };
    }
    return diagnostic;
}

function parseStaticAnalysis(text:string, fileName:string):IOzMessage
{
    var regex = /\*\*+\sstatic analysis (warning|error) \*+\%\*\*\%\*\*\s([\w+\s+]+)\%\*\*\%\*\*.*\/(.*)\.oz.*line\s([0-9]+).*column\s([0-9]+)/;
    var match = regex.exec(text);
    var diagnostic:IOzMessage;
    if (match != null)
    {
        var [_, textSeverity, message, _, line, column] = match;
        var severity:Severity = textSeverity=="warning" ? Severity.Warning : Severity.Error;
        diagnostic =
        {
            fileName: fileName,
            line: +line,
            column: +column+1,
            message: ("static analysis: " + message),
            severity: severity
        };
    }
    return diagnostic;
}
