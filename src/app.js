/**
 * Created by ryn on 2016/9/5.
 */

'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TimePicker from './TimePicker';
import Immutable from 'immutable';

import './time-picker.css';

const App = React.createClass({

    getInitialState() {
        return {
            show : true,
            initialDate : '2017-12-12 23:12'
        }
    },

    onOk(date) {
        console.log("%c date", "color:red;font-size:18px;", date);
        this.setState({show : true, initialDate : date});
    },

    onCancel() {
        this.setState({show : false});
    },

    render () {
        return (
            <div>
                <button onClick={this.onTimePicker}>show</button>
                {/*<TimePicker show={this.state.show} onOk={this.onOk} onCancel={this.onCancel} />*/}
                <TimePicker date={this.state.initialDate} show={this.state.show} onOk={this.onOk} onCancel={this.onCancel} />
            </div>
        );
    }
});


ReactDOM.render(
    <App />,
    document.getElementById('container')
);
