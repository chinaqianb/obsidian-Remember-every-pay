import {App, Modal, setIcon, Setting, SuggestModal} from "obsidian";
import {it} from "node:test";
import {text} from "node:stream/consumers";
import MyPlugin from "../../main";
import RecordDataIo from "../../filerw/recorddataio";
import ChooseModel from "../addRecord/choosemodel";
interface orData {
	type:string
	value:string
}
export default class FindOrWriteData extends SuggestModal<orData>{
	data:orData[]=[{type:"增加新的记录",value:''}]
	choose_date:string
	plugin:MyPlugin
	path:string
	constructor(app:App,plugin:MyPlugin,choose:string,date:[string,number][],path:string) {
		super(app);
		this.plugin=plugin
		for (const [k,v]of date){
			this.data.push({type:k,value:String(v)})
		}
		this.choose_date=choose
		this.path=path
	}
    getSuggestions(query: string): orData[] | Promise<orData[]> {
		return this.data.filter(e=>e.type.toLowerCase().includes(query.toLowerCase())||e.value.includes(query))
    }
    renderSuggestion(value: orData, el: HTMLElement): void {
		if (value.type==="增加新的记录"){
			el.createDiv({text:`${value.type}`})
			return;
		}
		el.createDiv({text:`${value.type}-${value.value}`})
	}
    onChooseSuggestion(item: orData, evt: MouseEvent | KeyboardEvent): void {
		if (item.type==="增加新的记录"){
			new ChooseModel(this.app,this.plugin,this.choose_date,this.path).open()
			return;
		}
		new WriteAndTurnData(this.app,item.type,item.value,this.plugin,this.choose_date,this.path).open()
    }
	// selectSuggestion(value: orData, evt: MouseEvent | KeyboardEvent) {
	// 	this.onChooseSuggestion(value,evt)
	// }
}
export class WriteAndTurnData extends Modal{
	constructor(app:App,type:string,value:string,plugin:MyPlugin,choose:string,path:string) {
		super(app);
		let data:[string,string]=[type,value]
		new Setting(this.contentEl)
			.setName("类型")

			.addText(t=>{
				t.setValue(type)
					.onChange(text=>data[0]=text)
			}).addExtraButton(btn=>btn.setIcon('check').onClick(()=>{new RecordDataIo(this.app,plugin).changeTheDateInfo(choose,path,type,Number(value),data[0],Number(data[1]));this.close()}))
		new Setting(this.contentEl)
			.setName("金额")
			.addText(t=>{
				t.setValue(value)
					.onChange(text=>data[1]=text)
			}).addExtraButton(btn=>btn.setIcon('check').onClick(()=>{new RecordDataIo(this.app,plugin).changeTheDateInfo(choose,path,type,Number(value),data[0],Number(data[1]));this.close()}))
	}

}
