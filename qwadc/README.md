# QW APT Data Converter (QWADC)

[Google Earth Pro](https://www.google.com/intl/ja/earth/desktop/)を使って描いたターミナルや誘導路等のデータをグラウンドマップに変換するツールです。  
Windowsの方は[こちら]()からビルド済みの実行ファイルがダウンロードできますので、解凍してEXEファイルを実行してください。  


## 開発者向け

#### 依存ライブラリのインストール

アプリケーションルートフォルダに移動して`npm install`します。

```shell
cd qwadc
npm install
```

#### デバッグ実行

下記のコマンドで開発用ウィンドウが立ち上がります。

```shell
npm start
```

#### ビルド

下記のコマンドでビルドできます。  
ビルドすると`app-builds`フォルダ内にできあがるので、フォルダごとコピーして利用してください。

##### For Windows

```shell
npm run electron:windows
```

##### For Linux

```shell
npm run electron:linux
```

##### For MaxOS

```shell
npm run electron:mac
```

## ライセンス表記

このアプリケーションは [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) で公開されている以下のボイラープレートをもとに作成しています。

* angular-electron ([https://github.com/maximegris/angular-electron](https://github.com/maximegris/angular-electron))