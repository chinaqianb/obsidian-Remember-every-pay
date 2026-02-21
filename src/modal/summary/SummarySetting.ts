import {App, Modal, Setting} from "obsidian";
import MyPlugin from "../../main";
import RecordDataIo from "../../filerw/recorddataio";

export default class SummarySetting extends Modal{
	plugin:MyPlugin
	get:Record<string, boolean>={}
	path:string
	chart_type='radar'

	constructor(app:App,plugin:MyPlugin,path:string) {
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
		if (this.plugin.settings.open_zu_output){
			this.renderZuAllList()
		}else {
			this.renderNormalAllList()
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
		new Setting(this.contentEl)
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
						io.addCharts(new_back,this.path,this.chart_type)
						this.close()
					})
			})
	}
}
