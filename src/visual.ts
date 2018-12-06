module powerbi.extensibility.visual {
    "use strict";
    var L = typeof L !== 'undefined' ? L : window['L'];
    var map: L.Map;
    var markers;
    var showing = true;
    //exporting value from visual format tab
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
        constructor(options: VisualConstructorOptions) {
            this.showcs = true; //Activates the clusters
            markers = new L.MarkerClusterGroup(); //creats the clusters container
            this.target = options.element; //selects the target for adding Map div
            this.target.innerHTML = '<div id="mapy" style="height:100vh;width:100vw;"></div>'; //adding map div
            map = L.map('mapy').setView([35.658, 51.403], 10); //selects map center view
            L.tileLayer('http://localhost/mapfiles/{z}/{x}/{y}.png', { maxZoom: 17, minZoom: 10 }).addTo(map); //adds the map layer from the url and sets max and min zoom
            map.on('click', clickdid); //sets click function
            function clickdid(e) {
                var latlng = e.latlng || e.layer.getLatLng(); //gets latitude and langitude
                var popup = L.popup({ closeButton: false, autoClose: false, closeOnClick: false, closeOnEscapeKey: false });
                L.popup()
                    .setLatLng(latlng)
                    .setContent("مختصات:" + e.latlng.toString())
                    .openOn(map); //shows longitude and lotitude
            }

            map.addLayer(markers); //adds the empty clusters layer
        }

        public update(options: VisualUpdateOptions) {
            //GETTING "Show Clusters" setting
            var propertyGroupName: string = "dpmap";
            var propertyGroups: DataViewObjects = options.dataViews[0].metadata.objects;
            this.showcs = getValue<boolean>(propertyGroups, propertyGroupName, "showCluster", true);

            //GETTING langitudes,latitudes and zooms
            map.removeLayer(markers);
            markers = new L.MarkerClusterGroup();
            // console.log(options.dataViews[0].table.columns);
            const { columns, rows } = options.dataViews[0].table;
            const datas = rows.map(function (row, idx) {
                let data = row.reduce(function (d, v, i) {
                    const role = Object.keys(columns[i].roles)[0]
                    d[role] = v;
                    return d;
                }, {});
                markers.addLayer(L.marker([data['latitude'], data['longitude']], { title: data['tooltips'] }).bindPopup(data['tooltips']));
            });
            map.addLayer(markers);

            //activating or deactiving clusters.
            if (showing != this.showcs) {
                if (this.showcs) {
                    map.addLayer(markers);
                    showing = this.showcs;
                }
                else {
                    map.removeLayer(markers);
                    showing = this.showcs;
                }
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            //Configuring visual format tab
            let objectName: string = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'dpmap':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: objectName,
                        properties: {
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