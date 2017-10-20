import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { clipboard, ipcRenderer, remote, shell } from 'electron';
import * as childProcess from 'child_process';

@Injectable()
export class ElectronService {

  clipboard: typeof clipboard;
  ipcRenderer: typeof ipcRenderer;
  remote: typeof remote;
  shell: typeof shell;
  childProcess: typeof childProcess;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.clipboard = window.require('electron').clipboard;
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.remote = window.require('electron').remote;
      this.shell = window.require('electron').shell;
      this.childProcess = window.require('child_process');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
