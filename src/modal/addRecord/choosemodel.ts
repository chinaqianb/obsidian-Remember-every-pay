import {App, Notice, Setting, SuggestModal} from "obsidian";
import addNewType from "./addnewtype";
import MyPlugin from "../../main";
import InputPayModel, {SecondM} from "./inputpaymodel";

export interface MyType{
	type:string
}
export default class ChooseModel extends SuggestModal<MyType>{

	private plugin:MyPlugin
	date:string
	path:string
	constructor(app:App,plugin:MyPlugin,date:string='o',path:string='o') {
		super(app);
		this.date=date
		this.path=path
		this.plugin=plugin;
		this.plugin.loadSettings()
		let my_type:MyType[]=[];
		this.plugin.settings.my_record.forEach(item=>{my_type.push({type:item})})
		this.setType(my_type)
	}


	my:MyType[]=[{type:"input-model-add"}];
	setType(my:MyType[]){
		 my.forEach(m=>this.my.push({type:m.type}))
	}
    renderSuggestion(value: MyType, el: HTMLElement): void {
		if (value.type==="input-model-add"){
			el.createEl('div',{text:"添加新的类型"})
			return;
		}
     el.createEl('div',{text:value.type})
    }
    onChooseSuggestion(item: MyType, evt: MouseEvent | KeyboardEvent): void {
		if (item.type==="input-model-add"){

			new addNewType(this.app,this.plugin).open();
			return;
		}
        //选中的操作
		// this.close()

		const first:SecondM={type:item.type}
		new InputPayModel(this.app,this.plugin,first,this.date,this.path).open()
    }
	getSuggestions(query: string): MyType[] {
		const input_model=this.my.find(item=>item.type=="input-model-add")
		const other=this.my.filter((type)=>
			type.type!="input-model-add"&&
			type.type.toLowerCase().includes(query.toLowerCase())
		)
		return input_model ? [input_model, ...other] : other;
	}


}
