'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import Year from './Year';
import Month from './Month';
import Day from './Day';
import Hour from './Hour';
import Minute from './Minute';
import './time-picker.css';

export default React.createClass({

    /**
     * 获取年份
     * @returns {number}
     * @private
     */
	_getFullYear() {
		let date = new Date();
		return date.getFullYear();
	},

    /**
     * 获取月份
     * @returns {number}
     * @private
     */
	_getMonth() {
		let date = new Date();
		return date.getMonth() + 1;
	},

    /**
     * 获取日期
     * @returns {number}
     * @private
     */
	_getDate() {
		return new Date().getDate();
	},

    /**
     * 获取小时
     * @returns {number}
     * @private
     */
	_getHours() {
		let date = new Date();
		return date.getHours();
	},

    /**
     * 获取分钟
     * @returns {number}
     * @private
     */
	_getMinutes() {
		let date = new Date();
		return date.getMinutes();
	},

    /**
     * 获取当前时间
     * @private
     */
	_getCurrentTime() {
        let year = this._getFullYear(),
            month = this._getMonth(),
            day = this._getDate(),
            hour = this._getHours(),
            minute = this._getMinutes();

        month = month > 9 ? String(month) : "0" + month;
        day = day > 9 ? String(day) : "0" + day;
        hour = hour > 9 ? String(hour) : "0" + hour;
        minute = minute > 9 ? String(minute) : "0" + minute;

        return {year : year, month : month, day : day, hour : hour, minute : minute};
    },

    /**
     * 获取时间
     * @returns {string}
     * @private
     */
	_getTime() {
		let { year, month, day, hour, minute } = this.state;
		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
	},

    getInitialState() {
        return this._getCurrentTime();
    },

    componentDidMount() {
    	let date = this.props.date;
    	if (date) {
    		let year = date.substr(0, 4),
                month = date.substr(5, 2),
                day = date.substr(8, 2),
                hour = date.substr(11, 2),
                minute = date.substr(14, 2);
	    	this.setState({year : year, month : month, day : day, hour : hour, minute : minute});
    	}
    },

    componentWillReceiveProps(nextProps) {
    	if (nextProps.date && nextProps.date != this.props.date) {
    		let date = nextProps.date,
                year = date.substr(0, 4),
                month = date.substr(5, 2),
                day = date.substr(8, 2),
                hour = date.substr(11, 2),
                minute = date.substr(14, 2);
            this.setState({year, month, day, hour, minute});
    	}
    },

    onScrollYear(year) {
        this.setState({year : year});
    },

    onScrollMonth(month) {
        this.setState({month : month});
    },

    onScrollDay(day) {
        this.setState({day : day});
    },

    onScrollHour(hour) {
        this.setState({hour : hour});
    },

    onScrollMinute(minute) {
        this.setState({minute : minute});
    },

    showTime() {
    	this.props.onOk && this.props.onOk(this._getTime());
    },

    showCancel() {
        this.props.onCancel && this.props.onCancel();
    },

    render () {

        let year = this.state.year,
            month = this.state.month,
            day = this.state.day,
            hour = this.state.hour,
            minute = this.state.minute,
            restrict = this.props.restrict,
            show = this.props.show;

        return (
            <div className={classNames("time-picker", {hide : !show})}>
                <div className="time-picker-mask"></div>
                <div className="cm-wrapper">
                    <div className="pos-center">
                        <ul className="d-row clearfix">
                            <li><Year year={year} onScroll={this.onScrollYear} /></li>
                            <li><Month restrict={restrict} year={year} month={month} onScroll={this.onScrollMonth} /></li>
                            <li><Day restrict={restrict} year={year} month={month} day={day} onScroll={this.onScrollDay} /></li>
                        </ul>
                        <ul className="t-row">
                            <li><Hour restrict={restrict} year={year} month={month} day={day} hour={hour} onScroll={this.onScrollHour} /></li>
                            <li><Minute restrict={restrict} year={year} month={month} day={day} hour={hour} minute={minute} onScroll={this.onScrollMinute} /></li>
                        </ul>
                        <div className="cm-btn">
                            <button className="cm-btn-ok" onClick={this.showTime}>确定</button>
                            <button className="cm-btn-cancel" onClick={this.showCancel}>取消</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});