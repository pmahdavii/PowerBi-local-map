module powerbi.extensibility.visual.pmap3515B81CCEAD4A41A9B63A977C32350F  {
    "use strict";
    var L = typeof L !== 'undefined' ? L : window['L'];
    var map: L.Map;
    var maark: L.Marker;
    var markers;
    export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object = objects[objectName];
            if (object) {
                let property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }
    export class pmap implements IVisual {
        public showcs: boolean;
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private basemap: L.TileLayer;
        constructor(options: VisualConstructorOptions) {
            this.showcs = true;
            markers = new L.MarkerClusterGroup();
            this.target = options.element;
            console.log(typeof L);
            this.target.innerHTML = '<div id="mapy" style="height:100vh;width:100vw;"></div>';
            map = L.map('mapy').setView([35.658, 51.403], 10);
            L.tileLayer('http://localhost/mapfiles/{z}/{x}/{y}.png', { maxZoom: 17, minZoom: 10 }).addTo(map);
            //maark=L.marker([35.6799671,51.3908486]).addTo(map);
            map.on('click', clickdid);
            function clickdid(e) {
                var latlng = e.latlng || e.layer.getLatLng();
                var popup = L.popup({ closeButton: false, autoClose: false, closeOnClick: false, closeOnEscapeKey: false });
                L.popup()
                    .setLatLng(latlng)
                    .setContent("مختصات:" + e.latlng.toString())
                    .openOn(map);
            }

            //markers.addLayer(L.marker([35.680248, 51.405406]));
            //markers.addLayer(L.marker([35.684825, 51.393292]));
            map.addLayer(markers);
        }
        public update(options: VisualUpdateOptions) {
            var propertyGroupName: string = "dpmap";
            var propertyGroups: DataViewObjects = options.dataViews[0].metadata.objects;
            this.showcs = getValue<boolean>(propertyGroups, propertyGroupName, "showCluster", true);
            console.log("VAL:" + this.showcs);
            if (this.showcs) {
                map.addLayer(markers);
            }
            else {
                map.removeLayer(markers);
            }
            // console.log(options.dataViews[0].table.columns);
            markers = new L.MarkerClusterGroup();
            const { columns, rows } = options.dataViews[0].table;
            const datas = rows.map(function (row, idx) {
                let data = row.reduce(function (d, v, i) {
                    const role = Object.keys(columns[i].roles)[0]
                    d[role] = v;
                    return d;
                }, {});
                //console.log(data);
                //console.log(data['longitude']);
                //console.log(data['latitude']);
                //console.log(data['tooltips']);
                markers.addLayer(L.marker([data['latitude'], data['longitude']], { title: data['tooltips'] }).bindPopup(data['tooltips']));
            });
            map.addLayer(markers);

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            console.log("DATAVIEW" + dataView);
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            let objectName: string = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'dpmap':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: objectName,
                        properties: {
                            //showCluster: true,
                            showCluster: this.showcs,
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }

    }
}