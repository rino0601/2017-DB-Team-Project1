/**
 * Created by rino0 on 2017-03-27.
 */
import React from "react";
import {browserHistory} from "react-router";
import {Button, Dimmer, Form, Header, Loader, Segment} from "semantic-ui-react";
import ServerCreateForm, {fieldNames as serverField} from "../../form/ServerCreateForm";
import SwitchCreateForm, {fieldNames as switchField} from "../../form/SwitchCreateForm";
import StorageCreateForm, {fieldNames as storageField} from "../../form/StorageCreateForm";
import ItemGroup from "../../component/ItemGroup";
import moment from "moment";

function zerofill(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

class AssetEdit extends React.Component {
    static propTypes = {
        params: React.PropTypes.object,
    };
    handleNext = (event) => {
        event.preventDefault();
        if (this.state.removeLeaveHook) {
            this.state.removeLeaveHook();
        }
        browserHistory.push(`/asset/form/confirm/${this.props.params.id}`);
    };

    // static defaultProps = {};
    // static  childContextTypes = {};
    // static contextTypes = {};

    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            type: "none",
            options: [
                {text: "--- 추가할 장비를 선택하세요 ---", value: "none"},
                {text: '서버', value: 'server',},
                {text: '스위치', value: 'network',},
                {text: '스토리지', value: 'storage',},
            ],
            asset: {},
            none: {form: () => <Segment attached={true}/>, submit: null, list: [],},
            server: {form: ServerCreateForm, submit: this.handleServerSubmit, list: [],},
            network: {form: SwitchCreateForm, submit: this.handleSwitchSubmit, list: [],},
            storage: {form: StorageCreateForm, submit: this.handleStorageSubmit, list: [],},
        };
    }

    componentDidMount() {
        const {router, route} = this.props;
        window.onbeforeunload = this.handleLeavePage;
        this.setState({
            isFetching: true,
            removeLeaveHook: router.setRouteLeaveHook(route, this.handleLeavePage),
        });
        fetch(`/api/asset/${this.props.params.id}`).then(res => res.ok ? res.json() : Promise.reject(new Error("서버에서 요청을 거절 했습니다.")))
            .then(message => {
                this.setState({
                    isFetching: false,
                    asset: message
                });
            }).catch(err => {
            alert(err.message);
            this.setState({isFetching: false});
        });
    }

    handleLeavePage = () => {
        return "입력이 완료 되지 않았습니다!. 계속하시겠습니까?";
    };

    componentWillUnmount() {
        window.onbeforeunload = null; // remove listener.
    }

    _handleDeviceSubmit = (fieldName, path, metaBody, listName, manageLabel, values, dispatch) => {
        let asset_id = parseInt(this.props.params.id, 10);
        const body = {};
        Object.assign(body, {
            asset_id,
        }, metaBody(fieldName, values));
        this.setState({isFetching: true});
        return fetch(`/api/${path}`, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(body),
        }).then(res => res.ok ? res.json() : Promise.reject(new Error("서버에서 요청을 거절 했습니다.")))
            .then(message => {
                let manage_num = `${manageLabel}${zerofill(moment(this.state.asset.get_date).year() % 100, 2)}${zerofill(message.id % 1000, 3)}`;
                return fetch(`/api/${path}/${message.id}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify({manage_num}),
                });
            }).then(res => res.ok ? res.json() : Promise.reject(new Error("서버에서 요청을 거절 했습니다.")))
            .then(message => {
                this.setState((state, props) => {
                    state.type = "none";
                    state[listName].list.push(message);
                    state.isFetching = false;
                    return state;
                });
            }).catch(err => {
                alert(err.message);
                this.setState({isFetching: false});
            });
    };
    _handleDeviceDelete = (path, listName, e, value) => {
        this.setState({isFetching: true});
        fetch(`/api/${path}/${value}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        }).then(() => {
            this.setState((state, props) => {
                state[listName].list = state[listName].list.filter(item => item.id !== value);
                state.isFetching = false;
                return state;
            });
        }).catch(err => {
            alert(err.message);
            this.setState({isFetching: false});
        });
    };

    handleServerSubmit = (values, dispatch) => {
        return this._handleDeviceSubmit(serverField, "server", (fieldName, values) => {
            let core_num = parseInt(values[fieldName.core_num], 10);
            let size = parseInt(values[fieldName.size], 10);
            let spec = values[fieldName.spec];
            spec = Number.isInteger(spec) ? {spec_id: spec} : {spec: {spec: spec}};
            let location = values[fieldName.location];
            location = Number.isInteger(location) ? {location_id: location} : {};
            return Object.assign({size, core_num,}, spec, location);
        }, "server", "S", values, dispatch);
    };
    handleServerDelete = (e, {value}) => {
        this._handleDeviceDelete("server", "server", e, value);
    };
    handleSwitchSubmit = (values, dispatch) => {
        return this._handleDeviceSubmit(switchField, "switch", (fieldName, values) => {
            let size = parseInt(values[fieldName.size], 10);
            let spec = values[fieldName.spec];
            spec = Number.isInteger(spec) ? {spec_id: spec} : {spec: {spec: spec}};
            let location = values[fieldName.location];
            location = Number.isInteger(location) ? {location_id: location} : {};
            return Object.assign({size,}, spec, location);
        }, "network", "N", values, dispatch);
    };
    handleSwitchDelete = (e, {value}) => {
        this._handleDeviceDelete("switch", "network", e, value);
    };
    handleStorageSubmit = (values, dispatch) => {
        return this._handleDeviceSubmit(storageField, "storage", (fieldName, values) => {
            let location = values[fieldName.location];
            location = Number.isInteger(location) ? {location_id: location} : {location: {location: location}};

            let spec_ = values[fieldName.new_spec.spec];
            spec_ = Number.isInteger(spec_) ? {spec_id: spec_} : {spec: {spec_name: spec_}};
            let disk_type = values[fieldName.new_spec.disk_type];
            disk_type = Number.isInteger(disk_type) ? {disk_type_id: disk_type} : {disk_type: {spec_type: disk_type}};
            let disk_spec = values[fieldName.new_spec.disk_spec];
            let volume = parseFloat(values[fieldName.new_spec.volume]);
            let spec = Object.assign({disk_spec, volume}, disk_type, spec_);
            spec = {spec};

            return Object.assign({}, spec, location);
        }, "storage", "D", values, dispatch);
    };
    handleStorageDelete = (e, {value}) => {
        this._handleDeviceDelete("storage", "storage", e, value);
    };
    handleTypeChange = (e, {value}) => {
        this.setState({type: value,});
    };

    render() {
        const {params: {asset_num},} = this.props;
        const device = this.state[this.state.type];
        const DeviceForm = device.form;
        return (
            <Dimmer.Dimmable as="div">
                <Dimmer active={this.state.isFetching}>
                    <Loader size='massive'>Loading</Loader>
                </Dimmer>
                <Segment>
                    <Form>
                        <Form.Select label='장비 타입' placeholder='추가 등록할 장비를 선택하세요.' fluid={true}
                                     onChange={this.handleTypeChange}
                                     value={this.state.type}
                                     options={this.state.options}
                        />
                    </Form>
                    <DeviceForm onSubmit={device.submit}/>
                </Segment>
                <Segment attached={true}>
                    <Header>자산:{asset_num}에 등록된 장비 목록</Header>
                    <ItemGroup.Server items={this.state.server.list} onDelete={this.handleServerDelete}/>
                    <ItemGroup.Switch items={this.state.network.list} onDelete={this.handleSwitchDelete}/>
                    <ItemGroup.Storage items={this.state.storage.list} onDelete={this.handleStorageDelete}/>
                </Segment>
                <Button.Group attached={"bottom"}>
                    <Button
                        primary={true} content={"다음으로"} icon='right arrow' labelPosition='right'
                        onClick={this.handleNext}
                    />
                </Button.Group>
            </Dimmer.Dimmable>
        );
    }
}

export default AssetEdit;
