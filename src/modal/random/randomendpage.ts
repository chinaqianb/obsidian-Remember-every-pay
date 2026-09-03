import {App, Modal, Notice} from "obsidian";

export default class RandomEndPage extends Modal{
	d:Record<string, number>
	constructor(app:App,o:Record<string, number>) {
		super(app);
		this.d=o
	}
	onOpen(): Promise<void> | void {

		const { contentEl } = this;

		contentEl.empty();
		contentEl.setCssStyles({minHeight : '200px'})
		contentEl.setCssStyles({display : 'flex'})
		contentEl.setCssStyles({flexDirection : 'column'})
		contentEl.setCssStyles({justifyContent : 'center'})
		contentEl.setCssStyles({alignItems : 'center'})
		contentEl.setCssStyles({textAlign :'center'})


		contentEl.setText(`结果是:${handle_random(this.d)}`)
	}
}
function handle_random(data:Record<string, number>):string {
	let sum=0
	Object.values(data).forEach(e=>sum+=e)
	const result=getRandomInt(1,sum)
	// new Notice(`sum:${sum},result:${result}`)
	let r=0
	for (const [name,value]of Object.entries(data)){
		if (r<result&&result<=(r+=value)){
			return name
		}
	}
	return "error"
}
function getRandomInt(min: number, max: number): number {
	// Math.random()//好像是0-1的，不包括0-1
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
