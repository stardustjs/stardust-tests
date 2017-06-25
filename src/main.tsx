import * as React from "react";
import * as ReactDOM from "react-dom";

import { TestCase, TestCaseDescription, getTestCases } from "./common";

class TestCaseRunner extends React.Component<{
    desc: TestCaseDescription
}, {}> {
    refs: {
        container: HTMLDivElement;
    };

    private c: TestCase;

    public render() {
        return (
            <div style={{
                width: "960px",
                height: "500px"
            }} ref="container"></div>
        );
    }

    private promiseCurrent: Promise<void>;

    public componentDidMount() {
        this.c = this.props.desc.construct();
        let run = async () => {
            await this.c.initialize(this.refs.container, 960, 500);
        };
        if(this.promiseCurrent) {
            this.promiseCurrent.then(run);
        } else {
            this.promiseCurrent = run();
        }
    }

    public componentWillUnmount() {
        let run = async () => {
            await this.c.uninitialize();
        }
        if(this.promiseCurrent) {
            this.promiseCurrent.then(run);
        } else {
            this.promiseCurrent = run();
        }
    }
}

class TestCaseView extends React.Component<{
    desc: TestCaseDescription
}, {
    shouldRun: boolean;
}> {
    constructor(props: { desc: TestCaseDescription }) {
        super(props);
        this.state = {
            shouldRun: false
        };
    }

    public render() {
        return (
            <div className="test-case-view">
                <div className="test-case-header">
                    <button className="pure-button button-run" onClick={() => this.setState({ shouldRun: true })}>Run</button>{" "}
                    <button className="pure-button button-stop" onClick={() => this.setState({ shouldRun: false })}>Stop</button>{" "}
                    <span>{this.props.desc.name}</span>
                </div>
                { this.state.shouldRun ? <div className="test-case-content"><TestCaseRunner desc={this.props.desc} /></div> : null }
            </div>
        )
    }
}

class TestCaseGroupView extends React.Component<{
    descs: TestCaseDescription[]
}, {}> {
    public render() {
        return (
            <div>
            { this.props.descs.map((d, i) => <TestCaseView key={`item-${i}`} desc={d} />)}
            </div>
        )
    }
}

class MainView extends React.Component<{}, {}> {
    public render() {
        let cd = getTestCases();
        return (
            <TestCaseGroupView descs={cd} />
        )
    }
}

ReactDOM.render(<MainView />, document.getElementById("container"));