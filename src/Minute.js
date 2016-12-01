'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

export default React.createClass({

	_getFullYear() {
		let date = new Date();
		return date.getFullYear();
	},


    _getMonth() {
        let date = new Date();
        return date.getMonth() + 1;
    },

    _getDate() {
        return new Date().getDate();
    },

    _getHours() {
        let date = new Date();
        return date.getHours();
    },

	_getMinutes() {
		let date = new Date();
		return date.getMinutes();
	},

	getInitialState() {
		return {
			start_x : 0,
			start_y : 0,
			move_x : 0,
			move_y : 0,
			delta_x : 0,
			delta_y : 0,
			top : -70,
			minutes : [],
			selectMinute : undefined,
			selectIndex : 3,
			line_height : 35,
            restrict_top : 35
		}
	},

    /**
     * 分钟数据渲染
     * @private
     */
    _renderMinutes() {
        let minutes = this.state.minutes;

        for(let i = 0; i < 60; i++) {
            let m = i;
            if (m < 10) {
                m = '0' + m;
            }
            minutes.push(m);
        }

        this.setState({minutes : minutes});
    },

    /**
     * 获取当前分钟对应的索引值
     * @param minute
     * @returns {undefined}
     * @private
     */
    _findMinuteIndex(minute) {
        let { minutes } = this.state, index = undefined;
        for (let i = 0; i < minutes.length; i++) {
            if (minutes[i] == minute) {
                index = i;
                break;
            }
        }

        this.setState({selectIndex : index, selectMinute : minute});

        return index;
    },

    /**
     * 定位到当前的分钟位置
     * @param index
     * @private
     */
    _initAbsoluteTop(index) {
        let { line_height, minutes } = this.state,
            minuteDOM = ReactDOM.findDOMNode(this.refs.selected), top;
        top = -(index - 1) * line_height;
        minuteDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        minuteDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        this.setState({top : top});
        this.props.onScroll && this.props.onScroll(minutes[index]);
    },

    /**
     * 限制分钟最小显示到哪个位置
     * @param current_year
     * @param current_month
     * @param current_day
     * @param current_hour
     * @param current_minute
     * @private
     */
    _restrictTop(current_year, current_month, current_day, current_hour, current_minute) {
        let year = this._getFullYear(),
            month = this._getMonth(),
            day = this._getDate(),
            hour = this._getHours(),
            minute = this._getMinutes(),
            { line_height } = this.state,
            { restrict } = this.props;

        if (restrict) {
            month = restrict.substr(5, 2);
            day = restrict.substr(8, 2);
            hour = restrict.substr(11, 2);
            minute = restrict.substr(14, 2);
        }

        if (current_year == year && current_month == month && current_day == day && current_hour == hour) {
            let index = this._findMinuteIndex(minute), top;

            top = -(index - 1) * line_height;
            this.setState({restrict_top : top});
        } else {
            this.setState({restrict_top : line_height});
        }
    },

	componentDidMount() {
        let current_year = this.props.year,
            current_month = this.props.month,
            current_day = this.props.day,
            current_hour = this.props.hour,
            current_minute = this.props.minute,
            restrict = this.props.restrict,
            selectIndex;

        // 1. 渲染月份
        this._renderMinutes();

        // 2.找到当前传过来的月份的index值
        selectIndex = this._findMinuteIndex(current_minute);

        // 3.设置初始top值
        this._initAbsoluteTop(selectIndex);

        // 4.限制高度
        if (restrict) {
            let minute = restrict.substr(14, 2);
            this._restrictTop(current_year, current_month, current_day, current_hour, minute);
        } else {
            this._restrictTop(current_year, current_month, current_day, current_hour);
        }
	},

	componentWillReceiveProps(nextProps) {
        if (nextProps.minute != this.props.minute
            || nextProps.hour != this.props.hour
            || nextProps.day != this.props.day
            || nextProps.month != this.props.month
            || nextProps.year != this.props.year) {

            let current_year = nextProps.year,
                current_month = nextProps.month,
                current_day = nextProps.day,
                current_hour = nextProps.hour,
                current_minute = nextProps.minute,
                restrict = nextProps.restrict,
                year = this._getFullYear(),
                month = this._getMonth(),
                day = this._getDate(),
                hour = this._getHours(),
                minute = this._getMinutes(),
                selectIndex;

            if (restrict) {
                month = restrict.substr(5, 2);
                day = restrict.substr(8, 2);
                hour = restrict.substr(11, 2);
                minute = restrict.substr(14, 2);
            }

            if (nextProps.year != this.props.year
                || nextProps.month != this.props.month
                || nextProps.day != this.props.day
                || nextProps.hour != this.props.hour) {
                if (current_year == year && current_month == month && current_day == day && current_hour == hour) {
                    if (current_minute < minute) {
                        current_minute = minute;
                    }
                }

                // 限制高度
                this._restrictTop(current_year, current_month, current_day, current_hour, current_minute);
            } else {
                if (current_year == year && current_month == month && current_day == day && current_hour == hour && current_minute < minute) {
                    current_minute = minute;
                }
            }

            // 1.找到当前传过来的月份的index值
            selectIndex = this._findMinuteIndex(current_minute);

            // 2.设置初始top值
            this._initAbsoluteTop(selectIndex);
        }
	},

	onTouchStart(e) {
        e.preventDefault();
		let touch = e.touches[0];
		this.setState({
			start_x : touch.pageX, 
			start_y : touch.pageY, 
			move_x : touch.pageX,
			move_y : touch.pageY
		});
	},

	onTouchMove(e) {
        e.preventDefault();
        let touch = e.touches[0],
            { move_x, move_y, top, start_x, start_y } = this.state,

            new_move_x = touch.pageX,
            new_move_y = touch.pageY,

            d_x = (new_move_x - move_x) || 0,  // 移动的x轴delta值，相对于上一次滑动
            d_y = (new_move_y - move_y) || 0,  // 移动的x轴delta值，相对于上一次滑动

            total_x = new_move_x - start_x,
            total_y = new_move_y - start_y,

            hourDOM = ReactDOM.findDOMNode(this.refs.selected),

            abs_x = Math.abs(total_x),  // 移动的x轴绝对值，相对于touchStart
            abs_y = Math.abs(total_y),  // 移动的y轴绝对值，相对于touchStart

            newTop;

        if (abs_x === 0) {
            abs_x = 1;
        }

        // 如果竖直方向移动
        if (abs_y > abs_x  && abs_y / abs_x > 1) {

            newTop = d_y + top;

            hourDOM.style.transform = `translate3d(0, ${newTop}px, 0)`;
            hourDOM.style.WebkitTransform = `translate3d(0, ${newTop}px, 0)`;

            this.setState({
                delta_x : total_x,
                delta_y : total_y,
                top : newTop,
                move_x : new_move_x,
                move_y : new_move_y
            });
        }
	},

	onTouchEnd() {
        let { top, delta_y, minutes, line_height, restrict_top } = this.state,

            minuteDOM = ReactDOM.findDOMNode(this.refs.selected),

            index = 0,
            li_num = minutes.length,
            min_top = -(li_num - 2) * line_height,
            max_top = restrict_top;

        if (delta_y < 0) {	// 向上滑
            top = Math.floor(top / line_height) * line_height;
            if (top < min_top) {
                top = min_top;
            }
        } else {
            top = Math.ceil(top / line_height) * line_height;
            if (top > max_top) {
                top = max_top;
            }
        }

        minuteDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        minuteDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        if (top > 0) {
            index = top / line_height - 1;
        } else {
            index = -top / line_height + 1;
        }

        this.setState({
            top : top,
            selectIndex : index,
            selectMinute : minutes[index]
        }, () => {
            this.props.onScroll && this.props.onScroll(minutes[index]);
        });
	},

	render() {

		let minutes = this.state.minutes || [],
			selectIndex = this.state.selectIndex;

		return (
			<div className="cm-time-wrapper">
				<div className="cm-scroll-wrapper">
					<div className="cm-scroll-prev"></div>
					<div className="cm-scroll-curr"></div>
					<div className="cm-scroll-next"></div>
					<ul className="cm-year" 
						onTouchStart={this.onTouchStart} 
						onTouchMove={this.onTouchMove} 
						onTouchEnd={this.onTouchEnd}
						ref="selected">
						{
							minutes.map((m, index) => {
								if (index === selectIndex) {
									return (<li key={"minute"+index} className="selected">{m}</li>);
								} else {
									return (<li key={"minute"+index}>{m}</li>);
								}
								
							})
						}
					</ul>
				</div>
			</div>
		);
	}
});