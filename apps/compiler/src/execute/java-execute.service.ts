import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ExecuteService } from './execute.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class JavaExecuteService extends ExecuteService {
  getFileExtension() {
    return 'java';
  }
  getCompiledFileExtension() {
    return '';
  }
  getCompileCommand(): string {
    return 'javac';
  }
  getCompileCommandArgs(codePath: string): string[] {
    return [
      '--release',
      '11',
      '-J-Xms128m',
      '-J-Xmx256m',
      '-J-Xss512k',
      '-encoding',
      'UTF-8',
      codePath,
    ];
  }
  getExecuteCommand(): string {
    return 'java';
  }
  getExecuteCommandArgs(codePath: string): string[] {
    const tmpPath = path.dirname(codePath);
    return [
      '-cp',
      tmpPath,
      '-Xms1024m',
      '-Xmx1920m',
      '-Xss512m',
      '-Dfile.encoding=UTF-8',
      '-XX:+UseSerialGC',
      '-DONLINE_JUDGE=1',
      '-DBOJ=1',
      'Main',
    ];
  }

  handleError(error: Error) {
    if (error instanceof RuntimeError) {
      if (error.message.includes('java.util.NoSuchElementException')) {
        error.message = 'NoSuchElementException';
      } else if (error.message.includes('java.util.InputMismatchException')) {
        error.message = 'InputMismatchException';
      } else if (error.message.includes('java.lang.NumberFormatException')) {
        error.message = 'NumberFormatException';
      } else if (
        error.message.includes('java.lang.IndexOutOfBoundsException')
      ) {
        error.message = 'IndexOutOfBoundsException';
      } else if (
        error.message.includes('java.lang.ArrayIndexOutOfBoundsException')
      ) {
        error.message = 'ArrayIndexOutOfBoundsException';
      } else if (
        error.message.includes('java.lang.StringIndexOutOfBoundsException')
      ) {
        error.message = 'StringIndexOutOfBoundsException';
      } else if (
        error.message.includes('java.lang.ArithmeticException: divide by zero')
      ) {
        error.message = 'ArithmeticException: divide by zero';
      } else if (error.message.includes('java.lang.ArithmeticException')) {
        error.message = 'ArithmeticException';
      } else if (error.message.includes('java.lang.StackOverflowError')) {
        error.message = 'StackOverflowError';
      } else if (error.message.includes('java.io.FileNotFoundException')) {
        error.message = 'FileNotFoundException';
      } else if (error.message.includes('java.lang.NullPointerException')) {
        error.message = 'NullPointerException';
      } else if (error.message.includes('java.io.IOException')) {
        error.message = 'IOException';
      } else if (error.message.includes('java.lang.IllegalArgumentException')) {
        error.message = 'IllegalArgumentException';
      } else if (error.message.includes('java.util.EmptyStackException')) {
        error.message = 'EmptyStackException';
      } else if (
        error.message.includes('java.util.IllegalFormatConversionException')
      ) {
        error.message = 'IllegalFormatConversionException';
      } else if (
        error.message.includes('java.security.AccessControlException')
      ) {
        error.message = 'AccessControlException';
      } else if (
        error.message.includes('java.lang.NegativeArraySizeException')
      ) {
        error.message = 'NegativeArraySizeException';
      } else if (error.message.includes('java.lang.IllegalStateException')) {
        error.message = 'IllegalStateException';
      } else if (
        error.message.includes('java.util.UnknownFormatConversionException')
      ) {
        error.message = 'UnknownFormatConversionException';
      } else if (
        error.message.includes('java.util.ConcurrentModificationException')
      ) {
        error.message = 'ConcurrentModificationException';
      } else if (error.message.includes('java.lang.ClassCastException')) {
        error.message = 'ClassCastException';
      } else if (error.message.includes('java.lang.ArrayStoreException')) {
        error.message = 'ArrayStoreException';
      } else if (
        error.message.includes('java.lang.UnsupportedOperationException')
      ) {
        error.message = 'UnsupportedOperationException';
      } else if (
        error.message.includes('Error: Could not find or load main class Main')
      ) {
        error.message = 'Could not find or load main class Main';
      } else if (
        error.message.includes(
          'Error: Main method must return a value of type void in class Main',
        )
      ) {
        error.message = 'Main method must return a value of type void';
      } else if (
        error.message.includes('Error: Main method is not static in class Main')
      ) {
        error.message = 'Main method is not static';
      } else if (
        error.message.includes('Error: Main method not found in class Main')
      ) {
        error.message = 'Main method not found';
      }
    }

    throw error;
  }
}
