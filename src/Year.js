'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

export default React.createClass({

	_getFullYear() {
		let date = new Date();
		return date.getFullYear();
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
			years : [],
			selectYear : undefined,
			selectIndex : 3,
			line_height : 35,
            restrict_top : undefined
		}
	},

    /**
     * 渲染年份，默认年份前三年、后三年
     * @return {[type]} [description]
     */
    _renderYears() {
        let year = this._getFullYear(),
            years = this.state.years;

        for(let i = 0; i < 7; i++) {
            years.push(String(year - 3 + i));
        }

        this.setState({years : years});
    },

    /**
     * 找到当前年份的索引值
     * @param  {[type]} year [description]
     * @return {[type]}      [description]
     */
    _findYearIndex(year) {
        let { years } = this.state, index = undefined;
        for (let i = 0; i < years.length; i++) {
            if (years[i] == year) {
                index = i;
                break;
            }
        }

        this.setState({selectIndex : index, selectYear : year});

        return index;
    },

    /**
     * 根据当前的年份，初始化当前的transform值
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _initAbsoluteTop(index) {
        let { line_height } = this.state,
            yearDOM = ReactDOM.findDOMNode(this.refs.year), top;
        top = -(index - 1) * line_height;
        yearDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        yearDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        this.setState({top : top});
    },

    /**
     * 限制最大的滑动高度
     * @return {[type]} [description]
     */
    _restrictTop() {
        let { line_height } = this.state,
            year = this._getFullYear(),
            index = this._findYearIndex(year), top;
        top = -(index - 1) * line_height;
        this.setState({restrict_top : top});
    },

    /**
     * 组件完成渲染时调用，调用一次
     * @return {[type]} [description]
     */
	componentDidMount() {
        let current_year = this.props.year, selectIndex;

        // 1. 渲染年份
        this._renderYears();

        // 2.找到当前传过来的年份的index值
        selectIndex = this._findYearIndex(current_year);

        // 3.设置初始top值
        this._initAbsoluteTop(selectIndex);

        // 4.限制高度
        this._restrictTop();
	},

    /**
     * 接收到新的年份时调用
     * @param nextProps
     */
	componentWillReceiveProps(nextProps) {
		if (nextProps.year && nextProps.year != this.props.year) {
            let current_year = nextProps.year, selectIndex;

            // 1.找到当前传过来的年份的index值
            selectIndex = this._findYearIndex(current_year);

            // 2.设置初始top值
            this._initAbsoluteTop(selectIndex);
		}
	},

    /**
     * 滑动开始
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
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

    /**
     * 滑动进行
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
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

			yearDOM = ReactDOM.findDOMNode(this.refs.year),
			
			abs_x = Math.abs(total_x),  // 移动的x轴绝对值，相对于touchStart
			abs_y = Math.abs(total_y),  // 移动的y轴绝对值，相对于touchStart

			newTop;

		if (abs_x === 0) {
			abs_x = 1;
		}

        // 如果竖直方向移动
		if (abs_y > abs_x  && abs_y / abs_x > 1) {

			newTop = d_y + top;

            yearDOM.style.transform = `translate3d(0, ${newTop}px, 0)`;
            yearDOM.style.WebkitTransform = `translate3d(0, ${newTop}px, 0)`;

            this.setState({
                delta_x : total_x,
                delta_y : total_y,
                top : newTop,
                move_x : new_move_x,
                move_y : new_move_y
            });
		}
	},

    /**
     * 滑动结束
     * @return {[type]} [description]
     */
	onTouchEnd() {
		let { top, delta_y, years, line_height, restrict_top } = this.state,

            yearDOM = ReactDOM.findDOMNode(this.refs.year),

            index = 0,
            li_num = years.length,
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

        yearDOM.style.transform = `translate3d(0, ${top}px, 0)`;
        yearDOM.style.WebkitTransform = `translate3d(0, ${top}px, 0)`;

        if (top > 0) {
            index = top / line_height - 1;
        } else {
            index = -top / line_height + 1;
        }

        this.setState({
            top : top,
            selectIndex : index,
            selectYear : years[index]
        }, () => {
            this.props.onScroll && this.props.onScroll(years[index]);
        });
	},

	render() {

		let years = this.state.years || [],
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
						ref="year">
						{
							years.map((y, index) => {
								if (index === selectIndex) {
									return (<li key={"year"+index} className="selected">{y}</li>);
								} else {
									return (<li key={"year"+index}>{y}</li>);
								}
								
							})
						}
					</ul>
				</div>
			</div>
		);
	}
});