import {App, Modal, Notice, setIcon, Setting, SuggestModal} from "obsidian";
import RandomPage from "./startrandompage";

interface RandomSection {
	sec:string
}
export default class RandomChoose extends SuggestModal<RandomSection>{
	data:RandomSection[]=[]
	all:Record<string, Record<string, number>>
	t_n:[number,number]
	constructor(app:App,data:Record<string, Record<string, number>>,t_n:[number,number]) {
		super(app);
		this.all=data
		this.t_n=t_n
		Object.keys(data).forEach(e=>this.data.push({sec:e}))
	}
    getSuggestions(query: string): RandomSection[] {
       return this.data.filter(e=>e.sec.toLowerCase().includes(query.toLowerCase()))
    }
    renderSuggestion(value: RandomSection, el: HTMLElement): void {
        el.createDiv({text:value.sec})
    }
    onChooseSuggestion(item: RandomSection, evt: MouseEvent | KeyboardEvent): void {
		new RandomPage(this.app,<Record<string, number>>this.all[item.sec],this.t_n).open()

    }


}
