import {App, SuggestModal} from "obsidian";
import MyPlugin from "../main";
import RecordDataIo from "../filerw/recorddataio";

export default class ChooseYear extends SuggestModal<string>{
	file:Record<string, string>
	plugin:MyPlugin
	fn:(value:string)=>void
	constructor(app:App,plugin:MyPlugin,fn:(value:string)=>void) {
		super(app);
		this.fn=fn
		this.plugin=plugin
		this.file=new RecordDataIo(this.app, plugin).getAllFile_Name_and_Path_List()

	}
    getSuggestions(query: string): string[] | Promise<string[]> {
		return Object.keys(this.file).filter(e=>e.toLowerCase().includes(query.toLowerCase()))
    }
    renderSuggestion(value: string, el: HTMLElement): void {
		el.createDiv({text:value.split('.')[0]})
    }
    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.fn(this.file[item] as string)
    }
}
