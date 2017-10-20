import * as fs from 'fs';
import { Component, OnInit } from '@angular/core';
import { dialog } from 'electron';
import { ElectronService } from '../../providers/electron.service';

import { QwXmlConverter } from './converter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [QwXmlConverter],
})
export class HomeComponent implements OnInit {

  // Ace editor's properties
  text = '';
  options: any = { printMargin: false };


  constructor(public converter: QwXmlConverter, public electronService: ElectronService) { }

  ngOnInit() {
    // メニューから送られてきたSAVEコマンドへのハンドラを設定。
    this.electronService.ipcRenderer.on('save', () => {
      // 入力をXMLに変換する
      this.converter.convertKmltoXML(this.text)
        .then((result) => {
          // ファイル保存ダイアログの設定
          const window = this.electronService.remote.getCurrentWindow();
          const options: Electron.SaveDialogOptions = {
            title: 'XMLに変換して保存',

            filters: [
              { name: 'XML Files', extensions: ['xml'] },
              { name: 'All Files', extensions: ['*'] }
            ],
            defaultPath: `${result.icao}.xml`
          };
          // エラーありで戻ってきた場合確認
          if (result.errors.length > 0) {
            const choice = this.electronService.remote.dialog.showMessageBox(
              {
                title: '変換で以下の警告が発生しています。続行しますか？',
                message:`* ${result.errors.join('\n* ')}`,
                buttons: ['いいえ', 'はい']
              });
            if (choice === 0) return;
          }
          // ダイアログの表示
          this.electronService.remote.dialog.showSaveDialog(window, options, (filename: string) => {
            if (filename) {
              fs.writeFile(filename, result.xml, { encoding: 'utf8' }, (error) => {
                if (error) {
                  this.electronService.remote.dialog.showErrorBox('保存に失敗しました。', error.message);
                }
              });
            }
          });
        })
        .catch((reason) => {
          this.electronService.remote.dialog.showErrorBox('変換に失敗しました。', reason.message);
        });
    });
  }

  onChange(e: any) {
    // console.log(this.text);
  }

}
