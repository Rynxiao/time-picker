'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

export default React.createClass({

	_isLeapYear(year) {
		return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
	},

	_getFullYear() {
		let date = new Date();
		return date.getFullYear();
	},

	_getMonth() {
		let date = new Date();
		return date.getMonth() + 1;
	},
	
	_getDayNum(y, m) {
		let month = +m || this._getMonth(),
			year = +y || this._getFullYear(),
			day = 31;
		switch (month) {
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				day = 31;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				day = 30;
				break;
			case 2:
				if (this._isLeapYear(year)) {
					day = 29;
				} else {
					day = 28;
				}
				break;
			default: 
				break;
		}
		return day;
	},
	
	_getDate() {
		return new Date().getDate();
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
			days : [],
			selectDay : undefined,
			selectIndex : 3,
			line_height : 35,
            restrict_top : undefined
		}
	},

	_renderDays(year, month) {
		let current_year = year,
            current_month = month,
            dayNum = this._getDayNum(current_year, current_month),
            days = this.state.days;

		for(let i = 0; i < dayNum; i++) {
			let d = i + 1;
			if (d < 10) {
				d = '0' + d;
			}
            days.push(d);
		}

		this.setState({days : days});
	},

	_findDayIndex(day) {
		let { days } = this.state, index = undefined;
		for (let i = 0; i < days.length; i++) {
			if (days[i] == day) {
				index = i;
				break;
			}
		}

		this.setState({selectIndex : index, selectDay : day});

		return index;
	},

	_initAbsoluteTop(index) {
		let { line_height, days } = this.state,
			dayDOM = ReactDOM.findDOMNode(this.refs.selected), top;
		top = -(index - 1) * line_height;
        dayDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        dayDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

		this.setState({top : top});
        this.props.onScroll && this.props.onScroll(days[index]);
	},

	_restrictTop(current_year, current_month) {
		let year = this._getFullYear(),
            month = this._getMonth(),
            day = this._getDate(),
			{ line_height } = this.state,
            { restrict } = this.props;

        if (restrict) {
            month = restrict.substr(5, 2);
            day = restrict.substr(8, 2);
        }

		if (current_year == year && current_month == month) {
			let { days } = this.state,
                index, top;

            for (let i = 0; i < days.length; i++) {
                if (days[i] == day) {
                    index = i;
                    break;
                }
            }

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
            restrict = this.props.restrict,
            selectIndex;

        // 1. 渲染天数
        this._renderDays(current_year, current_month);

        // 2.找到当前传过来的天数的index值
        selectIndex = this._findDayIndex(current_day);

        // 3.设置初始top值
        this._initAbsoluteTop(selectIndex);

        // 4.限制高度
        if (restrict) {
            let day = restrict.substr(8, 2);
            this._restrictTop(current_year, current_month, day);
        } else {
            this._restrictTop(current_year, current_month);
        }
	},

	componentWillReceiveProps(nextProps) {
		if ((nextProps.day && nextProps.day != this.props.day)
            || (nextProps.year && nextProps.year != this.props.year)
            || (nextProps.month && nextProps.month != this.props.month)) {
			let current_year = nextProps.year,
                current_month = nextProps.month,
				current_day = nextProps.day,
                restrict = nextProps.restrict,
                year = this._getFullYear(),
                month = this._getMonth(),
                day = this._getDate(),
                selectIndex;

            if (restrict) {
                month = restrict.substr(5, 2);
                day = restrict.substr(8, 2);
            }

            if (nextProps.year != this.props.year || nextProps.month != this.props.month) {
                if (current_year == year && current_month == month) {
                    current_year = year;
                    if (current_month < month) {
                        current_month = month;
                    }

                    if (current_day < day) {
                        current_day = day;
                    }
                }

                // 限制高度
                this._restrictTop(current_year, current_month, current_day);
            } else {
                if (current_year == year && current_month == month && current_day < day) {
                    current_day = day;
                }
            }


            // 每次选择月份之后，天数重置为01
            if (current_month != this.props.month && current_year == this.props.year && current_year != year) {
                current_day = 1;
            }

            this.setState({days : []}, () => {
                // 1. 渲染天数
                this._renderDays(current_year, current_month);

                // 2.找到当前传过来的天数的index值
                selectIndex = this._findDayIndex(current_day);

                // 3.设置初始top值
                this._initAbsoluteTop(selectIndex);
            });
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

            dayDOM = ReactDOM.findDOMNode(this.refs.selected),

            abs_x = Math.abs(total_x),  // 移动的x轴绝对值，相对于touchStart
            abs_y = Math.abs(total_y),  // 移动的y轴绝对值，相对于touchStart

            newTop;

        if (abs_x === 0) {
            abs_x = 1;
        }

        // 如果竖直方向移动
        if (abs_y > abs_x  && abs_y / abs_x > 1) {

            newTop = d_y + top;
            dayDOM.style.transform = `translate3d(0, ${newTop}px, 0)`;
            dayDOM.style.WebkitTransform = `translate3d(0, ${newTop}px, 0)`;

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
        let { top, delta_y, days, line_height, restrict_top } = this.state,

            dayDOM = ReactDOM.findDOMNode(this.refs.selected),

            index = 0,
            li_num = days.length,
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

        dayDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        dayDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        if (top > 0) {
            index = top / line_height - 1;
        } else {
            index = -top / line_height + 1;
        }

        this.setState({
            top : top,
            selectIndex : index,
            selectDay : days[index]
        }, () => {
            this.props.onScroll && this.props.onScroll(days[index]);
        });
	},

	render() {

		let days = this.state.days || [],
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
							days.map((d, index) => {
								if (index === selectIndex) {
									return (<li key={"day"+index} className="selected">{d}</li>);
								} else {
									return (<li key={"day"+index}>{d}</li>);
								}
								
							})
						}
					</ul>
				</div>
			</div>
		);
	}
});