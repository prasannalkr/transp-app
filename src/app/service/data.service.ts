import {
    Injectable
} from "@angular/core"
import {
    HttpClient,
    HttpClientModule,
    HttpResponse,
    HttpErrorResponse,
    HttpHeaders
} from "@angular/common/http"
import {
    environment
} from "../../environments/environment";
import {
    Observable
} from 'rxjs';

@Injectable()
export class DataService {

    treeData: any = [];
    dataaa: any = [];
    public httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + btoa("admin:admin")
        })
    };

    constructor(private http: HttpClient) { }

    public getTreeData(): Observable<any> {
        this.http.get('http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/',
            this.httpOptions)
            .toPromise()
            .then(
                (data: any) => {
                    this.dataaa = data.topology[0];
                    let NEtopology = data.topology[0];
                    let nodeLength = (NEtopology.node).length;
                    let count = 0;
                    for (let i = 0; i < nodeLength; i++) {
                        var status = NEtopology.node[i]["netconf-node-topology:connection-status"];
                        if (typeof status !== 'undefined'
                            && status !== null
                            && status !== ''
                            && status == "connected"
                        ) {
                            if ((NEtopology.node[i]).hasOwnProperty("netconf-node-topology:available-capabilities")) {
                                if ((NEtopology.node[i]["netconf-node-topology:available-capabilities"]).hasOwnProperty("available-capability")) {
                                    if ((NEtopology.node[i]["netconf-node-topology:available-capabilities"]["available-capability"][i].hasOwnProperty("capability"))) {
                                        var availableCap = NEtopology.node[i]["netconf-node-topology:available-capabilities"]["available-capability"];
                                        for (var l = 0; l < availableCap.length; l++) {
                                            var photonicMedia = NEtopology.node[i]["netconf-node-topology:available-capabilities"]["available-capability"][l]["capability"];
                                            var photoIndex = photonicMedia.search(/photonic-media/i);
                                            if (photoIndex >= 0) { break; }
                                        }
                                    }
                                }
                            }

                            var nodeId = NEtopology.node[i]["node-id"];
                            if (typeof nodeId !== 'undefined' && nodeId !== null && nodeId !== ''
                                && photoIndex >= 0
                            ) {
                                var NENode = nodeId;
                                this.treeData[count] = {
                                    "filename": NENode,
                                    type: "1",
                                }

                                this.treeData[count].children = this.getSecondNodes(NENode);
                                count++;
                            }
                        }
                    }
                },
                error => { }
            );
        //  console.log(" this.treeData == > ", this.treeData);
        return this.treeData;
    }

    getSecondNodes(NENode) {
        let secondChildren = [];
        this.http.get(
            `http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${NENode}/yang-ext:mount/core-model:network-element`,
            this.httpOptions)
            .toPromise()
            .then(
                data => {
                    if ((data['network-element']['extension'][1]).hasOwnProperty("value-name")
                        && (data['network-element']['extension'][1]).hasOwnProperty("value")) {
                        var topLevelEquipName = data['network-element']['extension'][1]['value-name'];
                        var topLevelEquipVal = data['network-element']['extension'][1]['value'];
                        var topLevelEquipValItems = topLevelEquipVal.split(',');
                    }
                    var count2 = 0;
                    if (topLevelEquipName == "top-level-equipment" && topLevelEquipValItems.length > 0) {
                        for (let l = 0; l < topLevelEquipValItems.length; l++) {
                            var shelfName = topLevelEquipValItems[l].trim();
                            if (typeof shelfName !== 'undefined'
                                && shelfName !== null
                                && shelfName !== '') {
                                secondChildren[count2] = {
                                    "filename": shelfName,
                                    type: "2",
                                };
                                secondChildren[count2].children = this.getThirdNodes(NENode, shelfName);
                                count2++;
                            }
                        }
                    }
                },
                error => { }
            );
        return secondChildren;
    }

    getThirdNodes(NENode, shelfName) {
        let thirdChildren = [];
        this.http.get(
            `http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${NENode}/yang-ext:mount/core-model:equipment/${shelfName}`,
            this.httpOptions)
            .toPromise()
            .then(
                data => {
                    if (data["equipment"][0].hasOwnProperty("contained-holder")) {
                        var containerHolder = data["equipment"][0]["contained-holder"];
                        var modLength = containerHolder.length;
                    }
                    if (modLength > 0) {
                        let count3 = 0;
                        for (let k = 0; k < modLength; k++) {
                            if (containerHolder[k].hasOwnProperty("occupying-fru")) {
                                let modName = (containerHolder[k]["occupying-fru"]).trim();
                                if (typeof modName !== 'undefined' && modName !== null && modName !== '') {
                                    thirdChildren[count3] = {
                                        "filename": modName,
                                        type: "3",
                                    }
                                    thirdChildren[count3].children = this.getFourthNodes(NENode, modName)
                                    count3++;
                                };
                            }

                        }
                    }
                },
                error => { }
            );
        return thirdChildren;
    }


    getFourthNodes(NENode, modName) {
        let fourthChildren = [];
        this.http.get(`http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${NENode}/yang-ext:mount/core-model:equipment/${modName}`,
            this.httpOptions)
            .toPromise()
            .then(
                data => {
                    if (data["equipment"][0].hasOwnProperty("contained-holder")) {
                        var containerHolder = data["equipment"][0]["contained-holder"];
                        var modLength = containerHolder.length;
                    }
                    if (modLength > 0) {
                        var count4 = 0;
                        for (let m = 0; m < modLength; m++) {
                            if (containerHolder[m].hasOwnProperty("occupying-fru")) {
                                let modName = (containerHolder[m]["occupying-fru"]).trim();
                                if (typeof modName !== 'undefined' && modName !== null && modName !== '') {
                                    fourthChildren[count4] = {
                                        "filename": modName,
                                        type: "4",
                                        "NENode": NENode,
                                        "lastNode": true,
                                        children: []
                                    };
                                    count4++;
                                };
                            }

                        }
                    }
                },
                error => { }
            );
        return fourthChildren;
    }

    public getData(): Observable<any> {
        return this.http.get(environment.rhsServiceURL, this.httpOptions);
    }

    public checkExistenceOfLeaf(nodeId) {
        return this.http.get(`http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${nodeId}/yang-ext:mount/core-model:network-element`, this.httpOptions);
    }

    public getOtsiInterfaceStatus(nodeId, uuid) {
        return this.http.get(`http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${nodeId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-status`, this.httpOptions);
    }

    public getOtsiInterfaceConfiguration(nodeId, uuid) {
        return this.http.get(`http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${nodeId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-configuration`, this.httpOptions);
    }

    public getOtsiInterfaceCapability(nodeId, uuid) {
        return this.http.get(`http://172.29.145.7:8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/${nodeId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-capability`, this.httpOptions);
    }

    public saveLaserConfig(NEId, uuid, laserConfigValue) {
        return this.getOtsiInterfaceStatus(NEId, uuid)
        .subscribe(
            data => {
                data["otsi-interface-status"]["laser-properties"]["laser-status"] = laserConfigValue;
                console.log("Data => ", data);
                 this.http.put(`http://172.29.145.7:8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/${NEId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-status`,
                     data,
                     this.httpOptions
                 ).subscribe(
                    data => {
                        console.log("PUT Request is successful ", data);
                    },
                    error => {
                        console.log("Error", error);
                    }
                ); 
            });
    }

    public saveTotalPowerWarnThresholdLower(NEId, uuid, totalPowerWarnThresholdLower){
        return this.getOtsiInterfaceConfiguration(NEId, uuid)
        .subscribe(
            data => {
                data["otsi-interface-configuration"]["total-power-warn-threshold-lower"] = totalPowerWarnThresholdLower;
                console.log("Data => ", data);
                 this.http.put(`http://172.29.145.7:8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/${NEId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-configuration`,
                     data,
                     this.httpOptions
                 ).subscribe(
                    data => {
                        console.log("PUT Request is successful ", data);
                    },
                    error => {
                        console.log("Error", error);
                    }
                ); 
            });
    }
    
    public saveTotalPowerWarnThresholdUpper(NEId, uuid, totalPowerWarnThresholdUpper){
        return this.getOtsiInterfaceConfiguration(NEId, uuid)
        .subscribe(
            data => {
                data["otsi-interface-configuration"]["total-power-warn-threshold-upper"] = totalPowerWarnThresholdUpper;
                console.log("Data => ", data);
                 this.http.put(`http://172.29.145.7:8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/${NEId}/yang-ext:mount/photonic-media:otsi-interface-pac/${uuid}/otsi-interface-configuration`,
                     data,
                     this.httpOptions
                 ).subscribe(
                    data => {
                        console.log("PUT Request is successful ", data);
                    },
                    error => {
                        console.log("Error", error);
                    }
                ); 
            });
    }
}