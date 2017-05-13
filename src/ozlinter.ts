'use strict';

import vscode = require('vscode');
import path = require('path');
import cp = require('child_process');

import {DiagnosticSeverity as Severity} from 'vscode';

export interface IOzMessage {
    fileName:string;
    line:number;
    column:number;
    message:string;
    severity:Severity;
}

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
                    var errors = stdErr.split('%******');
                    var parsedErrors:IOzMessage[] = [];
                    errors.forEach(
                        error =>
                        {
                            var diagnostic:IOzMessage;
                            //check which type of error have been sent from the compiler
                            //some of them have different structures, so a different regex must
                            //be defined
                            const bindAnalysisRegex = /\*+ binding analysis.+/;
                            const staticAnalysisRegex = /\*+ static analysis.+/;
                            const parseRegex = /\*+ parse.+/;
                            const syntaxErrorRegex = /\*+ syntax error.+/;

                            error = removeNewLines(error);
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

function removeNewLines(input:string):string
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
