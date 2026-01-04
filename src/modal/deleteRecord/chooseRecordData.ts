import {App, moment, SuggestModal} from "obsidian";
import MyPlugin from "../../main";
import DeleteRecord from "./deleteRecord";
import RecordDataIo from "../../filerw/recorddataio";

export default class ChooseRecordData extends SuggestModal<string>{
	date:string[]
	plugin:MyPlugin
	path:string
	constructor(app:App,plugin:MyPlugin,date:string[],path:string) {
		super(app);
		this.date=moveToFirst(date,moment().format('YYYY-MM-DD'))
		this.plugin=plugin
		this.path=path
	}
    getSuggestions(query: string): string[] | Promise<string[]> {
        return this.date.filter(e=>e.toLowerCase().includes(query.toLowerCase()))
    }
    renderSuggestion(value: string, el: HTMLElement): void {
		if (value.includes(moment().format('YYYY-MM-DD'))){
			el.createDiv({text:"今天 "+value})
			return;
		}
       el.createDiv({text:value})
    }
    async onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent): Promise<void> {
	new DeleteRecord(this.app,this.plugin,item,await new RecordDataIo(this.app, this.plugin).findDateBack(item,this.path),this.path).open()

    }

}
function moveToFirst<T>(arr: T[], target: T): T[] {
	// 创建副本以避免修改原数组
	const result = [...arr];
	const index = result.findIndex(item => item === target);

	if (index > 0) { // 如果元素存在且不在第一位
		const [removed] = result.splice(index, 1); // 移除元素
		result.unshift(removed as T); // 添加到开头
	}

	return result;
}
