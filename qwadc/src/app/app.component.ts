import { Component, OnInit } from '@angular/core';
import { ElectronService } from './providers/electron.service';

import { sample } from './data/samplekml';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public electronService: ElectronService) {

    if (electronService.isElectron()) {
      console.log('Mode electron');
      // Check if electron is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.ipcRenderer);
      // Check if nodeJs childProcess is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit() {
    // メニューから送られてきたSAVEコマンドへのハンドラを設定。
    this.electronService.ipcRenderer.on('copy-sample', () => {
      this.electronService.clipboard.writeText(sample);
      this.electronService.remote.dialog.showMessageBox({
        type: 'info',
        message: `テンプレートをクリップボードにコピーしました。
GoogleEarthの左のバーの「お気に入り」にペーストしてください。`});
    });
    this.electronService.ipcRenderer.on('go-to-github', () => {
      this.electronService.shell.openExternal('https://github.com/Ruijihin/qw-apt-data/');
    });
  }
}
