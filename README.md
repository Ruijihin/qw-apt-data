# QW787 Japanese airport ground map data project

The repository of KML2XML utility that enables us to build airport ground map files for [Quality Wings 787](http://www.qualitywingssim.com/787.html) with [Google Earth Pro](https://www.google.com/intl/ja/earth/desktop/), and the files (being) created by it.

> Currently Japanese language only.

![top-image](https://user-images.githubusercontent.com/7758830/31813238-9ddc5cec-b5c0-11e7-9864-3117d6839c0e.png)

### 概要

グラウンドマップファイルは [Airport Design Editro](http://www.scruffyduck.org/airport-design-editor/4584106799) を利用することでBGLファイルから生成することもできますが、アドオンシーナリーでは往々にしてグラウンドテクスチャとADEファイルの実態があっていない場合があります。また、ADEによる変換では、誘導路名が見づらくなることが多くあります。

このため、[Google Earth Pro](https://www.google.com/intl/ja/earth/desktop/)を用いて線や図形を引くことで、実用的なグラウンドマップファイルを生成するためのツールを開発し、またそれを用いたマップファイルを充実させるためのプロジェクトです。

### コンテンツ

* [QW APT Data Converter (QWADC)](/qwadc)  
  Google Earth Pro を使って描いたターミナルや誘導路等のデータをグラウンドマップに変換するツールです。  
  Windowsの方は[こちら](https://github.com/Ruijihin/qw-apt-data/releases)からビルド済みの実行ファイルがダウンロードできますので、解凍してEXEファイルを実行してください。  

* [グラウンドマップファイル](/ground-map-files)  
  QWDACを利用して作成した[グラウンドマップファイル(XML)](/ground-map-files/xml)と、そのもととなった[KMLファイル](/ground-map-files/kml)です。  
  シミュレーターで利用される場合はXMLのみ`FSXフォルダ/QualityWings/QW787/Navdata/APT Data`へコピーしてください。

* [グラウンドマップファイル作成ルール(作成中)](/docs/for-creaters.md)  
  グラウンドマップファイルの作成にご協力いただける方は、こちらをご覧ください。

* [QW787グラウンドマップファイル仕様](/docs/mapfile-specification.md)  
  これまでに分かっているマップファイルの仕様をまとめています。  
  公開されているファイルを自分の好みに応じて調整する場合などに参考にしてください。