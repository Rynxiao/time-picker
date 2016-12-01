'use strict';

import React from 'react';

/**
 * 时间选择组件
 * @prop {boolean} show  时间选择组件是否显示(默认为false)
 * @prop {boolean} hourshow  小时选择条是否显示(默认为true)
 * @prop {boolean} minuteshow  分钟选择条是否显示(默认为true)
 * @prop {string} title  时间组件的标题(默认为设置时间)
 * @prop {string} statusname  状态名 用于显示多少时间后开启/关闭等(默认为关闭)
 * @prop {number} hourstep  小时的间隔(默认为1)
 * @prop {number} minutestep 分钟的间隔(默认为1)
 * @prop {function} cancelClock 点击取消触发回调函数(无默认,传入空值或者非法值时console提示)
 * @prop {function} submitClock 点击确认触发回调函数(无默认,传入空值或者非法值时console提示)
 * @prop {number} defaulthour 默认选中的小时(默认值为0) !!不要设置为取值范围(minhour-maxhour)外的值
 * @prop {number} defaultminute 默认选中的分钟(默认值为0) !!不要设置为取值范围(0-59)外的值
 * @prop {number} maxhour 可选的最大小时(默认值为23)
 * @prop {number} minhour 可选的最小小时(默认值为0)
 * @prop {array} hourarr 可选的小时数组(默认无,通过最大最小小时及小时间隔计算得到,
 * 如果传值则取传值,注意对数组里面的值暂无验证,请传入正确值格式的数组)
 * @prop {array} minutearr 可选的分钟数组(默认无,通过最大最小分钟及分钟间隔计算得到,
 * 如果传值则取传值,注意对数组里面的值暂无验证,请传入正确值格式的数组)
 * @author   xinglin
 */

export const TimeSelect = React.createClass({
	getInitialState: function(){
        return {
        	hourtime:0,
        	minutetime:0,
        	hourindex:0,
        	hourarr:[],
        	minuteindex:0,
        	minutearr:[],
        	showOpacity:0,
        	timeDisplay:false,
        };
	},
	componentDidMount: function() {
		//初始化时间可选值数组
		this.timearrInit(this.props);
		if(this.props.show==true){
			this.setState({
				showOpacity:1,
				timeDisplay:true
			});
		}
	},
	timearrInit:function(next){
		//设置时间可选值数组
		let maxhour = parseInt(next.maxhour) || parseInt(this.props.maxhour) || 23;
		let minhour = parseInt(next.minhour) || parseInt(this.props.minhour) || 0;
		let hourstep = parseInt(next.hourstep) || parseInt(this.props.hourstep) || 1;
		let maxlength = parseInt((maxhour-minhour)/hourstep);
		let hourarr = [];
		if(this.props.hourarray && this.props.hourarray instanceof Array){
			hourarr = this.props.hourarray;
			this.setState({
				hourarr:hourarr,
				hourtime:minhour
			});
		}else{
			for(let i = 0;i<=maxlength;i++){
				let value = minhour+i*hourstep;
				value = value<10?'0'+value:value;
				hourarr.push(value);
			}
			maxhour = maxhour<10?'0'+maxhour:maxhour;
			if(hourarr.indexOf(maxhour) == -1) hourarr.push(maxhour);
			this.setState({
				hourarr:hourarr,
				hourtime:minhour
			});
		}
		//设置默认小时
		if(next.defaulthour){
			let index = hourarr.indexOf(next.defaulthour);
			if(index!=-1){
				this.setState({
					hourtime: next.defaulthour,
					hourindex:index
				});
			}
		}
		let maxminute = 59;
		let minminute = 0;
		let minutestep = parseInt(next.minutestep) || parseInt(this.props.minutestep) || 1;
		let maxlength2 = parseInt((maxminute-minminute)/minutestep);
		let minutearr = [];
		if(this.props.minutearr && this.props.minutearr instanceof Array){
			minutearr = this.props.minutearr;
			this.setState({
				minutearr:minutearr,
				minutetime:minminute
			});
		}else{
			for(let j = 0;j<=maxlength2;j++){
				let value = minminute+j*minutestep;
				value = value<10?'0'+value:value;
				minutearr.push(value);
			}
			if(minutearr.indexOf(maxminute) == -1) minutearr.push(maxminute);
			this.setState({
				minutearr:minutearr,
				minutetime:minminute
			});
		}
		//设置默认分钟
		if(next.defaultminute){
			let mindex = minutearr.indexOf(next.defaultminute);
			if(mindex!=-1){
				this.setState({
					minutetime: next.defaultminute,
					minuteindex:mindex
				});
			}
		}
	},
	componentWillReceiveProps: function(next) {
		//更新时间可选值数组
		if(next.hourstep!=this.props.hourstep || next.minhour!=this.props.minhour
			|| next.maxhour!=this.props.maxhour || next.arrayInit===true){
			this.timearrInit(next);
		}
		var showOpacity = this.state.showOpacity;
		if(next.show != this.props.show){
			if(next.show == true){
				this.setState({timeDisplay:true});
				clearInterval(this.timr);
				this.timr = setInterval(function(){
					showOpacity += 0.1;
					if(showOpacity>=1){
						clearInterval(this.timr);
						this.setState({showOpacity:showOpacity});
					}
				}.bind(this),10)
			}else if(next.show == false){
				clearInterval(this.timr);
				this.timr = setInterval(function(){
					showOpacity -= 0.1;
					// console.log('1',showOpacity,parseInt(showOpacity));
					if(showOpacity<=0){
						clearInterval(this.timr);
						this.setState({timeDisplay:false});
						this.setState({showOpacity:showOpacity});
					}
				}.bind(this),30)
			}
		}
	},
	startrange:function(e){
		//开始滑动时间刻度 记录初始坐标值
		e.stopPropagation();
		e.preventDefault();
		let yvalue = parseInt(e.touches[0].clientY);
		this.setState({
			oldy: yvalue
		});
	},
	moverange:function(e){
		//滑动时间刻度 判断滑动类型并改变刻度条的top值 产生滑动视觉效果
		e.stopPropagation();
		e.preventDefault();
		let yvalue = parseInt(e.touches[0].clientY);
		let oldy = parseInt(this.state.oldy);
		let value = (yvalue-oldy)/1.72;
		if(value>20) value=20;
		if(value<-20) value=-20;
		let type = e.target.getAttribute('data-type');
		if(type=='hour'){
			this.setState({
				newy: yvalue,
				hourtop:value
			});
		}
		if(type=='minute'){
			this.setState({
				newy: yvalue,
				minutetop:value
			});
		}
	},
	endrange:function(e){
		//滑动结束 计算滑动范围 忽略太小的滑动(20内) 然后调整选中值并重置时间刻度条
		e.stopPropagation();
		e.preventDefault();
		let newy = parseInt(this.state.newy);//滑动结束时的y值
		let oldy = parseInt(this.state.oldy);//滑动开始时的y值
		let hour = parseInt(this.state.hourtime);//上一次选中的小时值
		let hourarr = this.state.hourarr;//小时可选值数组
		let hourindex = parseInt(this.state.hourindex);//上次选中的小时值对应数组中索引
		let minutearr = this.state.minutearr;//分钟可选值数组
		let minuteindex = parseInt(this.state.minuteindex);//上次选中的分钟值对应数组索引
		let minute = parseInt(this.state.minutetime);//上次选中的分钟值
		let hourstep = parseInt(this.props.hourstep) || 1;//小时的间隔
		let minutestep = parseInt(this.props.minutestep) || 1;//分钟的间隔
		let maxhour = parseInt(this.props.maxhour) || 23;//设置的最大小时值
		let minhour = parseInt(this.props.minhour) || 0;//设置的最小小时值
		let type = e.target.getAttribute('data-type');//滑动更改的类型
		//小时减小
		if(newy-oldy>20 && type=='hour'){
			let rangestep = parseInt((newy-oldy)/50)>0 ? parseInt((newy-oldy)/50) : 1;
			hourindex = hourindex-rangestep;
			hourindex = hourindex<0?0:hourindex;
			hour = hourarr[hourindex];
			this.setState({
				hourtime:hour,
				hourindex:hourindex,
				hourtop:0
			});
		};
		//小时增加
		if(newy-oldy<-20 && type=='hour'){
			let rangestep = parseInt((oldy-newy)/50)>0 ? parseInt((oldy-newy)/50) : 1;
			hourindex = hourindex+rangestep;
			hourindex = (hourindex>=hourarr.length)?(hourarr.length-1):hourindex;
			hour = hourarr[hourindex];
			this.setState({
				hourtime:hour,
				hourindex:hourindex,
				hourtop:0
			});
		};
		//分钟减小
		if(newy-oldy>20 && type=='minute'){
			let rangestep = parseInt((newy-oldy)/50)>0 ? parseInt((newy-oldy)/50) : 1;
			minuteindex = minuteindex-rangestep;
			minuteindex = minuteindex<0?0:minuteindex;
			minute = minutearr[minuteindex];
			this.setState({
				minutetime:minute,
				minuteindex:minuteindex,
				minutetop:0
			});
		};
		//分钟增加
		if(newy-oldy<-20 && type=='minute'){
			let rangestep = parseInt((oldy-newy)/50)>0 ? parseInt((oldy-newy)/50) : 1;
			minuteindex = minuteindex+rangestep;
			minuteindex = (minuteindex>=minutearr.length)?(minutearr.length-1):minuteindex;
			minute = minutearr[minuteindex];
			this.setState({
				minutetime:minute,
				minuteindex:minuteindex,
				minutetop:0
			});
		};
		//重置为未拖动状态
		this.setState({
			hourtop:0,
			minutetop:0
		});
	},
	endDefault:function(e){
		//阻止IOS上冒泡触发iscroll事件
		e.stopPropagation();
		e.preventDefault();
	},
	cancelclock:function(e){
		//取消选择
		if(typeof this.props.cancelClock === 'function'){
			this.props.cancelClock();
		}else{
			console.log('error:the cancel callback is not a function');
		}
	},
	submitclock:function(e){
		//确认提交时间
		if(typeof this.props.submitClock === 'function'){
			this.props.submitClock(this.state.hourtime,this.state.minutetime);
		}else{
			console.log('error:the submit callback is not a function');
		}
	},
	render: function() {
		let show = this.props.show || false;
		let maxhour = parseInt(this.props.maxhour) || 23;
		let minhour = parseInt(this.props.minhour) || 0;
		let hourshow = typeof this.props.hourshow !== 'undefined' && Boolean(this.props.hourshow)===false ? false : true;
		let minuteshow = typeof this.props.minuteshow !== 'undefined' && Boolean(this.props.minuteshow)===false ? false : true;
		if(!hourshow && !minuteshow) hourshow = true;
		let hourstep = parseInt(this.props.hourstep) || 1;
		let minutestep = parseInt(this.props.minutestep) || 1;
		let selecttitle = this.props.title || '设置时间';
		let statusname = this.props.statusname || '关闭';
		let hour = this.state.hourtime || '0';
		hour=parseInt(hour)>maxhour?maxhour:parseInt(hour);
		hour=hour<minhour?minhour:hour;
		let minute = this.state.minutetime || '0';
		minute=parseInt(minute)>59?59:parseInt(minute);
		minute=minute<0?0:minute;
		let hourtop = this.state.hourtop || 0;
		let minutetop = this.state.minutetop || 0;
		let hourarr = this.state.hourarr;
		let hourindex = parseInt(this.state.hourindex);
		let minutearr = this.state.minutearr;
		let minuteindex = parseInt(this.state.minuteindex);
	    return (
	    	<section style={{visibility:this.state.timeDisplay?"initial":"hidden",opacity:this.state.showOpacity}} ref='timeSelect' className='timeSelect'>
		    	<section onTouchEnd={this.cancelclock}></section>
		        <section className="timeselect" onTouchMove={this.endDefault}>
		        	<section className='selecttitle'>
		        		<span className='title'>{selecttitle}</span>
		        	</section>
		        	<section className='time'>
		        		<section data-type='hour' style={{width:minuteshow?'50%':'100%',display:hourshow?'inline-block':'none'}}
		        			onTouchStart={this.startrange} onTouchMove={this.moverange}
		        			onTouchEnd={this.endrange}  className='hour'>
		        		</section>
		        		<section  data-type='minute' style={{display:minuteshow?'inline-block':'none',width:hourshow?'50%':'100%',left:hourshow?'50%':'0%'}}
		        			onTouchStart={this.startrange} onTouchMove={this.moverange}
		        			onTouchEnd={this.endrange} className='minute'>
		        		</section>
		        		<section className='timetext'>
		        			<span className='hour' style={{left:minuteshow?33+'%':53+'%',display:hourshow?'inline-block':'none'}}>时</span>
		        			<span className='minute' style={{display:minuteshow?'inline-block':'none',left:hourshow?66+'%':53+'%'}}>分</span>
		        			<span className='status'>{statusname}</span>
		        		</section>
		        		<section className='hourvalue flex-column' style={{top:hourtop+'%',left:minuteshow?25+'%':45+'%',display:hourshow?'':'none'}}>
		        			<span className={(hourindex-3)<0?'line4':'line1'}>{(hourindex-3)<0?'':hourarr[hourindex-3]}</span>
		        			<span className={(hourindex-2)<0?'line4':'line1'}>{(hourindex-2)<0?'':hourarr[hourindex-2]}</span>
		        			<span className={(hourindex-1)<0?'line4':'line2'}>{(hourindex-1)<0?'':hourarr[hourindex-1]}</span>
		        			<span className='line3'>{hourarr[hourindex]}</span>
		        			<span className={(hourindex+1)>=hourarr.length?'line4':'line2'}>{(hourindex+1)>=hourarr.length?'':hourarr[hourindex+1]}</span>
		        			<span className={(hourindex+2)>=hourarr.length?'line4':'line1'}>{(hourindex+2)>=hourarr.length?'':hourarr[hourindex+2]}</span>
		        			<span className={(hourindex+3)>=hourarr.length?'line4':'line1'}>{(hourindex+3)>=hourarr.length?'':hourarr[hourindex+3]}</span>
		        		</section>
		        		<section  className='minutevalue flex-column' style={{top:minutetop+'%',display:minuteshow?'':'none',left:hourshow?58+'%':45+'%'}}>
			        		<span className={(minuteindex-3)<0?'line4':'line1'}>{(minuteindex-3)<0?'':minutearr[minuteindex-3]}</span>
		        			<span className={(minuteindex-2)<0?'line4':'line1'}>{(minuteindex-2)<0?'':minutearr[minuteindex-2]}</span>
		        			<span className={(minuteindex-1)<0?'line4':'line2'}>{(minuteindex-1)<0?'':minutearr[minuteindex-1]}</span>
		        			<span className='line3'>{minutearr[minuteindex]}</span>
		        			<span className={(minuteindex+1)>=minutearr.length?'line4':'line2'}>{(minuteindex+1)>=minutearr.length?'':minutearr[minuteindex+1]}</span>
		        			<span className={(minuteindex+2)>=minutearr.length?'line4':'line1'}>{(minuteindex+2)>=minutearr.length?'':minutearr[minuteindex+2]}</span>
		        			<span className={(minuteindex+3)>=minutearr.length?'line4':'line1'}>{(minuteindex+3)>=minutearr.length?'':minutearr[minuteindex+3]}</span>
		        		</section>
		        	</section>
		        	<section className='selectbtn flex'>
		        		<span className='flex-cell' onTouchEnd={this.cancelclock}>取消</span>
		        		<span className='flex-cell' onTouchEnd={this.submitclock}>确定</span>
		        	</section>
		        </section>
	        </section>
	    );
	}
});