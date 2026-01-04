import {App, Modal, moment, Notice, Setting} from "obsidian";
import RecordDataIo, {ThirdM} from "../../filerw/recorddataio";
import MyPlugin from "../../main";
export interface SecondM{
	type:string
}
export default class InputPayModel extends Modal{
private static last:number=0
	plugin:MyPlugin
	constructor(app:App,plugin:MyPlugin,m:SecondM,date:string='o',path:string='o') {
		super(app);
		this.plugin=plugin
		let mon:number|string;
		new Setting(this.contentEl)
			.setName("金额")
			.addText((text)=>{
					text.onChange((value)=>{
						mon=value;
					})

			text.inputEl.addEventListener('keydown',(eve)=>{
				if (eve.key==='Enter'){
					eve.preventDefault()
					const now=moment.now()
					if (now-InputPayModel.last<2000) {

						return
					}
					InputPayModel.last=now;

					onenter()
				}
				})
			}).addExtraButton((btn)=>{
				btn.setIcon("check")
					.onClick(()=>{
						onenter()
					})
		})
		const onenter=()=> {
			if (mon===''){
				new Notice("金额为空!")
				return;
			}
			mon=<number>mon

			const third=[{type:m.type,pay:mon}]
			if (date!='o'&&path!='o')
				new RecordDataIo(this.app,this.plugin).addThatDateRecord(third.first()as ThirdM,date,path)
			else
			new RecordDataIo(this.app,this.plugin).addTodayNewRecord(third.first()as ThirdM)
			this.close();
		}
	}
}
