import { kml, apt_parts } from './interfaces';


export class AptKmlParser {

    public defaultRwyWidth = 60;
    public defaultTwyWidth = 30;

    private RE_BUILDING = /buildings*|terminals*/i;
    private RE_RWY = /runways*|rwys*/i;
    private RE_TWY = /taxiways*|twys*/i;
    private RE_APRON = /aprons*/i;
    private RE_LABEL = /labels*|lbl*s|spots*|gates*/i;

    private RE_DFLT_RWY_WIDTH = /(runways*|rwys*)\s*[=:]\s*(\d+)/i;
    private RE_DFLT_TWY_WIDTH = /(taxiways*|twys*)\s*[=:]\s*(\d+)/i;
    private RE_RWY_DESIG = /^(\d\d?)([L|C|R]?)$/;
    private RE_WIDTH_PARAM = /w(idth)*\s*[=:]\s*(\d+)/i;
    private RE_NOLABE_PARAM = /nolabels*/i;

    public parsedObj: apt_parts.IAptData = {
        icao: '',
        buildings: [],
        runways: [],
        taxiways: [],
        aprons: [],
        labels: []
    };

    /**
     * 空港フォルダに設定されたデフォルトの滑走路/誘導路幅を取得します。
     */
    private parseDefaultWidth = (folder: kml.IAptFolder) => {
        try {
            if (folder.description) {
                const rwyWidthMatch = folder.description[0].match(this.RE_DFLT_RWY_WIDTH);
                const twyWidthMatch = folder.description[0].match(this.RE_DFLT_TWY_WIDTH);
                if (rwyWidthMatch) {
                    this.defaultRwyWidth = parseFloat(rwyWidthMatch[2]);
                }
                if (rwyWidthMatch) {
                    this.defaultTwyWidth = parseFloat(twyWidthMatch[2]);
                }
            }
        }
        catch {
            // do nothing.
        }
    }

    /**
     * 構造物もしくはエプロンをパースします。
     */
    private parseArea = (folder: kml.IElementFolder) => {
        const result: apt_parts.IArea[] = [];
        if (!folder.Placemark) {
            return result;
        }
        for (let apron of folder.Placemark) {
            try {
                const obj: apt_parts.IArea = {
                    Name: apron.name[0],
                    Coordinates: []
                }
                const coords = apron.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].trim().split(' ');
                for (let coord of coords) {
                    const lonlat = coord.split(',');
                    obj.Coordinates.push({
                        latitude: parseFloat(lonlat[1]),
                        longitude: parseFloat(lonlat[0])
                    });
                }
                result.push(obj);
            }
            catch {
                console.error(`Skipped to parse area ${apron}.`);
            }
        }
        return result;
    }

    /**
    * 滑走路をパースします。
    */
    private parseRunway = (folder: kml.IElementFolder) => {
        const result: apt_parts.IRunway[] = [];
        if (!folder.Placemark) {
            return result;
        }
        for (let runway of folder.Placemark) {
            try {
                const rwyDesigMatch = runway.name[0].match(this.RE_RWY_DESIG);
                if (rwyDesigMatch) {
                    // 幅を取得
                    let width = this.defaultRwyWidth;
                    if (runway.description) {
                        const widthMatch = runway.description[0].match(this.RE_WIDTH_PARAM);
                        if (widthMatch) {
                            width = parseFloat(widthMatch[2]);
                        }
                    }
                    // 座標を取得
                    const coords = runway.LineString[0].coordinates[0].trim().split(' ')
                    const startLonlat = coords[0].split(',');
                    const endLonlat = coords[coords.length - 1].split(',');
                    const obj: apt_parts.IRunway = {
                        Number: rwyDesigMatch[1],
                        Designator: rwyDesigMatch[2],
                        Start: {
                            latitude: parseFloat(startLonlat[1]),
                            longitude: parseFloat(startLonlat[0])
                        },
                        End: {
                            latitude: parseFloat(endLonlat[1]),
                            longitude: parseFloat(endLonlat[0])
                        },
                        Width: width
                    }
                    result.push(obj);
                }
            }
            catch {
                console.error(`Skipped to parse runway ${runway}.`);
            }
        }
        return result;
    }

    /**
    * 誘導路をパースします。
    */
    private parseTaxiway = (folder: kml.IElementFolder) => {
        const result: apt_parts.ITaxiway[] = [];
        if (!folder.Placemark) {
            return result;
        }
        for (let tway of folder.Placemark) {
            try {
                // 幅とラベルなしフラグを取得
                let width = this.defaultTwyWidth;
                let nolabel = false;
                if (tway.description) {
                    const widthMatch = tway.description[0].match(this.RE_WIDTH_PARAM);
                    if (widthMatch) {
                        width = parseFloat(widthMatch[2]);
                    }
                    if (tway.description[0].match(this.RE_NOLABE_PARAM)) {
                        nolabel = true;
                    }
                }
                // 
                const taxiPoints = [];
                const coords = tway.LineString[0].coordinates[0].trim().split(' ');
                for (let coord of coords) {
                    const lonlat = coord.split(',');
                    taxiPoints.push({
                        latitude: parseFloat(lonlat[1]),
                        longitude: parseFloat(lonlat[0])
                    });
                }
                const obj: apt_parts.ITaxiway = {
                    Designator: tway.name[0],
                    NoLabel: nolabel,
                    Coordinates: taxiPoints,
                    Width: width
                }
                result.push(obj);
            }
            catch {
                console.error(`Skipped to parse taxyway ${tway}.`);
            }
        }
        return result;
    }
    /**
     * ラベルをパースします。
     */
    private parseLabel = (folder: kml.IElementFolder) => {
        const result: apt_parts.ILabel[] = [];
        if (!folder.Placemark) {
            return result;
        }
        for (let label of folder.Placemark) {
            try {
                const lonlat = label.Point[0].coordinates[0].trim().split(',');
                result.push({
                    Label: label.name[0],
                    Coordinate: {
                        latitude: parseFloat(lonlat[1]),
                        longitude: parseFloat(lonlat[0])
                    }
                });
            }
            catch {
                console.error(`Skipped to parse area ${label}.`);
            }
        }
        return result;
    }


    public parseKml = (kml: kml.IKml) => {
        // 空港名を取得
        try {
            this.parsedObj.icao = kml.Document[0].Folder[0].name[0];
        } catch (error) {
            throw new Error('KMLの形式が不正です。空港ICAOコードの名前をつけたフォルダをコピーしてください。');
        }

        // デフォルト幅のパース
        this.parseDefaultWidth(kml.Document[0].Folder[0]);

        for (let folder of kml.Document[0].Folder[0].Folder) {
            if (folder.name[0].match(this.RE_BUILDING)) {
                // BUILDINGのオブジェクト化
                this.parsedObj.buildings = this.parseArea(folder);
            }
            else if (folder.name[0].match(this.RE_RWY)) {
                // RUNWAYのオブジェクト化
                this.parsedObj.runways = this.parseRunway(folder);
            }
            else if (folder.name[0].match(this.RE_TWY)) {
                // TAXIWAYのオブジェクト化
                this.parsedObj.taxiways = this.parseTaxiway(folder);
            }
            else if (folder.name[0].match(this.RE_APRON)) {
                // APRONのオブジェクト化=BUILDINGと同じ
                this.parsedObj.aprons = this.parseArea(folder);
            }
            else if (folder.name[0].match(this.RE_LABEL)) {
                // LABELのオブジェクト化
                this.parsedObj.labels = this.parseLabel(folder);
            }
        }

    }
}