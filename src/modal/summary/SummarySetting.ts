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
		this.renderAllList()

	}

	async renderAllList(){
		const io=new RecordDataIo(this.app,this.plugin)
		let data=await io.summaryBackData(this.plugin,this.path)
		for (const e of data.keys())
		{
			this.get[e]=true
			new Setting(this.contentEl)
				.setName(e)
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
}
