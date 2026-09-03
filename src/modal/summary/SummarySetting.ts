import {App, ButtonComponent, Modal, Notice, Setting} from "obsidian";
import RememberEveryPay from "../../RememberEveryPay";
import RecordDataIo from "../../filerw/recorddataio";

export default class SummarySetting extends Modal{
	plugin:RememberEveryPay
	get:Record<string, boolean>={}
	path:string
	chart_type='radar'
	all_zu:Record<string, Setting>={}
	zu_data:Record<string,Record<string,number> >={}
	last_all_data:Map<string,number>=new Map<string, number>()
	now_choose_zu:HTMLDivElement|null=null;
	init_zu_child:Record<string, Record<string, ButtonComponent> >={}
	constructor(app:App, plugin:RememberEveryPay, path:string) {
		super(app);
		this.plugin=plugin
		this.path=path

		new Setting(this.contentEl)
			.setName("输出设置")
			.setHeading()

		new Setting(this.contentEl)
			.setName("设置输出图像类型")
			.addDropdown(drop=>{
				drop.addOption('bar','条形统计图')
					.addOption('line','折线统计图')
					.addOption('pie','扇形统计图')
					.addOption('doughnut','圆环统计图')
					.addOption('radar','雷达图')
					.addOption('polarArea','极坐标面积图')
					.setValue('radar')
					.onChange(t=>{
						this.chart_type=t
					})
			})
		if (this.plugin.settings.open_zu_output==="normal"){
		this.renderNormalAllList()
		}else if (this.plugin.settings.open_zu_output==="zu") {
			this.renderZuAllList()
		}else if (this.plugin.settings.open_zu_output==="mix"){
			this.renderNormalAllList_v2();
		}
	}

	async renderNormalAllList(){
		const io=new RecordDataIo(this.app,this.plugin)
		let data=await io.summaryBackData(this.plugin,this.path)
		for (const e of data.keys())
		{

			this.get[e]=true
			new Setting(this.contentEl)
				.setName(e)
				.setDesc(io.putUpNum(Number(data.get(e))))
				.addToggle(t=>{
					t.setValue(true)
						.onChange(value => {
							this.get[e]=value
						})
				})
		}
		this.addNormalCheck()
	}
	async renderZuAllList(){
		const io=new RecordDataIo(this.app,this.plugin)
		let data=await io.summaryBackData(this.plugin,this.path)
		let new_back:Map<string,number>=new Map()
		for (const [k,v] of Object.entries(this.plugin.settings.record_zu)){
			let one_zu_sum=0
			let zu_dec=''
			v.forEach(e=>{
				one_zu_sum+=Number(data.get(e))
				zu_dec+=e+io.putUpNum(Number(data.get(e)))+'\n'
			})
			this.get[k]=true
			new Setting(this.contentEl)
				.setName(k)
				.setDesc("总计:"+one_zu_sum+'\n'+zu_dec)
				.addToggle(t=>{
					t.setValue(true)
						.onChange(value=>{
							this.get[k]=value
						})
				})
			new_back.set(k,one_zu_sum)
		}
		new Setting(this.contentEl)
			.addButton(b=>{
				b.setIcon('check')
					.onClick(async ()=>{
						const io=new RecordDataIo(this.app,this.plugin)
						for (const [k,v] of Object.entries(this.get)){
							if (new_back.has(k)&&!v){
								new_back.delete(k)
							}
						}
						await io.summaryMonthData(this.plugin,this.path,this.plugin.settings.data_zero_output)
						await io.addCharts(new_back, this.path, this.chart_type)
						this.close()
					})
			})
	}
	async renderNormalAllList_v2() {
		//渲染临时组
		let zu = ''

		new Setting(this.contentEl)
			.setName("添加新的组")
			.addText(t => {
				t.setPlaceholder("名字")
					.onChange(v => {
						zu = v

					})
			})
			.addButton(btn => {
				btn.setIcon("plus")
					.onClick(() => {
						if (zu === '') {
							return;
						}
						this.zu_data[zu] = {}
						this.now_choose_zu = this.addNewZu(this.contentEl, zu, normal_list, () => {
							delete this.zu_data[zu]
							this.now_choose_zu = null;
							for (const cut_ of need_cut_) {
								if ((cut_.buttonEl as Element).classList.contains("need_remove_")) {
									cut_.setIcon("plus");
									(cut_.buttonEl as Element).classList.remove("need_remove_")
								}
							}

						})
						this.contentEl.appendChild(check.settingEl)

					})
			})

		const normal_list = this.contentEl.createDiv()
		let need_cut_: ButtonComponent[] = []
		const io = new RecordDataIo(this.app, this.plugin)
		let data = await io.summaryBackData(this.plugin, this.path)
		let need_render = data.keys();

		//渲染单个
		for (const e of need_render) {

			this.get[e] = true
			//let is_in_zu=false
			const one_num = io.putUpNum(Number(data.get(e)))
			this.last_all_data.set(e, Number(one_num))

			let _btn:ButtonComponent;
			const one = new Setting(normal_list)
				.setName(e)
				.setDesc(one_num)
				.addButton(btn => {
					btn.setIcon('plus')
					_btn=btn;
					btn.buttonEl.classList.add('group_add')
					btn.buttonEl.classList.add('group_o')
					btn.onClick(() => {
						if (this.now_choose_zu != null) {
							if ((one.settingEl.parentElement as HTMLElement) === normal_list) {
								//移入
								(<Record<string, number>>this.zu_data[this.now_choose_zu.id])[e] = Number(one_num)
								this.now_choose_zu.appendChild(one.settingEl)
								this.contentEl.appendChild(check.settingEl)
								btn.setIcon("minus")
								need_cut_.push(btn)
								this.last_all_data.delete(e)
							} else {
								//移出
								delete (<Record<string, number>>this.zu_data[this.now_choose_zu.id])[e]
								normal_list.appendChild(one.settingEl)
								this.contentEl.appendChild(check.settingEl)
								btn.setIcon("plus")
								need_cut_.remove(btn)
								this.last_all_data.set(e, Number(one_num))
							}
							this.reload_zu_result()
							// if (!is_in_zu) {
							// 	//移入
							// 	now_choose_zu.appendChild(one.settingEl)
							// 		this.contentEl.appendChild(check.settingEl)
							// 	btn.setIcon("minus")
							// 	is_in_zu = true
							// }else {
							// 	//移出
							// 	is_in_zu=false
							// 		normal_list.appendChild(one.settingEl)
							// 	this.contentEl.appendChild(check.settingEl)
							// 	btn.setIcon("plus")
							// }
						}

					})

				})
			for (const [fu,uk] of Object.entries(this.plugin.settings.record_zu)){
				if (this.init_zu_child[fu]===undefined) {
					/**
					 * 终于找到问题了😭
					 * 就是这个record没有初始化导致后面的循环的执行不了
					 * 还有这个初始化要执行一次的问题，不然后面的东西都没了
					 */

					this.init_zu_child[fu] = {};
				}
				uk.forEach(you=>{

					if(e===you) {

						(<Record<string, ButtonComponent>>this.init_zu_child[fu])[e] = _btn
					}
				})
			}
				one.addToggle(t => {
					t.setValue(true)
						.onChange(value => {
							this.get[e] = value
							if ((one.settingEl.parentElement as HTMLElement) != normal_list) {
								if (value) {
									(<Record<string, number>>this.zu_data[(one.settingEl.parentElement as Element).id])[e] = Number(one_num)
								} else {
									delete (<Record<string, number>>this.zu_data[(one.settingEl.parentElement as Element).id])[e]
								}
								this.reload_zu_result()
							} else {
								if (value) {
									this.last_all_data.set(e, Number(one_num))
								} else {
									this.last_all_data.delete(e)
								}
							}
						})
				})
			one.settingEl.id=e


		}
		//渲染组
		for (const [a, d] of Object.entries(this.plugin.settings.record_zu)) {
			//加入组
			this.zu_data[a] = {}
			this.now_choose_zu = this.addNewZu(this.contentEl, a, normal_list, () => {
				delete this.zu_data[a]
				this.now_choose_zu = null;
				for (const cut_ of need_cut_) {
					if ((cut_.buttonEl as Element).classList.contains("need_remove_")) {
						cut_.setIcon("plus");
						(cut_.buttonEl as Element).classList.remove("need_remove_")
					}
				}

			});
		}
			//渲染子元素
			for (const [fu,uk] of Object.entries(this.init_zu_child)){
				this.now_choose_zu=this.contentEl.querySelector("#"+fu);
				for (const [you,btn] of Object.entries(uk))
				{

					const one_num= io.putUpNum(Number(data.get(you)));
					(<Record<string, number>>this.zu_data[fu])[you] = Number(one_num)
					const one=this.contentEl.querySelector("#"+you)as Element
					this.now_choose_zu?.appendChild(one)
					btn.setIcon("minus")
					need_cut_.push(btn)
					this.last_all_data.delete(you)
				}
			}


		this.reload_zu_result()
		const check=this.addMixCheck();

	}
	addNormalCheck():Setting{
		return  new Setting(this.contentEl)
			.addButton(b=>{
				b.setIcon('check')
					.onClick(async ()=>{
						const io=new RecordDataIo(this.app,this.plugin)
						let data=await io.summaryMonthData(this.plugin,this.path,this.plugin.settings.data_zero_output)

						for (const [k,v]of Object.entries(this.get)){
							if (data.has(k)&&!v){
								data.delete(k)
							}
						}
						await io.addCharts(data,this.path,this.chart_type);
						this.close()
					})
			})

	}
	addMixCheck():Setting{
		return  new Setting(this.contentEl)
			.addButton(b=>{
				b.setIcon('check')
					.onClick(async ()=>{
						const io=new RecordDataIo(this.app,this.plugin)
						//统计数据
						await io.summaryMonthData(this.plugin,this.path,this.plugin.settings.data_zero_output)
						await io.addCharts(this.last_all_data,this.path,this.chart_type);
						this.close()
					})
			})
	}

/**
 * 创建一个新的组元素，并添加到界面中
 * @param con - 父容器元素
 * @param e - 组名称
 * @param list - 列表容器
 * @param dele - 删除回调函数
 * @returns 创建的div元素
 */
	addNewZu(con:HTMLElement,e:string,list:HTMLDivElement,dele:()=>void){

	// 初始化状态变量
		let is_open:boolean=false  // 控制组是否展开
		let is_set:boolean=false  // 控制组设置状态
	// 创建设置面板
		const set=new Setting(con)
			.setName(e)  // 设置组名称
			.setHeading()  // 设置为标题样式
			.addButton(b=>{  // 添加设置按钮
				b.setIcon('bolt')  // 设置图标
					.onClick(()=>{  // 添加点击事件
						is_set=!is_set  // 切换设置状态
						if (is_set){
							b.setIcon('cog')  // 更改图标
							group_setting(con);  // 应用组设置
							this.now_choose_zu=dic
						}else {
							b.setIcon('bolt')  // 恢复原始图标
							group_no_set(con);  // 移除组设置
						}

					})
			})
			.addButton(b=>{  // 添加删除按钮
				b.setIcon('trash-2')  // 设置图标
					.onClick(()=>{  // 添加点击事件



					// 将所有子元素添加到列表中
						Array.from(dic.children).forEach(ty=>{

							ty.find("button")?.classList.add("need_remove_")
							list.appendChild(ty)
						})

						dele()
						group_no_set(con)  // 移除组设置
						con.removeChild(set.settingEl)
						con.removeChild(dic)  // 从父容器中移除dic
						this.last_all_data.delete(e)
					})
			})
			.addExtraButton(p=>{  // 添加额外按钮（折叠/展开）
				p.setIcon('chevron-down')  // 设置初始图标
				p.onClick(()=> {  // 添加点击事件
					is_open = !is_open;  // 切换展开状态
					if (is_open) {
						dic.setCssStyles({display:'none'})// 隐藏内容
						p.setIcon('chevron-right')  // 更改图标
					} else {
						dic.setCssStyles({display:'block'})// 显示内容
						p.setIcon('chevron-down')  // 恢复图标
					}
				})
			})

	// 创建内容容器
		const dic=con.createDiv()
		dic.id=e
	this.all_zu[e]=set





	/**
	 * 应用组设置样式
	 * @param con - 父容器元素
	 */
		function group_setting(con:HTMLElement) {
			let all = con.querySelectorAll('button.group_add');  // 获取所有添加按钮
			all.forEach(e=>{
				e.classList.remove('group_add')  // 移除添加类
			})

		}
	/**
	 * 移除组设置样式
	 * @param con - 父容器元素
	 */
		function group_no_set(con:HTMLElement) {
			let all = con.querySelectorAll('button.group_o');  // 获取所有原始按钮
			all.forEach(e=>{
				e.classList.add('group_add')
			})
		}

		return dic
	}
	reload_zu_result() {
		for (const [op, li] of Object.entries(this.all_zu)) {
		for (const [k, v] of Object.entries(this.zu_data)) {
			if (k === op) {
				const out = this.calc_zu_result(v)

				li.setDesc(out)
				this.last_all_data.set(op, Number(out))
			}
		}
	}

	}
	calc_zu_result(child:Record<string, number>):string {
		let all = 0
		for (const [k, v] of Object.entries(child)) {
			if (this.get[k]) {
				all += v
			}
		}
		return putUpNum(all)


		function putUpNum(num: number): string {
			// 检查是否为整数（处理浮点数精度问题）
			const isInteger = Math.abs(num - Math.round(num)) < 0.000001;

			if (isInteger) {
				return Math.round(num).toString();
			} else {
				// 使用 toFixed(2) 保留两位小数
				return num.toFixed(2);
			}
		}
	}

}
