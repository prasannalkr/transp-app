import {
    Component, AfterViewInit
} from '@angular/core';
import {
    NestedTreeControl
} from '@angular/cdk/tree';
import {
    MatTreeNestedDataSource
} from '@angular/material/tree';
import {
    BehaviorSubject,
    of as observableOf
} from 'rxjs';
import {
    DataService
} from "./service/data.service";
export class FileNode {
    children: FileNode[];
    filename: string;
    type: any;
}
import { forkJoin } from 'rxjs';


@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
    providers: [DataService]
})
export class AppComponent implements AfterViewInit {
    public telefonicaData: any;
    public counter: number;
    public count: number;
    public performanceCounter: number;
    public performanceCount: number;
    public performanceTimer: any;
    public opticalTimer: any;
    public nestedTreeControl: NestedTreeControl<FileNode>;
    public nestedDataSource: MatTreeNestedDataSource<any>;
    public nestedDataSource1: MatTreeNestedDataSource<any>;
    public dataChange: BehaviorSubject<FileNode[]> = new BehaviorSubject<FileNode[]>([]);
    public opticalPowerData: any;
    public opticalPowerEditables: any;
    public performanceData: any;
    public opticalPower: any;
    public treeData: any;
    public showRight: boolean;
    public showProgress: boolean;
    public showFullProgress: boolean;
    public showPage: boolean;
    public autoRefreshEnable: boolean;
    public refreshIntervals = [];
    public intervalValue: number;
    public minutes: number;
    public seconds: number;
    public RXminInvalid: boolean;
    public RXMinValue: any;
    public RXMaxValue: any;
    public RXmaxInvalid: boolean;
    public rhsServiceData: object;
    public leafNode: string;
    public nodeId: string;
    public uuid: any;
    public otsiInterfaceStatus: object;
    public otsiInterfaceConfiguration: object;
    public otsiInterfaceCapability: object;
    public interfaceStatus: boolean;
    public interfaceConfiguration: boolean;
    public interfaceCapability: boolean;
    public notFoundRHSData: boolean;
    public shelfName: any = '';
    public modName: any = '';
    public leafId: any = '';

    constructor(private dataService: DataService) {
        this.showRight = false;
        this.nestedTreeControl = new NestedTreeControl<FileNode>(this._getChildren);
        this.nestedDataSource = new MatTreeNestedDataSource();
        this.dataChange.subscribe(data => this.nestedDataSource.data = data);
        this.showPage = true;
        this.treeData = dataService.getTreeData();
        this.dataChange.next(this.treeData);
        this.refreshIntervals = [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5];
        this.intervalValue = 5;
        this.minutes = 0;
        this.seconds = 0;
        this.RXminInvalid = false;
        this.RXmaxInvalid = false;
        this.showFullProgress = true;
        setTimeout(() => {
            this.showFullProgress = false;
            this.intervalValue = 5;
            this.counter = 0;
        }, 55000);
        this.showPage = true;
        this.autoRefreshEnable = false;
        this.notFoundRHSData = false;
    }

    validateRXminValue() {
        var RXmin = this.opticalPowerData.rx.RXMinAllowedMin;
        var RXmax = this.opticalPowerData.rx.RXMinAllowedMax;
        var RXnewVal = this.opticalPowerEditables.opticalPowerRxLower;
        this.RXminInvalid = true;
        let RXnewVal1 = parseFloat(RXnewVal.replace(",", "."));

        if ((parseFloat(RXmin) <= RXnewVal1) && (RXnewVal1 <= parseFloat(RXmax))) {
            this.RXminInvalid = false;
        }
    }

    setDefaultRXmin() {
        this.opticalPowerEditables.opticalPowerRxLower = this.opticalPowerData.rx.totalPowerLowerWarnThresholdDefault.toString();
        this.validateRXminValue();
    }


    validateRXmaxValue() {
        var RXminLower = this.opticalPowerData.rx.RXMaxAllowedMin;
        var RXmaxUpper = this.opticalPowerData.rx.RXMaxAllowedMax;
        var RXnewValMax = this.opticalPowerEditables.opticalPowerRxUpper;
        this.RXmaxInvalid = true;
        let RXnewValMax1 = parseFloat(RXnewValMax.replace(",", "."));
        if ((parseFloat(RXminLower) <= RXnewValMax1) && (RXnewValMax1 <= parseFloat(RXmaxUpper))) {
            this.RXmaxInvalid = false;
        }
    }


    setDefaultRXmax() {
        this.opticalPowerEditables.opticalPowerRxUpper = this.opticalPowerData.rx.totalPowerUpperWarnThresholdDefault.toString();
        this.validateRXmaxValue();
    }


    showRightPanel(leafNode, shelfName, modName, nodeId, $event) {
        if (this.leafId !== '') {
            var activeLeafId = document.getElementById(this.leafId);
            activeLeafId.classList.remove("leafActive");
        }
        this.leafId = $event.srcElement.id;
        $event.srcElement.classList.add("leafActive");


        this.showProgress = true;
        this.showRight = false;
        this.notFoundRHSData = false;
        this.interfaceConfiguration = false;
        this.interfaceCapability = false;
        this.leafNode = leafNode;
        this.nodeId = nodeId;
        this.shelfName = shelfName;
        this.modName = modName;
        this.uuid = '';
        this.intervalValue = 60;
        this.count = 60;
        this.counter = 0;
        this.autoRefreshEnable = false;
        this.performanceCount = 0;
        this.minutes = 0;
        this.seconds = 0;

        clearInterval(this.performanceTimer);

        this.fetchData('all');

        setTimeout(() => {
            if (this.showRight == false) {
                this.showProgress = false;
                this.notFoundRHSData = true;
            }
        }, 10000);
    }

    ngAfterViewInit() {
    }

    private _getChildren = (node: FileNode) => {
        return observableOf(node.children);
    };

    hasNestedChild = (_: number, nodeData: FileNode) => {
        return !(nodeData.type);
    };

    onChangeRefreshInt(intervalValue) {
        this.intervalValue = intervalValue;
        this.startTimer();
    }

    private autoRefresh(e) {
        this.autoRefreshEnable = !this.autoRefreshEnable;
        if (this.autoRefreshEnable) {
            this.startTimerPerformance()
        } else {
            this.autoRefreshEnable = false;
            clearInterval(this.performanceTimer);
        }
    }

    private startTimer(callfrom?: any) {
        clearInterval(this.opticalTimer);
        this.count = this.intervalValue;
        this.opticalTimer = setInterval(() => {
            this.counter = --this.count;
            if (this.counter == 0) {
                this.fetchData('optical');
                this.count = this.intervalValue;
            }
        }, 2000)
    }


    private startTimerPerformance() {
        if (!this.autoRefreshEnable) {
            this.performanceCount = 0;
        } else {
            clearInterval(this.performanceTimer);
            this.performanceCount = 900;
            this.fetchData('performance');
            this.performanceTimer = setInterval(() => {
                this.performanceCounter = --this.performanceCount;
                this.minutes = Math.floor(this.performanceCounter / 60);
                this.seconds = this.performanceCounter % 60;
                if (this.performanceCounter == 0) {
                    this.fetchData('performance');
                    this.performanceCount = 900;
                }
            }, 1000);
        }
    }


    private checkExistenceOfLeaf(type) {

        this.dataService.checkExistenceOfLeaf(this.nodeId).subscribe(
            data => {
                var ltp = data["network-element"]["ltp"];
                for (var n = 0; n < ltp.length; n++) {
                    if (ltp[n].hasOwnProperty('physical-port-reference')) {
                        if (ltp[n]["physical-port-reference"][0] == this.leafNode) {
                            this.uuid = ltp[n]["lp"][0]["uuid"];

                            let otsiInterfaceStatus = this.dataService.getOtsiInterfaceStatus(this.nodeId, this.uuid);
                            let otsiInterfaceConfiguration = this.dataService.getOtsiInterfaceConfiguration(this.nodeId, this.uuid);
                            let otsiInterfaceCapability = this.dataService.getOtsiInterfaceCapability(this.nodeId, this.uuid);

                            forkJoin([otsiInterfaceStatus, otsiInterfaceConfiguration, otsiInterfaceCapability]).subscribe(results => {
                                var statusResults = results[0];
                                var configurationResults = results[1];
                                var capabilityResults = results[2];

                                if (statusResults.hasOwnProperty("otsi-interface-status")) {
                                    if (statusResults["otsi-interface-status"].hasOwnProperty("laser-properties")) {
                                        if (statusResults["otsi-interface-status"]["laser-properties"].hasOwnProperty("laser-status")) {
                                            this.interfaceStatus = true;
                                        }
                                    }
                                }

                                if (configurationResults.hasOwnProperty("otsi-interface-configuration")) {
                                    if (configurationResults["otsi-interface-configuration"].hasOwnProperty("laser-control")) {
                                        this.interfaceConfiguration = true;
                                    }
                                }

                                if (capabilityResults.hasOwnProperty("otsi-interface-capability")) {
                                    if (capabilityResults["otsi-interface-capability"].hasOwnProperty("total-power-warn-threshold")) {
                                        if (capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"].hasOwnProperty("total-power-lower-warn-threshold-min")) {
                                            this.interfaceCapability = true;
                                        }
                                    }
                                }

                                if (this.interfaceStatus && this.interfaceConfiguration && this.interfaceCapability) {
                                    var laserStatus = statusResults["otsi-interface-status"]["laser-properties"]["laser-status"];
                                    var laserControlConfiguration = configurationResults["otsi-interface-configuration"]["laser-control"];

                                    var RXTotalPower = statusResults["otsi-interface-status"]["received-power"]["total-power"];
                                    var TXTotalPower = statusResults["otsi-interface-status"]["transmited-power"]["total-power"];
                                    var laserTemperature = statusResults["otsi-interface-status"]["laser-properties"]["laser-temperature"];
                                    var laserBiasCurrent = statusResults["otsi-interface-status"]["laser-properties"]["laser-bias-current"];

                                    var totalPowerLowerWarnThresholdMin = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-lower-warn-threshold-min"];
                                    var totalPowerLowerWarnThresholdMax = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-lower-warn-threshold-max"];
                                    var totalPowerWarnThresholdLower = configurationResults["otsi-interface-configuration"]["total-power-warn-threshold-lower"];
                                    var totalPowerLowerWarnThresholdDefault = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-lower-warn-threshold-default"];

                                    var totalPowerUpperWarnThresholdMin = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-upper-warn-threshold-min"];
                                    var totalPowerUpperWarnThresholdMax = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-upper-warn-threshold-max"];
                                    var totalPowerWarnThresholdUpper = configurationResults["otsi-interface-configuration"]["total-power-warn-threshold-upper"];
                                    var totalPowerUpperWarnThresholdDefault = capabilityResults["otsi-interface-capability"]["total-power-warn-threshold"]["total-power-upper-warn-threshold-default"];

                                    var centralFrequency = statusResults["otsi-interface-status"]["selected-central-frequency"]["central-frequency"];
                                    var channelNumber = statusResults["otsi-interface-status"]["selected-central-frequency"]["channel-number"];

                                    if (type == 'optical') {
                                        this.opticalPowerData = {
                                            "rx": {
                                                "RxTotalPower": RXTotalPower,
                                                "RXMinAllowedMin": totalPowerLowerWarnThresholdMin,
                                                "RXMinAllowedMax": totalPowerLowerWarnThresholdMax,
                                                "totalPowerWarnThresholdLower": totalPowerWarnThresholdLower,
                                                "totalPowerLowerWarnThresholdDefault": totalPowerLowerWarnThresholdDefault,
                                                "RXMaxAllowedMin": totalPowerUpperWarnThresholdMin,
                                                "RXMaxAllowedMax": totalPowerUpperWarnThresholdMax,
                                                "totalPowerWarnThresholdUpper": totalPowerWarnThresholdUpper,
                                                "totalPowerUpperWarnThresholdDefault": totalPowerUpperWarnThresholdDefault
                                            },
                                            "tx": {
                                                "TXTotalPower": TXTotalPower,
                                                "laserTemperature": laserTemperature,
                                                "laserBiasCurrent": laserBiasCurrent
                                            }
                                        }
                                    } else {
                                        this.rhsServiceData = {
                                            "laserState": {
                                                "status": laserStatus,
                                                "laserControlConfiguration": laserControlConfiguration
                                            },
                                            "opticalPower": {
                                                "rx": {
                                                    "RxTotalPower": RXTotalPower,
                                                    "RXMinAllowedMin": totalPowerLowerWarnThresholdMin,
                                                    "RXMinAllowedMax": totalPowerLowerWarnThresholdMax,
                                                    "totalPowerWarnThresholdLower": totalPowerWarnThresholdLower,
                                                    "totalPowerLowerWarnThresholdDefault": totalPowerLowerWarnThresholdDefault,
                                                    "RXMaxAllowedMin": totalPowerUpperWarnThresholdMin,
                                                    "RXMaxAllowedMax": totalPowerUpperWarnThresholdMax,
                                                    "totalPowerWarnThresholdUpper": totalPowerWarnThresholdUpper,
                                                    "totalPowerUpperWarnThresholdDefault": totalPowerUpperWarnThresholdDefault
                                                },
                                                "tx": {
                                                    "TXTotalPower": TXTotalPower,
                                                    "laserTemperature": laserTemperature,
                                                    "laserBiasCurrent": laserBiasCurrent
                                                }
                                            },
                                            "opticalPowerEditables": {
                                                "opticalPowerRxLower": totalPowerWarnThresholdLower,
                                                "opticalPowerRxUpper": totalPowerWarnThresholdUpper
                                            },
                                            "wavelength": {
                                                "lambda": (centralFrequency !== 0) ? ((299792458 * 1000) / (centralFrequency)).toFixed(2) : 0,
                                                "frequency": (centralFrequency !== 0) ? (centralFrequency / 1000000).toFixed(2) : centralFrequency,
                                                "channelNr": channelNumber
                                            },
                                        }

                                        this.getPerformanceResult();;
                                        this.opticalPowerData = this.rhsServiceData["opticalPower"];
                                        this.opticalPowerEditables = this.rhsServiceData["opticalPowerEditables"];
                                        this.showProgress = false;
                                        this.showRight = true;
                                        this.startTimer();
                                    }
                                }
                            });
                        }
                    }
                }
            })
    }

    private updatePerformance() {
        this.getPerformanceResult();
    }

    private fetchData(type) {

        if (type == 'performance') {
            this.updatePerformance();
        } else {
            this.checkExistenceOfLeaf(type);
        }
    }

    public getPerformanceResult() {
        this.performanceData = {
            "correctedBits": '',
            "uncorrectedBits": '',
            "correctedBytes": '',
            "uncorrectedBytes": '',
        };

        this.dataService.getOtsiInterfacePerformance(this.nodeId, this.uuid)
            .subscribe(
                (data: any) => {
                    if (data.hasOwnProperty("otsi-interface-current-performance")) {
                        if (data["otsi-interface-current-performance"].hasOwnProperty("current-performance-data-list") &&
                            data["otsi-interface-current-performance"]["current-performance-data-list"].length > 0) {
                            if (data["otsi-interface-current-performance"]["current-performance-data-list"]["0"].hasOwnProperty("performance-data")) {
                                if (data["otsi-interface-current-performance"]["current-performance-data-list"]["0"]["performance-data"].hasOwnProperty("fec-properties-pac")) {
                                    return this.performanceData = {
                                        "correctedBits": data["otsi-interface-current-performance"]["current-performance-data-list"]["0"]["performance-data"]["fec-properties-pac"]["corrected-bits"],
                                        "uncorrectedBits": data["otsi-interface-current-performance"]["current-performance-data-list"]["0"]["performance-data"]["fec-properties-pac"]["uncorrectable-bits"],
                                        "correctedBytes": data["otsi-interface-current-performance"]["current-performance-data-list"]["0"]["performance-data"]["fec-properties-pac"]["corrected-bytes"],
                                        "uncorrectedBytes": data["otsi-interface-current-performance"]["current-performance-data-list"]["0"]["performance-data"]["fec-properties-pac"]["uncorrectable-bytes"],
                                    }
                                }
                            }
                        }
                    }
                },
                error => {

                }
            );
    }

    public saveLaserConfig(laserConfigValue) {
        this.dataService.saveLaserConfig(this.nodeId, this.uuid, laserConfigValue);
        setTimeout(() => {
            this.checkExistenceOfLeaf('all');
        }, 16000);
    }

    public saveTotalPowerWarnThresholdLower(totalPowerWarnThresholdLower) {
        this.dataService.saveTotalPowerWarnThresholdLower(this.nodeId, this.uuid, totalPowerWarnThresholdLower);
    }

    public saveTotalPowerWarnThresholdUpper(totalPowerWarnThresholdUpper) {
        this.dataService.saveTotalPowerWarnThresholdUpper(this.nodeId, this.uuid, totalPowerWarnThresholdUpper);
    }
}
