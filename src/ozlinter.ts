'use strict';

import vscode = require('vscode');
import path = require('path');
import cp = require('child_process');

import {window} from 'vscode';

export enum Severity
{
    Warning = 0,
    Error
}

export interface IOzMessage {
    fileName:string;
    line:number;
    column:number;
    message:string;
    severity:Severity;
}

export function validateOz(fileName:string, validateOnSave = true, ozCompilerPath="oz"):Promise<IOzMessage[]>
{
    var validate;
    if (validateOnSave)
    {
        validate = Promise.resolve([]);
    }
    else
    {
        validate = new Promise(
            (resolve, reject) =>
            {
                var fileName = window.activeTextEditor.document.fileName;
                cp.execFile(
                ozCompilerPath,
                ['-c', fileName],
                (error, stdOut, stdErr) =>
                {
                    try
                    {
                        var errors = stdErr.split('%******************** ');
                        var parsedErrors:IOzMessage[] = [];

                        errors.forEach(
                            error =>
                            {

                                var regex = /.*(warning).*\n\%\*\*\n\%\*\*(.*)\n\%\*\*\n\%\*\*.*\/(.*)\.oz.*line\s([0-9]+).*column\s([0-9]+)/;
                                var match = regex.exec(error);



                                if (match != null)
                                {
                                    var [_, severity, message, _, line, column] = match;

                                    parsedErrors.push({fileName:fileName, line:+line, column:+column, message:message, severity:Severity.Warning});
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
    }

    return Promise.all([validate]).then(results => [].concat.apply([], results));
}