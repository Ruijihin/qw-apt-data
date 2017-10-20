export interface IParseResult {
    icao: string;
    xml: string;
    errors: string[];
}

export namespace kml {
    export interface IKmlCoords {
        coordinates?: string[]
    }
    export interface IOuterBoundary {
        LinearRing?: IKmlCoords[]
    }
    export interface IPolygon {
        outerBoundaryIs?: IOuterBoundary[]
    }
    export interface IPlacemark {
        name?: string[];
        description?: string[];
        LineString?: IKmlCoords[];
        Point?: IKmlCoords[];
        Polygon?: IPolygon[];
    }
    export interface IElementFolder {
        name?: string[];
        Placemark?: IPlacemark[];
    }
    export interface IAptFolder {
        name?: string[];
        description?: string[];
        Folder?: IElementFolder[];
    }
    export interface IDocument {
        Folder?: IAptFolder[];
    }
    export interface IKml {
        Document?: IDocument[];
    }
}



export namespace apt_parts {
    export interface IAptData {
        icao: string;
        buildings: IArea[];
        runways: IRunway[];
        taxiways: ITaxiway[];
        aprons: IArea[];
        labels: ILabel[];
    }
    export interface ILatLon {
        latitude: number;
        longitude: number;
    }
    export interface IArea {
        Name: string;
        Coordinates: ILatLon[];
    }
    export interface IRunway {
        Number: string;
        Designator: string;
        Start: ILatLon;
        End: ILatLon;
        Width: number;
    }
    export interface ITaxiway {
        Designator: string;
        NoLabel: boolean;
        Coordinates: ILatLon[];
        Width: number;
    }
    export interface ILabel {
        Label: string;
        Coordinate: ILatLon;
    }
}
