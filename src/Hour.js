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

	getInitialState() {
		return {
			start_x : 0,
			start_y : 0,
			move_x : 0,
			move_y : 0,
			delta_x : 0,
			delta_y : 0,
			top : -70,
			hours : [],
			selectHour : undefined,
			selectIndex : 3,
			line_height : 35,
			restrict_top : 35
		}
	},


    _renderHours() {
        let hours = this.state.hours;

        for(let i = 0; i < 24; i++) {
            let h = i;
            if (h < 10) {
                h = '0' + h;
            }
            hours.push(h);
        }

        this.setState({hours : hours});
    },

    _findHourIndex(hour) {
        let { hours } = this.state, index = undefined;
        for (let i = 0; i < hours.length; i++) {
            if (hours[i] == hour) {
                index = i;
                break;
            }
        }

        this.setState({selectIndex : index, selectHour : hour});

        return index;
    },

    _initAbsoluteTop(index) {
        let { line_height, hours } = this.state,
            hourDOM = ReactDOM.findDOMNode(this.refs.selected), top;
        top = -(index - 1) * line_height;
        hourDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        hourDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        this.setState({top : top});
        this.props.onScroll && this.props.onScroll(hours[index]);
    },

    _restrictTop(current_year, current_month, current_day) {
        let year = this._getFullYear(),
            month = this._getMonth(),
            day = this._getDate(),
            hour = this._getHours(),
            { line_height } = this.state,
            { restrict } = this.props;

        if (restrict) {
            month = restrict.substr(5, 2);
            day = restrict.substr(8, 2);
            hour = restrict.substr(11, 2);
        }

        if (current_year == year && current_month == month && current_day == day) {
            let index = this._findHourIndex(hour), top;

            top = -(index - 1) * line_height;
            this.setState({restrict_top : top});
        } else {
            this.setState({restrict_top : line_height});
        }
    },

	componentDidMount() {

        let current_year = this.props.year,
            current_hour = this.props.hour,
            current_month = this.props.month,
            current_day = this.props.day,
            restrict = this.props.restrict,
            selectIndex;

        // 1. 渲染月份
        this._renderHours();

        // 2.找到当前传过来的月份的index值
        selectIndex = this._findHourIndex(current_hour);

        // 3.设置初始top值
        this._initAbsoluteTop(selectIndex);

        // 4.限制高度
        if (restrict) {
            let hour = restrict.substr(11, 2);
            this._restrictTop(current_year, current_month, current_day, hour);
        } else {
            this._restrictTop(current_year, current_month, current_day);
        }
	},

	componentWillReceiveProps(nextProps) {
        if (nextProps.hour != this.props.hour
            || nextProps.day != this.props.day
            || nextProps.month != this.props.month
            || nextProps.year != this.props.year) {

            let current_year = nextProps.year,
                current_month = nextProps.month,
                current_day = nextProps.day,
                current_hour = nextProps.hour,
                restrict = nextProps.restrict,
                year = this._getFullYear(),
                month = this._getMonth(),
                day = this._getDate(),
                hour = this._getHours(),
                selectIndex;

            if (restrict) {
                month = restrict.substr(5, 2);
                day = restrict.substr(8, 2);
                hour = restrict.substr(11, 2);
            }

            if (nextProps.year != this.props.year
                || nextProps.month != this.props.month
                || nextProps.day != this.props.day) {
                if (current_year == year && current_month == month && current_day == day) {
                    if (current_hour < hour) {
                        current_hour = hour;
                    }
                }

                // 限制高度
                this._restrictTop(current_year, current_month, current_day, current_hour);
            } else {
                if (current_year == year && current_month == month && current_day == day && current_hour < hour) {
                    current_hour = hour;
                }
            }

            // 1.找到当前传过来的月份的index值
            selectIndex = this._findHourIndex(current_hour);

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
        let { top, delta_y, hours, line_height, restrict_top } = this.state,

            hourDOM = ReactDOM.findDOMNode(this.refs.selected),

            index = 0,
            li_num = hours.length,
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

        hourDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        hourDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        if (top > 0) {
            index = top / line_height - 1;
        } else {
            index = -top / line_height + 1;
        }

        this.setState({
            top : top,
            selectIndex : index,
            selectHour : hours[index]
        }, () => {
            this.props.onScroll && this.props.onScroll(hours[index]);
        });
	},

	render() {

		let hours = this.state.hours || [],
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
							hours.map((h, index) => {
								if (index === selectIndex) {
									return (<li key={"hour"+index} className="selected">{h}</li>);
								} else {
									return (<li key={"hour"+index}>{h}</li>);
								}
								
							})
						}
					</ul>
				</div>
			</div>
		);
	}
});