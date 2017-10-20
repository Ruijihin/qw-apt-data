import { Injectable } from '@angular/core';

import { parseString } from 'xml2js';
import { LatLonEllipsoidal as LatLon } from 'geodesy';
import { IParseResult, apt_parts, kml } from './interfaces';
import { AptKmlParser } from './parser';



interface ITwayPoint {
    Index: number;
    Coordinates: apt_parts.ILatLon;
}
interface ITwayPath {
    Start: number
    End: number
    Width: number
    Name: number
}

@Injectable()
export class QwXmlConverter {

    /**
     * 構造物情報をXML形式に変換して書き出します。
     * 構造物の頂点座標は、基準経緯度からの東西/南北への直交座標で定義します。
     */
    public convertBuilding = (areas: apt_parts.IArea[]) => {
        let result = `
<!-- =============================== -->
<!-- =============================== -->
<!-- ====== Buildings section ====== -->
<!-- =============================== -->
<!-- =============================== -->
`;
        for (let area of areas) {
            const base = new LatLon(
                area.Coordinates[0].latitude,
                area.Coordinates[0].longitude
            );
            result +=
                `
<!-- ${area.Name} -->
<SceneryObject
  lat="${base.lat}"
  lon="${base.lon}">
  <Footprint
    <Poly
      <Point
        X="0"
        Y="0"/>`;
            for (let i = 1; i < area.Coordinates.length; i++) {
                // 起点からの方角と距離を求める
                const latlon = new LatLon(
                    area.Coordinates[i].latitude,
                    area.Coordinates[i].longitude
                );
                const bearing = base.initialBearingTo(latlon);
                const distance = base.distanceTo(latlon);
                // 方位角による極座標(2/πを起点に時計回り)をXY直行座標に変換する
                const theta = (-bearing + 90) * Math.PI / 180;
                const x = distance === 0 ? 0 : distance * Math.cos(theta);
                const y = distance === 0 ? 0 : distance * Math.sin(theta);

                result +=
                    `
      <Point
        X="${x}"
        Y="${y}"/>`;
            }
            result +=
                `
    />
  />
</SceneryObject>
`;
        }
        return result;
    }

    /**
     * エプロン情報をXML形式に変換して書き出します。
     */
    public convertApron = (areas: apt_parts.IArea[]) => {
        let result = `
<!-- =============================== -->
<!-- =============================== -->
<!-- ======== Apron section ======== -->
<!-- =============================== -->
<!-- =============================== -->

<Aprons>
`;
        for (let area of areas) {
            result +=
                `
  <!-- ${area.Name} -->
  <Apron surface="ASPHALT">
  `;

            for (let i = 1; i < area.Coordinates.length; i++) {
                result +=
                    `
    <Vertex
      lat="${area.Coordinates[i].latitude}"
      lon="${area.Coordinates[i].longitude}" />`;
            }
            result +=
                `
  </Apron>
`;
        }
        result +=
            `
</Aprons>
`;
        return result;
    }

    /**
     * 滑走路情報をXML形式に変換して書き出します。
     */
    public convertRunway = (runways: apt_parts.IRunway[]) => {
        let result = `
<!-- =============================== -->
<!-- =============================== -->
<!-- ======= Runways section ======= -->
<!-- =============================== -->
<!-- =============================== -->`;
        for (let runway of runways) {
            // LCRの判定
            const designator =
                runway.Designator === 'L' ? 'LEFT' :
                    runway.Designator === 'C' ? 'CENTER' :
                        runway.Designator === 'R' ? 'RIGHT' : '';
            // 最初と最後の中間地点を割り出す
            const startLatlon = new LatLon(
                runway.Start.latitude,
                runway.Start.longitude
            );
            const endtLatlon = new LatLon(
                runway.End.latitude,
                runway.End.longitude
            );
            const bearing = startLatlon.initialBearingTo(endtLatlon);
            const length = startLatlon.distanceTo(endtLatlon);
            const midPoint = startLatlon.destinationPoint(length / 2, bearing);
            result += `
<Runway
  number="${runway.Number}"
  designator="${designator}"
  lat="${midPoint.lat}"
  lon="${midPoint.lon}"
  heading="${bearing}"
  length="${length}M"
  width="${runway.Width}M"/>
`;
        }
        return result;
    }


    /**
     * ラベル(スポット名)をXML形式に変換して書き出します。
     */
    public convertLabel = (labels: apt_parts.ILabel[], drawHeader: boolean = true) => {
        let result = ''
        if (drawHeader) {
            result += `
<!-- =============================== -->
<!-- =============================== -->
<!-- ======== Label section ======== -->
<!-- =============================== -->
<!-- =============================== -->`;
        }
        for (let label of labels) {
            result += `
<TaxiwayParking
  number="${label.Label}"
  lat="${label.Coordinate.latitude}"
  lon="${label.Coordinate.longitude}"
  name="GATE"/>
`;
        }
        return result;
    }

    /**
     * 誘導路情報をXML形式に変換して書き出します。
     * 誘導路名のラベルは、誘導路の中間点にスポット名として別個に書き出す仕様としています。
     */
    public convertTaxiway = (taxiways: apt_parts.ITaxiway[]) => {
        // 下ごしらえ
        let tpIdx = -1; // TaxiwayPoint全体を通してのIDX。0から。
        let pathIdx = 0; // TaxiwayPath全体を通してのIDX。0から。
        const allTwayPoints: ITwayPoint[][] = [];
        const allTwayPaths: ITwayPath[][] = [];
        const twayLabels: apt_parts.ILabel[] = [];

        for (let taxiway of taxiways) {
            // 一つの誘導路は複数のTaxiwayPointとPathから構成される。
            // 出力結果の可読性向上のためにあとでコメントを入れたいので、
            // 誘導路ごとにtwayXxxxに分けてallTwayXxxxに突っ込んでいる。
            const twayPoints: ITwayPoint[] = []
            const twayPaths: ITwayPath[] = []
            twayPoints.push({
                Index: ++tpIdx,
                Coordinates: taxiway.Coordinates[0]
            });
            for (let i = 1; i < taxiway.Coordinates.length; i++) {
                twayPoints.push({
                    Index: ++tpIdx,
                    Coordinates: taxiway.Coordinates[i]
                });
                twayPaths.push({
                    Start: tpIdx - 1,
                    End: tpIdx,
                    Width: taxiway.Width,
                    Name: pathIdx++
                })
            }
            allTwayPoints.push(twayPoints);
            allTwayPaths.push(twayPaths);
            // ラベルなしフラグが設定されていなければ中間地点にラベルをスポット名として設置する
            if (!taxiway.NoLabel) {
                const firstLatlon = new LatLon(
                    taxiway.Coordinates[0].latitude,
                    taxiway.Coordinates[0].longitude
                );
                const lastLatlon = new LatLon(
                    taxiway.Coordinates[taxiway.Coordinates.length - 1].latitude,
                    taxiway.Coordinates[taxiway.Coordinates.length - 1].longitude
                );
                const bearing = firstLatlon.initialBearingTo(lastLatlon);
                const length = firstLatlon.distanceTo(lastLatlon);
                const midPoint = length === 0 ? firstLatlon :
                    firstLatlon.destinationPoint(length / 2, bearing);
                twayLabels.push({
                    Label: taxiway.Designator,
                    Coordinate: {
                        latitude: midPoint.lat,
                        longitude: midPoint.lon
                    }
                });
            }
        }
        // 出力の時間
        let result = `
<!-- =============================== -->
<!-- =============================== -->
<!-- ====== Taxiways section ======= -->
<!-- =============================== -->
<!-- =============================== -->
`;
        result += `
<!-- =============================== -->
<!-- == Taxiway Label definitions == -->
<!-- =============================== -->
`;
        result += this.convertLabel(twayLabels, false);
        result += `
<!-- =============================== -->
<!-- ==== TaxiPoint definitions ==== -->
<!-- =============================== -->
`;
        for (let i = 0; i < allTwayPoints.length; i++) {
            result += `
<!-- ====== ${taxiways[i].Designator} ======= -->`;
            for (let point of allTwayPoints[i]) {
                result += `
<TaxiwayPoint
  index="${point.Index}"
  lat="${point.Coordinates.latitude}"
  lon="${point.Coordinates.longitude}"/>
`;
            }

        }
        result += `
<!-- =============================== -->
<!-- ==== TaxiPath definitions ===== -->
<!-- =============================== -->`;
        for (let i = 0; i < allTwayPaths.length; i++) {
            result += `
<!-- ====== ${taxiways[i].Designator} ======= -->`;
            for (let path of allTwayPaths[i]) {
                result += `
<TaxiwayPath
  type="TAXI"
  start="${path.Start}"
  end="${path.End}"
  width="${path.Width}M"
  name="${path.Name}"/>`;
            }

        }
        return result;
    }


    /**
     * KMLを読み込み、それぞれの要素を束ねて有効なXML形式として書き出します。
     */
    public convertKmltoXML = (kml: string) => {
        return new Promise<IParseResult>((resolve, reject) => {
            parseString(kml, (err, result) => {
                try {
                    const obj = <kml.IKml>result.kml;
                    const parser = new AptKmlParser();
                    parser.parseKml(obj);

                    const converter = new QwXmlConverter();
                    const building = converter.convertBuilding(parser.parsedObj.buildings);
                    const label = converter.convertLabel(parser.parsedObj.labels);
                    const runway = converter.convertRunway(parser.parsedObj.runways);
                    const taxiway = converter.convertTaxiway(parser.parsedObj.taxiways);
                    const apron = converter.convertApron(parser.parsedObj.aprons);

                    // エラーチェック
                    const errors: string[] = [];
                    // エプロン89個制約の確認(最初と最後の座標が同じなのでプログラム状は90個まで)
                    for (let apr of parser.parsedObj.aprons) {
                        if (apr.Coordinates.length > 90) {
                            errors.push(`${apr.Name}の頂点数が89を超えており、表示が不正になる場合があります。修正するにはポリゴンを分割して超点数を89以下に抑える他にありません。`);
                        }
                    }
                    
                    resolve({
                        errors: errors,
                        icao: parser.parsedObj.icao,
                        xml: `<?xml version="1.0" encoding="ISO-8859-1"?>

<!-- Created by QW APT Data Converter (${new Date().toDateString()}) -->

<FSData
  version="9.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="bglcomp.xsd">
${building}

<Airport>
${label}
${taxiway}
${runway}
${apron}
</Airport>

</FSData>`
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
