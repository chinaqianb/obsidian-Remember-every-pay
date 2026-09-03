import {App, Notice, setIcon, SuggestModal} from "obsidian";
import RecordDataIo from "../../filerw/recorddataio";
import RememberEveryPay from "../../RememberEveryPay";
interface DateOneData {
	type:string
	value:string
}
export default class DeleteRecord extends SuggestModal<DateOneData>{
	data:DateOneData[]=[]
	plugin:RememberEveryPay
	choose:string
	path:string
	constructor(app:App, plugin:RememberEveryPay, choose:string, data:[string,number][], path:string) {
		super(app);
		this.plugin=plugin
		this.choose=choose
		for (const [k,v]of data){
			this.data.push({type:k,value:String(v)})
		}
		this.path=path
	}
    getSuggestions(query: string): DateOneData[] | Promise<DateOneData[]> {
       return this.data.filter(e=>e.type.toLowerCase().includes(query.toLowerCase())||e.value.includes(query))
    }
    renderSuggestion(value: DateOneData, el: HTMLElement): void {
		const div=el.createDiv({text:`${value.type}-${value.value}`})

		div.setCssStyles({display:'flex'})
		div.setCssStyles({justifyContent:'space-between'})
		div.setCssStyles({alignItems:'center'})


      const btn=div.createEl('button')
		setIcon(btn,'trash-2')
		btn.addEventListener('click',()=>{
			new RecordDataIo(this.app,this.plugin).deleteTheDateInfo(this.choose,this.path,value.type,Number(value.value))
			this.close()
		})
    }
    onChooseSuggestion(item: DateOneData, evt: MouseEvent | KeyboardEvent): void {

    }
	selectSuggestion(value: DateOneData, evt: MouseEvent | KeyboardEvent) {

	}
}
