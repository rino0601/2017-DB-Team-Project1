/**
 * Created by rino0 on 2017-03-27.
 */
import React from "react";
import {Button, Segment} from "semantic-ui-react";
import {browserHistory} from "react-router";
import {SubmissionError} from "redux-form";
import StorageSelectForm, {fieldNames} from "../../form/StorageSelectForm";

class ServiceSelectStorage extends React.Component {
    componentDidMount() {
        const {router, route} = this.props;
        window.onbeforeunload = this.handleLeavePage;
        this.setState({
            removeLeaveHook: router.setRouteLeaveHook(route, this.handleLeavePage),
        });
    }

    handleLeavePage = () => {
        return "입력이 완료 되지 않았습니다!. 계속하시겠습니까?";
    };

    componentWillUnmount() {
        window.onbeforeunload = null; // remove listener.
    }

    handleSkip = (e, props) => {
        e.preventDefault();
        if (this.state.removeLeaveHook) {
            this.state.removeLeaveHook();
        }
        browserHistory.push(`/service/form/server/${this.props.params.id}`);
    };

    handleSubmit = (values, dispatch) => {
        let storage_spec_id = values[fieldNames.storage_spec_id];
        let used_size = parseFloat(values[fieldNames.used_size]);
        let usage = values[fieldNames.usage];
        let service_name_id = this.props.params.id;
        const body = {};
        Object.assign(body, {storage_spec_id, used_size, usage, service_name_id});
        return fetch("/api/service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then(res => res.ok ? res.json() : Promise.reject(new Error("서버에서 요청을 거절 했습니다."))).then(message => {
            if (this.state.removeLeaveHook) {
                this.state.removeLeaveHook();
            }
            browserHistory.push(`/service/form/server/${service_name_id}`);
        }).catch(err => {
            return Promise.reject(new SubmissionError({_error: err.message}));
        });
    };

    render() {
        return (
            <Segment>
                <StorageSelectForm onSubmit={this.handleSubmit}/>
                <Button secondary={true} fluid={true} content={"건너 뛰기"} icon='right arrow' labelPosition='right'
                        onClick={this.handleSkip}/>
            </Segment>
        );
    }
}

export default ServiceSelectStorage;