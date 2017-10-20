# QW787 Japanese airport ground map data project

The repository of KML2XML utility that enables us to build airport ground map files for [Quality Wings 787](http://www.qualitywingssim.com/787.html) in Google Earth Pro, and the files (being) created by it.

> Currently Japanese language only.

* [QW APT Data Converter (QWADC)](/qwadc)  
  [Google Earth Pro](https://www.google.com/intl/ja/earth/desktop/)を使って描いたターミナルや誘導路等のデータをグラウンドマップに変換するツールです。  
  Windowsの方は[こちら](https://github.com/Ruijihin/qw-apt-data/releases)からビルド済みの実行ファイルがダウンロードできますので、解凍してEXEファイルを実行してください。  

* [グラウンドマップファイル](/ground-map-files)  
  QWDACを利用して作成した[グラウンドマップファイル(XML)](/ground-map-files/xml)と、そのもととなった[KMLファイル](/ground-map-files/kml)です。  
  シミュレーターで利用される場合はXMLのみ`FSXフォルダ/QualityWings/QW787/Navdata/APT Data`へコピーしてください。

* [グラウンドマップファイル作成ルール](/docs/for-creaters.md)  
  作成中

* [QW787グラウンドマップファイル仕様](/docs/mapfile-specification.md)  
  これまでに分かっているマップファイルの仕様をまとめています。  
  公開されているファイルを自分の好みに応じて調整する場合などに参考にしてください。