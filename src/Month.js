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

	getInitialState() {
		return {
			start_x : 0,
			start_y : 0,
			move_x : 0,
			move_y : 0,
			delta_x : 0,
			delta_y : 0,
			top : -70,
			months : [],
			selectMonth : undefined,
			selectIndex : 3,
			line_height : 35,
			restrict_top : 35,
            moving : false
		}
	},

    _renderMonths() {
        let months = this.state.months;

        for(let i = 0; i < 12; i++) {
            let m = i + 1;
            if (m < 10) {
                m = '0' + m;
            }
            months.push(m);
        }

        this.setState({months : months});
    },

    _findMonthIndex(month) {
        let { months } = this.state, index = undefined;
        for (let i = 0; i < months.length; i++) {
            if (months[i] == month) {
                index = i;
                break;
            }
        }

        this.setState({selectIndex : index, selectMonth : month});

        return index;
    },

    _initAbsoluteTop(index) {
        let { line_height, months } = this.state,
            monthDOM = ReactDOM.findDOMNode(this.refs.selected), top;
        top = -(index - 1) * line_height;
        monthDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        monthDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        this.setState({top : top});
        this.props.onScroll && this.props.onScroll(months[index]);
    },

    _restrictTop(current_year) {
        let year = this._getFullYear(),
            month = this._getMonth(),
            { line_height } = this.state,
            { restrict } = this.props;

        if (restrict) {
            month = restrict.substr(5, 2);
        }

        if (current_year == year) {
            let index = this._findMonthIndex(month), top;

            top = -(index - 1) * line_height;
            this.setState({restrict_top : top});
        } else {
            this.setState({restrict_top : line_height});
        }
    },

    componentDidMount() {

        let current_year = this.props.year,
            current_month = this.props.month,
            restrict = this.props.restrict,
            selectIndex;

        // 1. 渲染月份
        this._renderMonths();

        // 2.找到当前传过来的月份的index值
        selectIndex = this._findMonthIndex(current_month);

        // 3.设置初始top值
        this._initAbsoluteTop(selectIndex);

        // 4.限制高度
        if (restrict) {
            let month = restrict.substr(5, 2);
            this._restrictTop(current_year, month);
        } else {
            this._restrictTop(current_year);
        }
	},

	componentWillReceiveProps(nextProps) {
		if (nextProps.month != this.props.month || nextProps.year != this.props.year) {

            let current_year = nextProps.year,
                current_month = nextProps.month,
                restrict = nextProps.restrict,
                year = this._getFullYear(),
                month = this._getMonth(),
                selectIndex;

            if (restrict) {
                month = restrict.substr(5, 2);
            }

            if (nextProps.year != this.props.year) {
                if (current_year == year) {
                    if (current_month < month) {
                        current_month = month;
                    }
                }

                // 3.限制高度
                this._restrictTop(current_year, current_month);
            } else {
                if (current_year == year && current_month < month) {
                    current_month = month;
                }
            }

            // 1.找到当前传过来的月份的index值
            selectIndex = this._findMonthIndex(current_month);

            // 2.设置初始top值
            this._initAbsoluteTop(selectIndex);
		}
	},

	onTouchStart(e) {
		let touch = e.touches[0];
        e.preventDefault();
		this.setState({
			start_x : touch.pageX, 
			start_y : touch.pageY, 
			move_x : touch.pageX,
			move_y : touch.pageY
		});
	},

	onTouchMove(e) {

        console.log("%c MOVE", "color:red;");
        e.preventDefault();

        let touch = e.touches[0],
            { move_x, move_y, top, start_x, start_y } = this.state,

            new_move_x = touch.pageX,
            new_move_y = touch.pageY,

            d_x = (new_move_x - move_x) || 0,  // 移动的x轴delta值，相对于上一次滑动
            d_y = (new_move_y - move_y) || 0,  // 移动的x轴delta值，相对于上一次滑动

            total_x = new_move_x - start_x,
            total_y = new_move_y - start_y,

            monthDOM = ReactDOM.findDOMNode(this.refs.selected),

            abs_x = Math.abs(total_x),  // 移动的x轴绝对值，相对于touchStart
            abs_y = Math.abs(total_y),  // 移动的y轴绝对值，相对于touchStart

            newTop;

        if (abs_x === 0) {
            abs_x = 1;
        }

        //console.log("y > x", abs_y / abs_x > 1);

        // 如果竖直方向移动
        if (abs_y > abs_x) {

            newTop = d_y + top;
            //console.log("%c d_y", "color:red", d_y < 0 ? '向上' : '向下');
            //console.log("%c newTop", "color:red", parseInt(newTop));

            monthDOM.style.transform = `translate3d(0, ${parseInt(newTop)}px, 0)`;
            monthDOM.style.WebkitTransform = `translate3d(0, ${parseInt(newTop)}px, 0)`;

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

        console.log("%c END", "color:red;");

        let { top, delta_y, months, line_height, restrict_top } = this.state,

            monthDOM = ReactDOM.findDOMNode(this.refs.selected),

            index = 0,
            li_num = months.length,
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

        monthDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        monthDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        if (top > 0) {
            index = top / line_height - 1;
        } else {
            index = -top / line_height + 1;
        }

        console.log("end index", index);
        console.log("end month", months[index]);

        this.setState({
            top : top,
            selectIndex : index,
            selectMonth : months[index]
        }, () => {
            this.props.onScroll && this.props.onScroll(months[index]);
        });
	},

	render() {

		let months = this.state.months || [],
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
							months.map((m, index) => {
								if (index === selectIndex) {
									return (<li key={"month"+index} className="selected">{m}</li>);
								} else {
									return (<li key={"month"+index}>{m}</li>);
								}

							})
						}
					</ul>
				</div>
			</div>
		);
	}
});